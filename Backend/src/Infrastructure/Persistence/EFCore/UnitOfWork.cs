using System.Collections;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using SocialFlow.Infrastructure.Persistence.Repositories;

public class UnitOfWork(ApplicationDbContext context, IServiceProvider serviceProvider) : IUnitOfWork
{
    private readonly ApplicationDbContext _context = context;
    private readonly IServiceProvider serviceProvider = serviceProvider;

    public DbContext Context => _context;

    // Repositories
    public IUserRepository Users => serviceProvider.GetRequiredService<IUserRepository>();
    public IPostRepository Posts => serviceProvider.GetRequiredService<IPostRepository>();
    public ICommentRepository Comments => serviceProvider.GetRequiredService<ICommentRepository>();
    public IReactionRepository Reactions => serviceProvider.GetRequiredService<IReactionRepository>();
    public IFriendshipRepository Friendships => serviceProvider.GetRequiredService<IFriendshipRepository>();
    public INotificationRepository Notifications => serviceProvider.GetRequiredService<INotificationRepository>();
    public IMentionRepository Mentions => serviceProvider.GetRequiredService<IMentionRepository>();
    public IOutboxRepository OutboxMessages => serviceProvider.GetRequiredService<IOutboxRepository>();
    // Generic repository
    public IGenericRepository<T> Repository<T>() where T : class
    {
        return new BaseRepository<T>(_context);
    }
    public async Task BeginTransactionAsync()
    {
        await _context.Database.BeginTransactionAsync();
    }

    public async Task CommitTransactionAsync()
    {
        await _context.Database.CommitTransactionAsync();
    }
    public Task RollbackTransactionAsync()
    {
        return _context.Database.RollbackTransactionAsync();
    }

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return _context.SaveChangesAsync(cancellationToken);
    }

    public void Dispose()
    {
        _context.Dispose();
        GC.SuppressFinalize(this);
    }

}