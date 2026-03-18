using Dapper;
using Microsoft.Extensions.Options;

public class PostQueries : IPostQueries
{
    private readonly IDbConnectionFactory _dbConnectionFactory;

    public PostQueries(IDbConnectionFactory dbConnectionFactory)
    {
        _dbConnectionFactory = dbConnectionFactory;
    }

    public Task<PagedList<PostResponse>> GetNewsFeedAsync(Guid userId, int page, int pageSize, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }

    public Task<PostResponse?> GetPostDetailAsync(Guid postId, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }

    public Task<PagedList<PostResponse>> GetPostsByUserIdAsync(Guid userId, int page, int pageSize, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }

    public Task<PagedList<PostResponse>> GetSearchPostsAsync(string searchTerm, int page, int pageSize, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }
}