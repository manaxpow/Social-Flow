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
            .AddSettings(configuration)
            .AddCoreInfrastructure()
            .AddBackgroundJobConfiguration(configuration)
            .AddCaching(configuration)
            .AddAuthorizationServices();

        return services;
    }
}
