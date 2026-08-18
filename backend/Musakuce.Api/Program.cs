using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Security.Claims;
using System.Text;
using System.Threading.RateLimiting;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Options;
using System.Text.Json.Serialization;
using Musakuce.Api.Auth;
using Musakuce.Api.Authorization;
using Musakuce.Api.ExceptionHandling;
using Musakuce.Api.Filters;
using Musakuce.Api.Security;
using Musakuce.Api.Users;
using Musakuce.Application;
using Musakuce.Infrastructure;
using Musakuce.Infrastructure.Identity;
using Musakuce.Infrastructure.Media;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddControllers(options => options.Filters.Add<ValidationFilter>())
    .AddJsonOptions(options =>
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));

builder.Services.AddOpenApi();

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

// ---- Auth-adjacent API-layer registrations -----------------------------
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<Musakuce.Application.Abstractions.ICurrentActorContext, HttpCurrentActorContext>();
builder.Services.AddSingleton<IJwtTokenService, JwtTokenService>();
builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection(JwtOptions.SectionName));

builder.Services.AddScoped<IValidator<LoginRequest>, LoginRequestValidator>();
builder.Services.AddScoped<IValidator<CreateUserRequest>, CreateUserRequestValidator>();
builder.Services.AddScoped<IValidator<AssignRoleRequest>, AssignRoleRequestValidator>();
builder.Services.AddScoped<IValidator<ResetPasswordRequest>, ResetPasswordRequestValidator>();

// ---- JWT bearer authentication -------------------------------------------
// Fail-closed check happens eagerly (so a misconfigured production
// deployment refuses to start), but the actual TokenValidationParameters
// are resolved lazily from IOptions<JwtOptions> below — the same source
// JwtTokenService uses to sign tokens — rather than from a build-time-
// captured local variable, so the two can never drift out of sync (this
// also matters for WebApplicationFactory-based tests, whose configuration
// overrides only reach the post-build IOptions<T> resolution path).
var jwtSecretPresent = builder.Configuration["Jwt:Secret"];
if (string.IsNullOrWhiteSpace(jwtSecretPresent))
{
    if (builder.Environment.IsDevelopment())
    {
        // Dev-only fallback so the API still boots without extra setup.
        // Ephemeral: regenerated on every restart, which invalidates any
        // previously-issued tokens — expected in dev, never acceptable
        // in production (hence the hard failure below). Written back into
        // configuration so IOptions<JwtOptions> resolves the same value.
        builder.Configuration["Jwt:Secret"] =
            Convert.ToBase64String(System.Security.Cryptography.RandomNumberGenerator.GetBytes(64));
    }
    else
    {
        throw new InvalidOperationException(
            "Jwt:Secret (env var Jwt__Secret) is required outside Development. Refusing to start without it.");
    }
}

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer();

builder.Services.AddOptions<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme)
    .Configure<IOptions<JwtOptions>>((bearerOptions, jwtOptions) =>
    {
        var opts = jwtOptions.Value;
        if (string.IsNullOrWhiteSpace(opts.Secret))
            throw new InvalidOperationException("Jwt:Secret is not configured.");

        bearerOptions.RequireHttpsMetadata = !builder.Environment.IsDevelopment();
        bearerOptions.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = opts.Issuer,
            ValidateAudience = true,
            ValidAudience = opts.Audience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(opts.Secret)),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(1),
        };

        // Security-audit fix (§Phase 4) — the signature/expiry checks
        // above are the only validation a stateless JWT gets by default,
        // which means there was previously no way to invalidate a token
        // before it naturally expired (up to 12h later, per
        // Jwt:ExpiryHours). This adds exactly one more check: reject a
        // token whose `iat` predates the user's TokensValidAfter
        // watermark (see ApplicationUser.TokensValidAfter's own doc
        // comment for when that gets bumped — logout, password reset,
        // role change, account disable). One extra indexed
        // FindByIdAsync per authenticated request; every other request
        // property (roles, claims) still comes from the token itself,
        // not re-fetched, so this doesn't reintroduce a DB round trip
        // for authorization checks generally — only for confirming the
        // token hasn't been explicitly revoked.
        bearerOptions.Events = new JwtBearerEvents
        {
            OnTokenValidated = async context =>
            {
                var iatClaim = context.Principal?.FindFirst(JwtRegisteredClaimNames.Iat)?.Value;
                var userIdClaim = context.Principal?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (iatClaim is null || userIdClaim is null ||
                    !long.TryParse(iatClaim, out var iatUnixSeconds) || !Guid.TryParse(userIdClaim, out var userId))
                {
                    context.Fail("Token is missing required claims.");
                    return;
                }

                var userManager = context.HttpContext.RequestServices.GetRequiredService<UserManager<ApplicationUser>>();
                var user = await userManager.FindByIdAsync(userId.ToString());
                if (user is null)
                {
                    context.Fail("User no longer exists.");
                    return;
                }

                if (user.TokensValidAfter is { } validAfter && DateTimeOffset.FromUnixTimeSeconds(iatUnixSeconds) < validAfter)
                    context.Fail("Token has been revoked.");
            },
        };
    });

