using Microsoft.EntityFrameworkCore;

public static class SyncMigration
{
    public static async Task<IApplicationBuilder> UseSyncMigration(this IApplicationBuilder app)
    {
        await using var scope = app.ApplicationServices.CreateAsyncScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        await dbContext.Database.MigrateAsync();
        return app;
    }
}
