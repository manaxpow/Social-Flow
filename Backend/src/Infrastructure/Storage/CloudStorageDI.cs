using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

public static class CloudStorage
{
    public static IServiceCollection AddCloudStorage(this IServiceCollection services, IConfiguration configuration)
    {
        var cloudinarySettings = configuration.GetSection("Cloudinary").Get<CloudinarySettings>()
            ?? throw new InvalidOperationException("Cloudinary is missing in configuration");

        services.AddSingleton(cloudinarySettings);

        services.AddScoped<IMediaService, CloudinaryMediaService>();

        return services;
    }
}