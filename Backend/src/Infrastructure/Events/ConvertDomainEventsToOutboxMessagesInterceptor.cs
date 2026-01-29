using Microsoft.EntityFrameworkCore.Diagnostics;
using Newtonsoft.Json;

public class ConvertDomainEventsToOutboxMessagesInterceptor : SaveChangesInterceptor
{
    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken ct = default)
    {
        var dbContext = eventData.Context;
        if (dbContext is null) return base.SavingChangesAsync(eventData, result, ct);

        var outboxMessages = dbContext.ChangeTracker
            .Entries<BaseEntity>()
            .Select(x => x.Entity)
            .SelectMany(entity =>
            {
                var events = entity.GetDomainEvents().ToList();
                entity.ClearDomainEvents();
                return events;
            })
            .Select(domainEvent => new OutboxMessage(
                domainEvent.GetType().Name,
               JsonConvert.SerializeObject(domainEvent, new JsonSerializerSettings
               {
                   TypeNameHandling = TypeNameHandling.All
               })))
            .ToList();

        dbContext.Set<OutboxMessage>().AddRange(outboxMessages);
        return base.SavingChangesAsync(eventData, result, ct);
    }
}