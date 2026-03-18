using Microsoft.EntityFrameworkCore;
using SocialFlow.Infrastructure.Persistence.Repositories;

public class FriendshipRepository : BaseRepository<Friendship>, IFriendshipRepository
{
    public FriendshipRepository(ApplicationDbContext context) : base(context)
    {
    }

    public Task<Friendship?> GetByUsersAsync(Guid userReceiveId, Guid userSendId, CancellationToken cancellationToken = default)
    {
        var id1 = userReceiveId < userSendId ? userReceiveId : userSendId;
        var id2 = userReceiveId < userSendId ? userSendId : userReceiveId;

        return _dbSet.FirstOrDefaultAsync(f => f.UserId1 == id1 && f.UserId2 == id2, cancellationToken);
    }

    public Task<List<Guid>> GetFriendsAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return _dbSet
            .Where(f => (f.UserId1 == userId || f.UserId2 == userId) && f.Status == FriendshipStatus.Accepted)
            .Select(f => f.UserId1 == userId ? f.UserId2 : f.UserId1)
            .ToListAsync(cancellationToken);
    }
    public async Task<Friendship?> GetRelationBetweenUsersAsync(Guid userId1, Guid userId2, CancellationToken cancellationToken = default)
    {
        var id1 = userId1 < userId2 ? userId1 : userId2;
        var id2 = userId1 < userId2 ? userId2 : userId1;

        return await _dbSet.FirstOrDefaultAsync(f => f.UserId1 == id1 && f.UserId2 == id2, cancellationToken);
    }
}