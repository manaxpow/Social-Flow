public interface IPostQueries
{
    Task<PagedList<PostDetailResponse>> GetNewsFeedAsync(Guid userId, int page, int pageSize, CancellationToken cancellationToken);
    Task<PostDetailResponse?> GetPostDetailAsync(Guid postId, CancellationToken cancellationToken);

    Task<PagedList<PostDetailResponse>> GetPostsByUserIdAsync(Guid userId, int page, int pageSize, CancellationToken cancellationToken);

    Task<PagedList<PostResponse>> GetSearchPostsAsync(string searchTerm, int page, int pageSize, CancellationToken cancellationToken = default);
}