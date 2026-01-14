using Microsoft.OpenApi;

public static class SwaggerExtension
{
    public static IServiceCollection AddSwaggerDocumentaion(this IServiceCollection services)
    {
        services.AddSwaggerGen(options =>
                {
                    options.SwaggerDoc("v1", new OpenApiInfo
                    {
                        Title = "SocialFlow API",
                        Version = "v1",
                        Description = "Hệ thống Backend cho mạng xã hội SocialFlow - .NET 10 Clean Architecture"
                    });
                    options.AddSecurityDefinition("CookieAuth", new OpenApiSecurityScheme
                    {
                        Type = SecuritySchemeType.ApiKey,
                        In = ParameterLocation.Cookie,
                        Name = "refreshToken", // Name of your cookie
                        Description = "Cookie-based Refresh Token"
                    });
                });



        return services;
    }
}