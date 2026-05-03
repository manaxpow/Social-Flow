using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;


public static class Persistence
{
    public static IServiceCollection AddPersistenceServices(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        services.AddScoped<ConvertDomainEventsToOutboxMessagesInterceptor>();

        services.AddDbContext<ApplicationDbContext>((sp, options) =>
        {
            options.UseSnakeCaseNamingConvention();
            var interceptor = sp.GetRequiredService<ConvertDomainEventsToOutboxMessagesInterceptor>();

            options.AddInterceptors(interceptor);
            options.UseNpgsql(connectionString, b =>
            {
                b.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName);
                b.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery);
            });
        });


        services.AddScoped<IAppDbContext>(provider => provider.GetService<ApplicationDbContext>()!);
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IPostRepository, PostRepository>();
        services.AddScoped<ICommentRepository, CommentRepository>();
        services.AddScoped<IReactionRepository, ReactionRepository>();
        services.AddScoped<IFriendshipRepository, FriendshipRepository>();
        services.AddScoped<INotificationRepository, NotificationRepository>();
        services.AddScoped<IOutboxRepository, OutboxRepository>();


        // Dapper
        Dapper.DefaultTypeMap.MatchNamesWithUnderscores = true;
        services.AddSingleton<IDbConnectionFactory, DbConnectionFactory>();

        services.AddScoped<IPostQueries, PostQueries>();
        services.AddScoped<ICommentQueries, CommentQueries>();
        services.AddScoped<IReactionQueries, ReactionQueries>();
        services.AddScoped<IUserQuries, UserQueries>();

        return services;
    }
}