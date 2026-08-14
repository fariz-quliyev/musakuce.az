using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Musakuce.Application.Common;

namespace Musakuce.Api.ExceptionHandling;

/// <summary>
/// Single place every unhandled exception funnels through — maps known
/// Application exceptions to the right status code and always responds
/// with RFC 7807 ProblemDetails, never a raw stack trace.
/// </summary>
public class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        var (statusCode, title) = exception switch
        {
            NotFoundException => (StatusCodes.Status404NotFound, "Resource not found"),
            InvalidMediaException => (StatusCodes.Status400BadRequest, "Invalid file"),
            MediaTooLargeException => (StatusCodes.Status413PayloadTooLarge, "File too large"),
            MediaInUseException => (StatusCodes.Status409Conflict, "Media still in use"),
            _ => (StatusCodes.Status500InternalServerError, "An unexpected error occurred"),
        };

        // Phase 14 §9: the known Application exceptions above are raised
        // with deliberately client-safe messages (see each type's own
        // doc comments) — but any *other* exception (Npgsql errors, IO
        // failures, etc.) reaching this fallback carries whatever
        // internal detail the underlying library put in .Message, which
        // must never reach the client. Only the log gets the real
        // exception; the response gets a fixed, generic detail.
        var isKnownSafeException = statusCode != StatusCodes.Status500InternalServerError;
        var detail = isKnownSafeException ? exception.Message : "An unexpected error occurred. Please try again.";

        if (!isKnownSafeException)
            logger.LogError(exception, "Unhandled exception processing {Method} {Path}",
                httpContext.Request.Method, httpContext.Request.Path);

        httpContext.Response.StatusCode = statusCode;
        await httpContext.Response.WriteAsJsonAsync(new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = detail,
            Instance = httpContext.Request.Path,
        }, cancellationToken);

        return true;
    }
}
