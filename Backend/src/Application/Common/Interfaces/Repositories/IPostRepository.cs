public interface IPostRepository : IGenericRepository<Post>
{
    Task<PagedList<PostDetailReponse>> GetPostsByUserIdAsync(Guid userId, int pageNumber, int pageSize, CancellationToken cancellationToken);
    Task<PagedList<PostDetailReponse>> GetNewsFeedAsync(Guid userId, int pageNumber, int pageSize, CancellationToken cancellationToken);
}