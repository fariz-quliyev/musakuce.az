using Amazon.Runtime;
using Amazon.S3;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Musakuce.Application.Abstractions;
using Musakuce.Infrastructure.Data;
using Musakuce.Infrastructure.Identity;
using Musakuce.Infrastructure.Media;

namespace Musakuce.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("Default")
            ?? throw new InvalidOperationException("Missing 'ConnectionStrings:Default' configuration.");

        services.AddDbContext<MusakuceDbContext>(options => options.UseNpgsql(connectionString));
        services.AddScoped<IMusakuceDbContext>(sp => sp.GetRequiredService<MusakuceDbContext>());

        // AddIdentityCore (not AddIdentity) — API-only, no cookie/UI middleware.
        // Sessions are stateless JWTs issued by AuthController; see
        // Musakuce.Api/Auth for token issuance and Program.cs for bearer
        // validation setup.
        services.AddIdentityCore<ApplicationUser>(options =>
            {
                options.Password.RequiredLength = 10;
                options.Password.RequireNonAlphanumeric = false;
                options.Password.RequireUppercase = true;
                options.Password.RequireDigit = true;
                options.Lockout.MaxFailedAccessAttempts = 5;
                options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
                options.User.RequireUniqueEmail = true;
            })
            .AddRoles<IdentityRole<Guid>>()
            .AddEntityFrameworkStores<MusakuceDbContext>()
            .AddSignInManager()
            .AddDefaultTokenProviders();

        // ---- Media storage (Phase 8) — S3-compatible, MinIO in dev -----
        services.AddOptions<MediaStorageOptions>()
            .Bind(configuration.GetSection(MediaStorageOptions.SectionName))
            .ValidateDataAnnotations();

        services.AddSingleton<IAmazonS3>(sp =>
        {
            var options = sp.GetRequiredService<Microsoft.Extensions.Options.IOptions<MediaStorageOptions>>().Value;
            var config = new AmazonS3Config
            {
                ForcePathStyle = options.ForcePathStyle,
                // AWSSDK.S3 4.x defaults to WHEN_SUPPORTED, which signs PutObject
                // with the STREAMING-AWS4-HMAC-SHA256-PAYLOAD-TRAILER chunked
                // encoding — Cloudflare R2's S3 API doesn't implement that mode
                // and rejects the request. WHEN_REQUIRED only attaches a request
                // checksum for operations that mandate one, avoiding the trailer
                // encoding entirely; verified against real R2 uploads.
                RequestChecksumCalculation = RequestChecksumCalculation.WHEN_REQUIRED,
            };
            if (!string.IsNullOrWhiteSpace(options.Endpoint))
                config.ServiceURL = options.Endpoint;
            else
                config.RegionEndpoint = Amazon.RegionEndpoint.GetBySystemName(options.Region);

            return new AmazonS3Client(new BasicAWSCredentials(options.AccessKey, options.SecretKey), config);
        });

        services.AddScoped<IMediaStorage, S3MediaStorage>();
        services.AddScoped<IImageProcessor, ImageSharpProcessor>();

        return services;
    }
}
