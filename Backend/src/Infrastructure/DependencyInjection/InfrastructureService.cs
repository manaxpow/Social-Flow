using Microsoft.Extensions.DependencyInjection;

public static class InfrastructureService
{
    public static IServiceCollection AddCoreInfrastructure(this IServiceCollection services)
    {
        services.AddSingleton<IExceptionToProblemDetailsConverter, ExceptionConverter>();
        services.AddScoped<IIdentityService, IdentityService>();
        services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
        services.AddTransient<IEmailService, EmailService>();
        services.AddScoped<IJobService, JobService>();
        return services;
    }
}