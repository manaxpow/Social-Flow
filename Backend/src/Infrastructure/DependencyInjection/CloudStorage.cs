using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

public static class CloudStorage
{
    public static IServiceCollection AddCloudStorage(this IServiceCollection services, IConfiguration configuration)
    {
        var cloudinarySettings = configuration.GetSection("Cloudinary").Get<CloudinarySettings>();
        services.AddSingleton(cloudinarySettings);

        services.AddScoped<IMediaService, CloudinaryMediaService>();

        return services;
    }
}