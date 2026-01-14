using System.Collections;
using Microsoft.Extensions.DependencyInjection;
using SocialFlow.Infrastructure.Persistence.Repositories;

public class UnitOfWork(ApplicationDbContext context, IServiceProvider serviceProvider) : IUnitOfWork
{
    private readonly ApplicationDbContext _context = context;
    private readonly IServiceProvider serviceProvider = serviceProvider;

    // Repositories
    public IUserRepository Users => serviceProvider.GetRequiredService<IUserRepository>();


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