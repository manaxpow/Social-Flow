using System.Reflection;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using SocialFlow.Application.Common.Behaviors;

namespace Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        var assembly = Assembly.GetExecutingAssembly();

        services.AddMediatR(cfg =>
        {
            cfg.RegisterServicesFromAssembly(assembly);
            cfg.AddOpenBehavior(typeof(PerformanceBehavior<,>));
            cfg.AddOpenBehavior(typeof(LoggingBehavior<,>));
            cfg.AddOpenBehavior(typeof(ValidatorBehavior<,>));
        });

        services.AddAutoMapper(cfg =>
        {
            cfg.AddMaps(assembly);
        }, assembly);

        services.AddValidatorsFromAssembly(assembly);
        return services;
    }
}
