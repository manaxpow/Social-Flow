using Microsoft.EntityFrameworkCore;
using SocialFlow.Infrastructure.Persistence.Repositories;

public class FriendshipRepository : BaseRepository<Friendship>, IFriendshipRepository
{
    public FriendshipRepository(ApplicationDbContext context) : base(context)
    {
    }

    public Task<List<Guid>> GetFriendsAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        // need to check the relations opposite is not blocked
        return _dbSet.Where(f => f.UserId1 == userId && f.Status == FriendshipStatus.Accepted)
                    .Select(f => f.UserId2)
                    .ToListAsync(cancellationToken);
    }
}