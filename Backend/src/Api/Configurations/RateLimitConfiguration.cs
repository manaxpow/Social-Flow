using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;

public static class RateLimitConfiguration
{
    public static IServiceCollection AddRateLimitConfiguration(this IServiceCollection services)
    {
        services.AddRateLimiter(options =>
        {
            options.AddFixedWindowLimiter(policyName: "fixed", options =>
            {
                options.PermitLimit = 100;
                options.Window = TimeSpan.FromMinutes(1);
                options.QueueLimit = 2;
                options.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
            });

            options.OnRejected = async (context, token) =>
            {
                context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
                await context.HttpContext.Response.WriteAsync("Too many requests. Please try again later.", token);
            };
        });

        return services;
    }
}