// ---- Policy-based authorization (one policy per Permissions.* constant) --
builder.Services.AddSingleton<IAuthorizationHandler, PermissionAuthorizationHandler>();
builder.Services.AddAuthorization(options =>
{
    foreach (var permission in Permissions.All)
        options.AddPolicy(permission, policy => policy.Requirements.Add(new PermissionRequirement(permission)));
});

// ---- Rate limiting ---------------------------------------------------
// Security-audit fix (§Phase 2): the audit found every public GET
// endpoint completely unthrottled (verified live — 10 rapid requests to
// /api/photos all returned 200), while login already had a working
// per-IP limiter. This adds a generous baseline that covers everything
// (GlobalLimiter, below) plus one more named policy for the anonymous
// write endpoints (public listing/submission creation) that sit between
// "read-only" and "login" in how much abuse they can cause.
//
// Partitioning key: prefer the authenticated user's id (from the JWT
// `sub` claim) over IP when present, so a handful of admin staff working
// from the same office network never share one budget — and so a
// public visitor's browsing never eats into an admin's. Falls back to
// the resolved client IP for anonymous traffic. This only works
// correctly once ASP.NET Core is told to trust nginx's X-Forwarded-For
// (see UseForwardedHeaders below) — without that, every request's
// RemoteIpAddress is nginx's own loopback address, which would make
// every "per-IP" policy here (and the pre-existing login/
// community-upload ones) accidentally global instead. Found while
// implementing this phase — not previously flagged by the audit.
static string ResolveRateLimitPartitionKey(HttpContext context)
{
    var userId = context.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
    if (!string.IsNullOrEmpty(userId)) return $"user:{userId}";
    return $"ip:{context.Connection.RemoteIpAddress}";
}

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    // Baseline covering every endpoint, including ones with no
    // [EnableRateLimiting] attribute at all (this is what closes the
    // audit finding for public GETs) — generous enough that normal
    // browsing (a page's Server Component doing 2-3 parallel API calls,
    // a visitor loading many pages per minute) never comes close, while
    // still capping unattended scraping/automation at a real ceiling.
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: ResolveRateLimitPartitionKey(context),
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 300,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0,
            }));

    options.OnRejected = async (rejectedContext, ct) =>
    {
        if (rejectedContext.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter))
            rejectedContext.HttpContext.Response.Headers.RetryAfter = ((int)retryAfter.TotalSeconds).ToString();

        rejectedContext.HttpContext.Response.ContentType = "application/problem+json";
        await rejectedContext.HttpContext.Response.WriteAsJsonAsync(new
        {
            status = StatusCodes.Status429TooManyRequests,
            title = "Too many requests",
            detail = "Rate limit exceeded. Please slow down and try again shortly.",
        }, ct);
    };

    options.AddPolicy("login", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: ResolveRateLimitPartitionKey(context),
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 10,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0,
            }));
    // Anonymous community photo uploads — tighter than login since each
    // request is heavier (image processing + storage I/O), still keyed
    // by IP so one visitor can't exhaust it for others.
    options.AddPolicy("community-upload", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: ResolveRateLimitPartitionKey(context),
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 10,
                Window = TimeSpan.FromMinutes(10),
                QueueLimit = 0,
            }));
    // New (§Phase 2) — the other two anonymous write surfaces the audit
    // flagged (public listing submissions, community submissions):
    // lighter than an image upload but still real DB writes landing in
    // a moderation queue, so a looser cap than community-upload but
    // tighter than the 300/min baseline.
    options.AddPolicy("anonymous-write", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: ResolveRateLimitPartitionKey(context),
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 20,
                Window = TimeSpan.FromMinutes(10),
                QueueLimit = 0,
            }));
});

