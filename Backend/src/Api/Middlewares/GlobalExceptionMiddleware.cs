using System.Text.Json;
using SocialFlow.Domain.Exceptions;

public class GlobalExceptionMiddleware(
    RequestDelegate next,
    ILogger<GlobalExceptionMiddleware> logger,
    IExceptionToProblemDetailsConverter converter)
{

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            var traceId = context.Items["CorrelationId"]?.ToString() ?? context.TraceIdentifier;
            if (ex is ValidationException)
            {
                logger.LogInformation("Validation failed for request {TraceId}", traceId);
            }
            else if (ex is AppException appEx)
            {
                logger.LogWarning(ex, "AppException occurred. Error ID: {TraceId}. Message: {Message}", traceId, appEx.Message);
            }
            else
            {
                logger.LogError(ex, "Error ID: {TraceId}. Message: {Message}", traceId, ex.Message);
            }

            var problemDetails = converter.Convert(ex, traceId);

            context.Response.StatusCode = problemDetails.Status ?? StatusCodes.Status500InternalServerError;
            context.Response.ContentType = "application/problem+json";

            await context.Response.WriteAsJsonAsync(problemDetails, problemDetails.GetType(),
            options: null, contentType: "application/problem+json");
        }
    }
}