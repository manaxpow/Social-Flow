public interface IUnitOfWork : IDisposable
{
    IUserRepository Users { get; }
    IPostRepository Posts { get; }
    ICommentRepository Comments { get; }
    IReactionRepository Reactions { get; }
    IFriendshipRepository Friendships { get; }
    INotificationRepository Notifications { get; }
    IOutboxRepository OutboxMessages { get; }

    IGenericRepository<T> Repository<T>() where T : class;
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    Task BeginTransactionAsync();
    Task CommitTransactionAsync();
    Task RollbackTransactionAsync();
}