var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
// Phase 15 §18: an empty allow-list already fails CLOSED (blocks every
// browser origin) — safe, but silently so. Outside Development this is
// almost certainly a forgotten Cors__AllowedOrigins__0 rather than an
// intentional "block everything" deployment, so fail loudly instead of
// shipping an API no browser can reach.
if (allowedOrigins.Length == 0 && !builder.Environment.IsDevelopment())
{
    throw new InvalidOperationException(
        "Cors:AllowedOrigins (env var Cors__AllowedOrigins__0, __1, ...) is required outside Development. Refusing to start without it.");
}

builder.Services.AddCors(options =>
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod()));

// Phase 15 §18: same fail-fast rationale as Jwt:Secret above — a blank
// media-storage credential currently only surfaces later, as a logged
// warning from MediaStorageBootstrapper, the first time something tries
// to use it. Outside Development that's too late to be useful.
var mediaStorageSection = builder.Configuration.GetSection(Musakuce.Infrastructure.Media.MediaStorageOptions.SectionName);
if (!builder.Environment.IsDevelopment())
{
    var missing = new[] { "Bucket", "AccessKey", "SecretKey" }
        .Where(key => string.IsNullOrWhiteSpace(mediaStorageSection[key]))
        .ToArray();
    if (missing.Length > 0)
    {
        throw new InvalidOperationException(
            $"MediaStorage:{string.Join(", MediaStorage:", missing)} (env vars MediaStorage__Bucket / __AccessKey / __SecretKey) " +
            "are required outside Development. Refusing to start without them.");
    }
}

var app = builder.Build();

// Phase 15 §3 — explicit, controlled Administrator bootstrap. Only runs
// when the process is launched with this exact argument (see
// infra/docker-compose.prod.yml's admin-bootstrap service, or
// `docker compose run --rm admin-bootstrap` locally) — never as part of
// ordinary startup, so a production container restarting/redeploying
// never re-triggers it. Building the WebApplication above does not bind
// a socket, so exiting here before app.Run() never accepts HTTP traffic.
if (args.Contains("--bootstrap-admin"))
{
    using var bootstrapScope = app.Services.CreateScope();
    var exitCode = await AdminBootstrap.RunAsync(bootstrapScope.ServiceProvider, app.Configuration, app.Logger);
    Environment.Exit(exitCode);
}

app.UseExceptionHandler();
app.UseSecurityHeaders();

