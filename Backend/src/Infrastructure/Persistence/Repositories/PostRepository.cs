using Microsoft.EntityFrameworkCore;
using SocialFlow.Infrastructure.Persistence.Repositories;

public class PostRepository : BaseRepository<Post>, IPostRepository
{

    public PostRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<bool> ExistsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .AnyAsync(p => p.Id == id, cancellationToken);
    }

    public async Task<Post?> GetByIdWithMediaAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(p => p.MediaItems)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }

    public async Task<int> IncreaseCommentCount(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(p => p.Id == id)
            .ExecuteUpdateAsync(s => s.SetProperty(
                c => c.CommentCount,
                c => c.CommentCount + 1
            ), cancellationToken);
    }
    public async Task<int> DecreaseCommentCount(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(p => p.Id == id)
            .ExecuteUpdateAsync(s => s.SetProperty(
                s => s.CommentCount,
                s => s.CommentCount - 1
            ), cancellationToken);
    }

}
