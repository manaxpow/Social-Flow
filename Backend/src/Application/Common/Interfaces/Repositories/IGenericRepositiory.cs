public interface IGenericRepository<T> where T : class
{
    Task AddRangeAsync(IEnumerable<T> entities, CancellationToken cancellationToken = default);
    Task<T?> GetByIdAsync(Guid id = default, CancellationToken cancellationToken = default);
    Task<IEnumerable<T>> GetAllAsync();
    Task AddAsync(T entity, CancellationToken cancellationToken = default);
    void Update(T entity);
    Task Delete(T entity);
}