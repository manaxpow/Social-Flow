using System.Net.Http.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

public abstract class CommandTestBase : IntegrationTestBase
{
    protected CommandTestBase(SocialFlowApiFactory factory) : base(factory)
    {
    }

    protected async Task<HttpResponseMessage> SendRequestAsync<T>(string url, T command)
    {
        return await Client.PostAsJsonAsync(url, command);
    }

    protected async Task<HttpResponseMessage> SendPatchAsync<T>(string url, T? command = default)
    {
        if (command == null)
        {
            return await Client.PatchAsync(url, null);
        }
        return await Client.PatchAsJsonAsync(url, command);
    }
    protected async Task AssertOutboxMessageCreatedAsync(string eventType)
    {
        var exists = await Context.OutboxMessages
            .AnyAsync(m => m.Type == eventType && m.ProcessedAt == null);

        Assert.True(exists, $"Expected an unprocessed outbox message of type '{eventType}' to exist.");
    }

    protected async Task WaitForConditionAsync(Func<Task<bool>> condition, int timeoutSeconds = 30)
    {
        var start = DateTime.UtcNow;
        while (DateTime.UtcNow - start < TimeSpan.FromSeconds(timeoutSeconds))
        {
            if (await condition()) return;
            await Task.Delay(200); // Wait 200ms before checking again
        }

        throw new TimeoutException("The background process did not complete within the expected time.");
    }
    protected async Task TriggerOutboxProcessingAsync()
    {
        using (var scope = _factory.Services.CreateScope())
        {
            var processor = scope.ServiceProvider.GetRequiredService<IOutboxProcessor>();
            await processor.Process();
        }

        using (var checkScope = _factory.Services.CreateScope())
        {
            var db = checkScope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var processedCount = await db.OutboxMessages
                .AsNoTracking()
                .CountAsync(m => m.ProcessedAt != null);

            Console.WriteLine($"[DB_CHECK] Total processed messages now: {processedCount}");
        }
    }
}