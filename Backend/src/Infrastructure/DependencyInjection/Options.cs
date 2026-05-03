using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

public static class SettingsDependencyInjection
{
    public static IServiceCollection AddSettings(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<JwtSettings>(configuration.GetSection(JwtSettings.SectionName));
        services.Configure<EmailSettings>(configuration.GetSection("EmailSettings"));
        services.Configure<ClientSettings>(configuration.GetSection("ClientSettings"));
        services.Configure<CloudinarySettings>(configuration.GetSection("Cloudinary"));
        return services;
    }
}