using Microsoft.EntityFrameworkCore;
using SocialFlow.Infrastructure.Extensions;
using SocialFlow.Infrastructure.Persistence.Repositories;

public class PostRepository : BaseRepository<Post>, IPostRepository
{

    public PostRepository(ApplicationDbContext context) : base(context)
    {
    }

    public Task<PagedList<PostDetailReponse>> GetNewsFeedAsync(Guid userId, int pageNumber, int pageSize, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }

    public Task<PagedList<PostDetailReponse>> GetPostsByUserIdAsync(Guid userId, int pageNumber, int pageSize, CancellationToken cancellationToken)
    {
        var query = _context.Posts
            .Where(p => p.AuthorId == userId)
            .OrderByDescending(p => p.CreatedAt)
            .Include(p => p.Author)
            .Include(p => p.Images)
            .Include(p => p.Mentions)
            .ThenInclude(m => m.User)
            .Select(p => new PostDetailReponse
            {
                Id = p.Id,
                Content = p.Content ?? string.Empty,
                MediaUrls = p.Images.Select(i => i.Url).ToList(),
                CreatedAt = p.CreatedAt,
                AuthorName = ConvertFullName.ToFullName(p.Author.FirstName, p.Author.LastName),
                AuthorAvatarUrl = p.Author.Avatar.Url,
                CommentCount = p.CommentCount,
                ReactionCount = p.ReactionCount,
                Mentions = p.Mentions.Select(m => new MentionResponse
                {
                    UserId = m.UserId,
                    FullName = ConvertFullName.ToFullName(m.User.FirstName, m.User.LastName),
                    AvatarUrl = m.User.Avatar.Url
                }).ToList()
            })
            .ToPagedListAsync(pageNumber, pageSize, cancellationToken);

        return query;
    }
}