using Microsoft.Extensions.DependencyInjection;

public static class InfrastructureService
{
    public static IServiceCollection AddCoreInfrastructure(this IServiceCollection services)
    {
        // Singleton
        services.AddSingleton<IExceptionToProblemDetailsConverter, ExceptionConverter>();

        // Scoped
        services.AddScoped<IIdentityService, IdentityService>();
        services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
        services.AddScoped<IJobService, JobService>();
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.AddScoped<INotificationService, NotificationService>();
        services.AddScoped<IWebNotificationService, WebNotificationService>();
        // Transient
        services.AddTransient<IEmailService, EmailService>();
        return services;
    }
}