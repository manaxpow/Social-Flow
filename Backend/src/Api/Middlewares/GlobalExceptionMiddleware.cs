using System.Text.Json;

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
            if (ex is AppException appEx)
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

            var jsonResponse = JsonSerializer.Serialize(problemDetails, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull
            });

            await context.Response.WriteAsync(jsonResponse);
        }
    }
}