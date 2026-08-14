using System.Text;
using System.Threading.RateLimiting;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Options;
using System.Text.Json.Serialization;
using Musakuce.Api.Auth;
using Musakuce.Api.Authorization;
using Musakuce.Api.ExceptionHandling;
using Musakuce.Api.Filters;
using Musakuce.Api.Users;
using Musakuce.Application;
using Musakuce.Infrastructure;
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
    });

// ---- Policy-based authorization (one policy per Permissions.* constant) --
builder.Services.AddSingleton<IAuthorizationHandler, PermissionAuthorizationHandler>();
builder.Services.AddAuthorization(options =>
{
    foreach (var permission in Permissions.All)
        options.AddPolicy(permission, policy => policy.Requirements.Add(new PermissionRequirement(permission)));
});

// ---- Login rate limiting (in addition to Identity's own account lockout) -
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("login", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
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
            partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 10,
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
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

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
