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

        // Transient
        services.AddTransient<IEmailService, EmailService>();
        return services;
    }
}