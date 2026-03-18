public class CommentQueries(IDbConnectionFactory dbConnectionFactory) : ICommentQueries
{
    private readonly IDbConnectionFactory _dbConnectionFactory = dbConnectionFactory;

    public Task<CommentResponse> GetCommentDetailByIdAsync(Guid commentId)
    {
        throw new NotImplementedException();
    }

    public Task<PagedList<CommentResponse>> GetCommentsByPostIdAsync(Guid postId, int page, int pageSize, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }

    public Task<PagedList<CommentResponse>> GetCommentsByUserIdAsync(Guid userId, int page, int pageSize, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}