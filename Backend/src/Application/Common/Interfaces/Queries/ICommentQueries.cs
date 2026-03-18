public interface ICommentQueries
{
    Task<CommentResponse> GetCommentDetailByIdAsync(Guid commentId);
    Task<PagedList<CommentResponse>> GetCommentsByPostIdAsync
    (Guid postId, int page, int pageSize, CancellationToken cancellationToken);

    Task<PagedList<CommentResponse>> GetCommentsByUserIdAsync
    (Guid userId, int page, int pageSize, CancellationToken cancellationToken);
}