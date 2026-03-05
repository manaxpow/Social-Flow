public interface IFriendshipRepository : IGenericRepository<Friendship>
{
    Task<List<Guid>> GetFriendsAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<Friendship?> GetByUsersAsync(Guid userReceiveId, Guid userSendId, CancellationToken cancellationToken = default);
}