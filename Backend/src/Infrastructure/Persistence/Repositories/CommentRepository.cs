using Microsoft.EntityFrameworkCore;
using SocialFlow.Infrastructure.Persistence.Repositories;

public class CommentRepository : BaseRepository<Comment>, ICommentRepository
{
    public CommentRepository(ApplicationDbContext context) : base(context)
    {
    }

    public override async Task AddAsync(Comment entity, CancellationToken ct = default)
    {

        using var transaction = await _context.Database.BeginTransactionAsync(ct);
        try
        {
            await _context.Comments.AddAsync(entity, ct);
            await _context.SaveChangesAsync(ct);
            await ExecuteClosureTableLogic(entity, ct);
            await transaction.CommitAsync(ct);
        }
        catch
        {
            await transaction.RollbackAsync(ct);
            throw;
        }

    }
    public async Task RebindSubtree(Comment entity)
    {
        if (entity.ReplyCount > 0)
        {
            // Lift level of child comment 1 level
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Delete relation of ancestor of comment and descendant of comment 
                await _context.Database.ExecuteSqlAsync($"""
                DELETE FROM comment_trees
                WHERE descendant_id IN (
                        SELECT descendant_id
                        FROM comment_trees
                        WHERE ancestor_id = {entity.Id}
                            AND descendant_id != ancestor_id
                    )
                    AND ancestor_id IN (
                        SELECT ancestor_id
                        FROM comment_trees
                        WHERE descendant_id = {entity.Id}
                            AND descendant_id != ancestor_id
                    )
                """);

                if (entity.ParentCommentId is not null)
                {

                    // Insert relation of ancestor of comment and descendant of comment 
                    await _context.Database.ExecuteSqlAsync($"""
                    INSERT INTO comment_trees (ancestor_id, descendant_id, depth)
                    SELECT super.ancestor_id,
                        sub.descendant_id,
                        super.depth + sub.depth + 1
                    FROM comment_trees AS super
                        JOIN comment_trees AS sub ON 1 = 1
                    WHERE sub.ancestor_id IN (
                            SELECT descendant_id
                            FROM comment_trees
                            WHERE ancestor_id = {entity.Id}
                                AND depth = 1
                        )
                        AND super.descendant_id = {entity.ParentCommentId}
                    """);
                }

                // Delete all tuple relation to comment
                await _context.Database.ExecuteSqlAsync($"""
                DELETE FROM comment_trees
                WHERE ancestor_id ={entity.Id}
                    OR descendant_id = {entity.Id}
                """);

                // Update parent for child
                await _context.Database.ExecuteSqlAsync($"""
                UPDATE comments
                SET parent_comment_id = {entity.ParentCommentId}, is_parent_deleted = true
                WHERE parent_comment_id = {entity.Id}
                """);

                if (entity.ParentCommentId is not null)
                {
                    // Update reply count of parent comment
                    var countAdjustment = entity.ReplyCount - 1;
                    await _context.Database.ExecuteSqlAsync($"""
                    UPDATE comments
                    SET reply_count = reply_count + {countAdjustment}
                    WHERE id ={entity.ParentCommentId}
                    """);
                }
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch (System.Exception)
            {
                await transaction.RollbackAsync();
                Console.WriteLine("Error occurred while deleting comment with id: " + entity.Id);
                throw;
            }
        }
    }


    public async Task<int> DecreaseReplyCountAsync(Guid id, int totalDecrease, CancellationToken cancellationToken)
    {
        return await _dbSet.
        Where(c => c.Id == id)
        .ExecuteUpdateAsync(s => s.SetProperty(
            c => c.ReplyCount,
            c => c.ReplyCount - totalDecrease
        ), cancellationToken);
    }

    public async Task<int> IncreaseReplyCountAsync(Guid id, CancellationToken cancellationToken)
    {
        return await _dbSet.
        Where(c => c.Id == id)
        .ExecuteUpdateAsync(s => s.SetProperty(
            c => c.ReplyCount,
            c => c.ReplyCount + 1
        ), cancellationToken);
    }

    private async Task ExecuteClosureTableLogic(Comment entity, CancellationToken ct)
    {
        if (entity.ParentCommentId != null)
        {
            await _context.Database.ExecuteSqlAsync($@"
            INSERT INTO comment_trees (ancestor_id, descendant_id, depth)
            SELECT ancestor_id, {entity.Id}, depth + 1
            FROM comment_trees
            WHERE descendant_id = {entity.ParentCommentId}
            UNION ALL
            SELECT {entity.Id}, {entity.Id}, 0", ct);
        }
        else
        {
            await _context.Database.ExecuteSqlAsync($@"
            INSERT INTO comment_trees (ancestor_id, descendant_id, depth)
            VALUES ({entity.Id}, {entity.Id}, 0)", ct);
        }
    }

    public async Task<Comment?> GetCommentDeletedByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Comments
        .IgnoreQueryFilters()
        .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
    }
}