using Microsoft.EntityFrameworkCore;

namespace SocialFlow.Infrastructure.Persistence.Repositories;

public class BaseRepository<T>(ApplicationDbContext context) : IGenericRepository<T> where T : class
{
    protected readonly ApplicationDbContext _context = context;
    protected readonly DbSet<T> _dbSet = context.Set<T>();

    public async Task AddRangeAsync(IEnumerable<T> entities, CancellationToken cancellationToken = default)
        => await _dbSet.AddRangeAsync(entities, cancellationToken);

    public virtual async Task<T?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbSet.FindAsync(id, cancellationToken);
        if (entity is ISoftDeletable softDeletable && softDeletable.IsDeleted)
            return null;
        return entity;
    }

    public virtual async Task<IEnumerable<T>> GetAllAsync()
        => await _dbSet.ToListAsync();

    public virtual async Task AddAsync(T entity, CancellationToken cancellationToken = default)
        => await _dbSet.AddAsync(entity);

    public virtual void Update(T entity)
        => _dbSet.Update(entity);

    public virtual Task Delete(T entity)
    {
        _dbSet.Remove(entity);
        return Task.CompletedTask;
    }

}