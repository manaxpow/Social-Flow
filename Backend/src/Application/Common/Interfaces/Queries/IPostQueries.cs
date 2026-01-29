public interface IPostQueries
{
    Task<PagedList<PostResponse>> GetNewsFeedAsync(Guid userId, int page, int pageSize, CancellationToken cancellationToken);
    Task<PostResponse?> GetPostDetailAsync(Guid postId, CancellationToken cancellationToken);

    Task<PagedList<PostResponse>> GetPostsByUserIdAsync(Guid userId, int page, int pageSize, CancellationToken cancellationToken);

    Task<PagedList<PostResponse>> GetSearchPostsAsync(string searchTerm, int page, int pageSize, CancellationToken cancellationToken = default);
}