// Security-audit fix (§Phase 2 prerequisite), corrected — without this,
// every request's Connection.RemoteIpAddress is wrong, which makes every
// "per-IP" rate-limit policy below accidentally global across all
// visitors instead of per-visitor.
//
// The first version of this fix trusted only IPAddress.Loopback,
// reasoning that nginx connects to 127.0.0.1:8081 (docker-compose.prod
// .yml's port binding). That reasoning was wrong and was caught by
// actually building the pinned image and testing it through the real
// `127.0.0.1:PORT:8080` publish pattern (not assumed): Docker's
// port-forwarding for a loopback-published port delivers the connection
// to the container from the bridge network's own gateway address (e.g.
// 172.21.0.1 for this project's `musakuce_default` network — confirmed
// via `docker network inspect` and, independently, by observing the
// container's own view of the peer) — never literally 127.0.0.1.
// Trusting only loopback meant ForwardedHeadersMiddleware silently
// never activated, and RemoteIpAddress silently stayed wrong for
// 100% of real requests. Proven with a live test: a forged
// X-Forwarded-For claiming a fresh visitor, sent on a connection whose
// real rate-limit budget was already exhausted, still got 429 instead
// of a fresh budget's 401 — the header was being ignored.
//
// Fix: trust the whole 172.16.0.0/12 block instead of one guessed
// address. This is Docker's entire private address-pool range for
// user-defined bridge networks (it auto-assigns each custom network,
// including this project's musakuce_default, a /16 somewhere in this
// range — 172.18.0.0/16, 172.21.0.0/16, etc. — and that specific
// choice isn't pinned anywhere in docker-compose.prod.yml today, so it
// can legitimately differ between a fresh `docker compose up` and the
// next one). Trusting the supernet is stable across that variation
// without needing to hardcode — and without needing a new environment
// variable — today's actual subnet.
//
// This is safe specifically *because* of this deployment's network
// topology, not despite it: the `api` container's port is published as
// `127.0.0.1:8081:8080` (loopback-only — confirmed unreachable from the
// public internet in the original audit's direct TCP probe), so the
// *only* things that can ever be the direct TCP peer of this container
// are (a) Docker's own port-forwarding machinery relaying nginx's
// loopback connection, which is what actually presents as the bridge
// gateway address, or (b) another process already running locally on
// this same VPS. Musakuce's and Observer.az's containers are on
// separate, non-routable Docker networks (verified in the original
// audit — no shared network, no cross-stack reachability) and neither
// can reach a *loopback-bound* port on the host at all regardless of
// which bridge subnet either one has, so trusting this whole range does
// not open a path for one stack to spoof headers into the other's
// containers. Nginx itself already resolves the true visitor IP from
// Cloudflare's CF-Connecting-IP header before setting X-Forwarded-For
// (see infra/nginx/musakuce.conf.template's set_real_ip_from block), so
// this is the last hop needed for RemoteIpAddress to be correct
// end-to-end. Loopback stays trusted too, for any non-Docker or
// host-networking deployment topology where the direct peer genuinely
// is 127.0.0.1.
var forwardedHeadersOptions = new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto,
};
forwardedHeadersOptions.KnownProxies.Add(IPAddress.Loopback);
forwardedHeadersOptions.KnownProxies.Add(IPAddress.IPv6Loopback);
forwardedHeadersOptions.KnownIPNetworks.Add(new System.Net.IPNetwork(IPAddress.Parse("172.16.0.0"), 12));
app.UseForwardedHeaders(forwardedHeadersOptions);

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors();
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Minimal container/orchestration health check — not a product feature.
// Liveness only: "is the process up and able to handle a request at
// all", deliberately independent of Postgres/R2/anything external, so
// a database outage never makes an otherwise-healthy process look dead
// and get killed/restarted for the wrong reason.
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

// Security-audit fix (§Phase 10) — readiness, as distinct from the
// liveness check above: "can this process actually serve a real
// request right now". docs/DEPLOYMENT.md §12 already flagged this
// project's original single `/health` endpoint as conflating the two,
// and named a DB-connectivity check as "a reasonable future
// enhancement" — this is that enhancement. `CanConnectAsync` opens a
// connection and confirms Postgres answers; it deliberately runs no
// query against application tables, so it stays a pure infrastructure
// check. Used by docker-compose.prod.yml's `api` healthcheck (updated
// alongside this) instead of `/health`, so Compose's own
// `depends_on: condition: service_healthy` — which already gates the
// frontend container's startup — now means what it should: "the API
// can reach its database," not just "the process didn't crash."
app.MapGet("/health/ready", async (Musakuce.Infrastructure.Data.MusakuceDbContext db, CancellationToken ct) =>
{
    try
    {
        var canConnect = await db.Database.CanConnectAsync(ct);
        return canConnect
            ? Results.Ok(new { status = "ok", database = "reachable" })
            : Results.Json(new { status = "unavailable", database = "unreachable" }, statusCode: StatusCodes.Status503ServiceUnavailable);
    }
    catch (Exception)
    {
        return Results.Json(new { status = "unavailable", database = "unreachable" }, statusCode: StatusCodes.Status503ServiceUnavailable);
    }
});

using (var scope = app.Services.CreateScope())
{
    await DevAdminSeeder.EnsureRolesSeededAsync(scope.ServiceProvider);
    if (app.Environment.IsDevelopment())
    {
        await DevAdminSeeder.SeedDevAdministratorAsync(
            scope.ServiceProvider, app.Configuration, app.Logger);
    }
    await MediaStorageBootstrapper.EnsureBucketAsync(scope.ServiceProvider);
}

app.Run();

/// <summary>Exposed so the integration test project can host this app via WebApplicationFactory.</summary>
public partial class Program;
