using Microsoft.AspNetCore.DataProtection.Repositories;

public interface IOutboxRepository : IGenericRepository<OutboxMessage>
{
    Task<List<OutboxMessage>> GetUnpublishedMessagesAsync(int limit, CancellationToken cancellationToken = default);
}