using Microsoft.EntityFrameworkCore;
using SocialFlow.Infrastructure.Persistence.Repositories;

public class OutboxRepository : BaseRepository<OutboxMessage>, IOutboxRepository
{
    public OutboxRepository(ApplicationDbContext context) : base(context)
    {
    }

    public Task<List<OutboxMessage>> GetUnpublishedMessagesAsync(int limit, CancellationToken cancellationToken = default)
    {
        return _dbSet.Where(m => m.ProcessedAt == null).Take(limit).ToListAsync(cancellationToken);
    }
}