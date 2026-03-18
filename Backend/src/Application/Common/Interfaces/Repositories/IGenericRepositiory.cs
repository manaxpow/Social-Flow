public interface IGenericRepository<T> where T : class
{
    Task AddRangeAsync(IEnumerable<T> entities);
    Task<T?> GetByIdAsync(Guid id);
    Task<IEnumerable<T>> GetAllAsync();
    Task AddAsync(T entity);
    void Update(T entity);
    void Delete(T entity);
}