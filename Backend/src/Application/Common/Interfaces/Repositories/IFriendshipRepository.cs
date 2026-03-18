public interface IFriendshipRepository : IGenericRepository<Friendship>
{
    Task<List<Guid>> GetFriendsAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<Friendship?> GetByUsersAsync(Guid userReceiveId, Guid userSendId, CancellationToken cancellationToken = default);
    Task<Friendship?> GetRelationBetweenUsersAsync(Guid userId1, Guid userId2, CancellationToken cancellationToken = default);
}