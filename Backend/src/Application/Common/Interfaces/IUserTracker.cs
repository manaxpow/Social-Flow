public interface IUserTracker
{
    Task AddConnection(Guid userId, string connectionId);
    Task RemoveConnection(Guid userId, string connectionId);
    Task<bool> IsUserOnline(Guid userId);
    Task<IEnumerable<string>> GetConnectionsForUser(Guid userId);
}