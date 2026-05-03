public interface ICommentQueries
{
    Task<CommentResponse> GetCommentDetailByIdAsync(Guid commentId);
    Task<PagedList<CommentResponse>> GetCommentsByPostIdAsync
    (Guid postId, int page, int pageSize, Guid currentUserId, Guid? parentCommentId, CancellationToken cancellationToken = default);

    Task<PagedList<CommentResponse>> GetCommentsByUserIdAsync
    (Guid userId, int page, int pageSize, CancellationToken cancellationToken);

    Task<PagedList<CommentResponse>> GetRepliesByCommentIdAsync
    (Guid commentId, int page, int pageSize, Guid currentUserId, CancellationToken cancellationToken = default);
}
