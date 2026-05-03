public interface ICommentRepository : IGenericRepository<Comment>
{
    Task<int> IncreaseReplyCountAsync(Guid id, CancellationToken cancellationToken = default);
    Task<int> DecreaseReplyCountAsync(Guid id, int totalDecrease, CancellationToken cancellationToken = default);
    Task<Comment?> GetCommentDeletedByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task RebindSubtree(Comment entity);
}
