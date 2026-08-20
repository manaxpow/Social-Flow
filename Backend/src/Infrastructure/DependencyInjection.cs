using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(
          this IServiceCollection services,
          IConfiguration configuration)
    {
        services
            .AddPersistenceServices(configuration)
            .AddIdentityConfiguration(configuration)
            .AddBackgroundJobConfiguration(configuration)
            .AddCaching(configuration)
            .AddAuthorizationServices();

        // Singleton
        services.AddSingleton<IExceptionToProblemDetailsConverter, ExceptionConverter>();

        // Scoped
        services.AddScoped<IIdentityService, IdentityService>();
        services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
        services.AddScoped<IJobService, JobService>();
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.AddScoped<INotificationService, NotificationService>();
        services.AddScoped<IWebNotificationService, WebNotificationService>();
        services.AddScoped<IMediaService, CloudinaryMediaService>();
        // Transient
        services.AddTransient<IEmailService, EmailService>();

        // Options
        services.Configure<JwtSettings>(configuration.GetSection(JwtSettings.SectionName));
        services.Configure<EmailSettings>(configuration.GetSection("EmailSettings"));
        services.Configure<ClientSettings>(configuration.GetSection("ClientSettings"));
        services.Configure<CloudinarySettings>(configuration.GetSection("Cloudinary"));
        return services;
    }
}
