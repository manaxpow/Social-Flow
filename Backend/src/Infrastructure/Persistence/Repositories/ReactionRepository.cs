using Microsoft.EntityFrameworkCore;
using SocialFlow.Infrastructure.Persistence.Repositories;

public class ReactionRepository : BaseRepository<Reaction>, IReactionRepository
{
    public ReactionRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<Reaction?> GetByUserAndTargetAsync(Guid userId, Guid targetId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .FirstOrDefaultAsync(r => r.UserId == userId && r.TargetId == targetId && !r.IsDeleted, cancellationToken);
    }
}
