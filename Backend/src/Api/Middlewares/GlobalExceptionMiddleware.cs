using System.Text.Json;
using SocialFlow.Domain.Exceptions;
using Microsoft.AspNetCore.Mvc;

public class GlobalExceptionMiddleware(
    RequestDelegate next,
    ILogger<GlobalExceptionMiddleware> logger,
    IExceptionToProblemDetailsConverter converter)
{
    public async Task InvokeAsync(HttpContext context, IWebHostEnvironment env)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            var traceId = context.Items["CorrelationId"]?.ToString() ?? context.TraceIdentifier;

            // Log lỗi (giữ nguyên logic của bạn)
            if (ex is ValidationException)
                logger.LogInformation("Validation failed for request {TraceId}", traceId);
            else
                logger.LogError(ex, "Error ID: {TraceId}. Message: {Message}", traceId, ex.Message);

            var problemDetails = converter.Convert(ex, traceId);

            // --- ĐOẠN CẬP NHẬT ĐỂ DEBUG DỨT ĐIỂM ---
            if (env.IsDevelopment())
            {
                // Lấy InnerException sâu nhất (Nơi Postgres thực sự báo lỗi)
                var innerEx = ex;
                while (innerEx.InnerException != null) innerEx = innerEx.InnerException;

                problemDetails.Detail = $"[MESSAGE]: {ex.Message} | [INNER]: {innerEx.Message} | [STACK]: {ex.StackTrace}";
            }
            // ---------------------------------------

            context.Response.StatusCode = problemDetails.Status ?? StatusCodes.Status500InternalServerError;
            context.Response.ContentType = "application/problem+json";

            await context.Response.WriteAsJsonAsync(problemDetails, problemDetails.GetType(),
                options: null, contentType: "application/problem+json");
        }
    }
}