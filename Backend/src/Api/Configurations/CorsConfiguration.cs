public static class CorsConfiguration
{
    public const string PolicyName = "SocialFlowCorsPolicy";

    public static IServiceCollection AddCorsConfiguration(
        this IServiceCollection services,
        IConfiguration configuration,
        IHostEnvironment environment)
    {
        var configuredOrigins = configuration
            .GetSection("AllowedOrigins")
            .Get<string[]>()
            ?? [];

        services.AddCors(options =>
        {
            options.AddPolicy(PolicyName, policy =>
            {
                policy
                    .SetIsOriginAllowed(origin =>
                    {
                        var isConfiguredOrigin =
                            configuredOrigins.Contains(
                                origin,
                                StringComparer.OrdinalIgnoreCase);

                        if (isConfiguredOrigin)
                        {
                            return true;
                        }

                        if (!environment.IsDevelopment())
                        {
                            return false;
                        }

                        if (!Uri.TryCreate(
                                origin,
                                UriKind.Absolute,
                                out var uri))
                        {
                            return false;
                        }

                        var isLocalHost =
                            uri.Host is "localhost" or "127.0.0.1";

                        var isHttp =
                            uri.Scheme is "http" or "https";

                        return isLocalHost && isHttp;
                    })
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
            });
        });

        return services;
    }
}
