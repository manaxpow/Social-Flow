using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.DependencyInjection;

public static class Authorization
{
    public static IServiceCollection AddAuthorizationServices(this IServiceCollection services)
    {
        services.AddSingleton<IAuthorizationHandler, ResourceOwnerHandler>();

        services.AddSingleton<IAuthorizationHandler, AdminHandler>();

        return services;
    }
}