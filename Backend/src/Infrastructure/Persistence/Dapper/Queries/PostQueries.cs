using AutoMapper;
using AutoMapper.QueryableExtensions;
using Dapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using SocialFlow.Infrastructure.Extensions;
using SocialFlow.Infrastructure.Persistence.Repositories;

public class PostQueries : BaseRepository<Post>, IPostQueries
{
    private readonly IMapper _mapper;
    public PostQueries(ApplicationDbContext context, IMapper mapper) : base(context)
    {
        _mapper = mapper;
    }

    public Task<PagedList<PostDetailResponse>> GetNewsFeedAsync(Guid userId, int page, int pageSize, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }

    public async Task<PostDetailResponse?> GetPostDetailAsync(Guid postId, CancellationToken cancellationToken)
    {
        var post = await _dbSet
            .AsNoTracking()
            .Include(p => p.Author)
            .Include(p => p.MediaItems)
            .Include(p => p.Mentions)
                .ThenInclude(m => m.User)
            .FirstOrDefaultAsync(x => x.Id == postId, cancellationToken);

        var postDetail = _mapper.Map<PostDetailResponse>(post);
        return postDetail;
    }

    public async Task<PagedList<PostDetailResponse>> GetPostsByUserIdAsync(Guid userId, int page, int pageSize, CancellationToken cancellationToken)
    {
        var query = _dbSet
            .AsNoTracking()
            .Include(p => p.Author)
            .Include(p => p.MediaItems)
            .Include(p => p.Mentions)
                .ThenInclude(m => m.User)
            .Where(x => x.AuthorId == userId)
            .OrderByDescending(x => x.CreatedAt);

        var pagedList = await query.ToPagedListAsync(page, pageSize, cancellationToken);

        var items = _mapper.Map<List<PostDetailResponse>>(pagedList.Items);

        return new PagedList<PostDetailResponse>(
            items,
            pagedList.TotalCount,
            pagedList.CurrentPage,
            pagedList.PageSize);
    }

    public Task<PagedList<PostResponse>> GetSearchPostsAsync(string searchTerm, int page, int pageSize, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }
}