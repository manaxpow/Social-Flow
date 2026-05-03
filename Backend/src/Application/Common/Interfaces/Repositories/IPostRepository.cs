public interface IPostRepository : IGenericRepository<Post>
{
    Task<Post?> GetByIdWithMediaAsync(Guid id, CancellationToken cancellationToken = default);

    Task<bool> ExistsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<int> IncreaseCommentCount(Guid id, CancellationToken cancellationToken = default);
    Task<int> DecreaseCommentCount(Guid id, CancellationToken cancellationToken = default);
}
