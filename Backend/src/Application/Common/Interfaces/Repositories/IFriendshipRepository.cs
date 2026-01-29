public interface IFriendshipRepository : IGenericRepository<Friendship>
{
    Task<List<Guid>> GetFriendsAsync(Guid userId, CancellationToken cancellationToken = default);
}