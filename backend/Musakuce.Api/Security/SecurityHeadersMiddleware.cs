namespace Musakuce.Api.Security;

/// <summary>
/// Security-audit fix (§Phase 1) — the audit found zero HTTP security
/// headers anywhere on the site, including on API responses. Nginx
/// proxies <c>/api/*</c> straight to this process (see
/// infra/nginx/musakuce.conf.template's <c>location /api/</c> block),
/// entirely bypassing the frontend's Next.js middleware.ts/next.config.ts
/// headers — so those two alone would leave every JSON API response
/// unprotected. This is the API-side half of the same fix.
///
/// A JSON API response is never itself rendered as HTML, so the CSP here
/// only needs to say "don't treat this as a page" (<c>default-src
/// 'none'; frame-ancestors 'none'</c>) rather than the frontend's much
/// more detailed script/style/img policy.
/// </summary>
public static class SecurityHeadersMiddleware
{
    public static IApplicationBuilder UseSecurityHeaders(this IApplicationBuilder app)
    {
        return app.Use(async (context, next) =>
        {
            context.Response.OnStarting(() =>
            {
                var headers = context.Response.Headers;
                headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains";
                headers["X-Content-Type-Options"] = "nosniff";
                headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
                headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=(), payment=(), usb=()";
                headers["X-Frame-Options"] = "DENY";
                headers["Content-Security-Policy"] = "default-src 'none'; frame-ancestors 'none'";
                return Task.CompletedTask;
            });

            await next(context);
        });
    }
}
