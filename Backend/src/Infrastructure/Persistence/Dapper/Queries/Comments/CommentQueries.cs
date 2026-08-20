using Dapper;
using System.Data;

public class CommentQueries(IDbConnectionFactory dbConnectionFactory) : ICommentQueries
{
    private readonly IDbConnectionFactory _dbConnectionFactory = dbConnectionFactory;

    public async Task<CommentResponse> GetCommentDetailByIdAsync(Guid commentId)
    {
        using var connection = _dbConnectionFactory.CreateConnection();
        // TODO: Implement full comment detail query with author info, reactions, mentions
        throw new NotImplementedException();
    }

    public async Task<PagedList<CommentResponse>> GetCommentsByPostIdAsync(
    Guid postId,
    int page,
    int pageSize,
    Guid currentUserId,
    Guid? parentCommentId,
    CancellationToken cancellationToken = default)
    {
        using var connection = _dbConnectionFactory.CreateConnection();
        var offset = (page - 1) * pageSize;

        string sql;
        string countSql;

        if (parentCommentId == null)
        {
            sql = $"""
            SELECT {CommentQueriesSql.SelectCommentFields}
            FROM comments c
                INNER JOIN users u ON c.author_id = u.id
            WHERE c.post_id = @PostId
                AND is_deleted = false
                AND NOT EXISTS (
                    SELECT 1
                    FROM comment_trees ct
                    WHERE ct.descendant_id = c.id
                        AND ct.depth > 0
                )
            ORDER BY c.created_at ASC OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY
            """;

            countSql = """
            SELECT COUNT(*)
            FROM comments c
            WHERE c.post_id = @PostId
                AND is_deleted = false
                AND NOT EXISTS (
                    SELECT 1
                    FROM comment_trees ct
                    WHERE ct.descendant_id = c.id
                        AND ct.depth > 0
                )
            """;
        }
        else
        {
            sql = $"""
            SELECT {CommentQueriesSql.SelectCommentFields}
            FROM comments c
                INNER JOIN users u ON c.author_id = u.id
            WHERE c.post_id = @PostId
                AND c.parent_comment_id = @ParentCommentId
                AND is_deleted = false
            ORDER BY c.created_at ASC OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY
            """;

            countSql = """
            SELECT COUNT(*)
            FROM comments c
            WHERE c.post_id = @PostId
                AND c.parent_comment_id = @ParentCommentId
                AND is_deleted = false
            """;
        }

        var parameters = new
        {
            PostId = postId,
            Offset = offset,
            PageSize = pageSize,
            CurrentUserId = currentUserId,
            ParentCommentId = parentCommentId
        };

        var comments = await connection.QueryAsync<Comment, CloudAsset, CommentUser, CommentResponse>(
            sql,
            (comment, media, user) =>
            {
                comment.UpdateMedia(media);

                return new CommentResponse
                {
                    Id = comment.Id,
                    PostId = comment.PostId,
                    Author = new AuthorDto
                    {
                        Id = user.Id,
                        FullName = $"{user.FirstName} {user.LastName}",
                        AvatarUrl = user.AvatarUrl
                    },
                    Content = comment.Content ?? string.Empty,
                    Media = comment.Media,
                    ParentCommentId = comment.ParentCommentId,
                    ReactionsCount = comment.ReactionCount,
                    UserReaction = user.UserReaction,
                    ReplyCount = comment.ReplyCount,
                    IsParentDeleted = comment.IsParentDeleted,
                    CreatedAt = comment.CreatedAt,
                    UpdatedAt = comment.UpdatedAt
                };
            },
            parameters,
            splitOn: "url,id"); // splitOn tại cột 'id' của bảng Users

        var totalCount = await connection.ExecuteScalarAsync<int>(countSql, parameters);

        return new PagedList<CommentResponse>(comments, totalCount, page, pageSize);
    }

    public async Task<PagedList<CommentResponse>> GetCommentsByUserIdAsync(Guid userId, int page, int pageSize, CancellationToken cancellationToken)
    {
        using var connection = _dbConnectionFactory.CreateConnection();
        // TODO: Implement user comments query
        throw new NotImplementedException();
    }

    public async Task<PagedList<CommentResponse>> GetRepliesByCommentIdAsync(
        Guid commentId,
        int page,
        int pageSize,
        Guid currentUserId,
        CancellationToken cancellationToken = default)
    {
        using var connection = _dbConnectionFactory.CreateConnection();

        var offset = (page - 1) * pageSize;

        // Query for depth-1 replies using closure table
        // A depth-1 reply is a comment where there's a direct parent-child relationship with depth = 1
        var sql = $"""
            SELECT {CommentQueriesSql.SelectCommentFields}, parent.is_deleted as parent_is_deleted
            FROM comments c
                INNER JOIN users u ON c.author_id = u.id
                INNER JOIN comment_trees ct ON c.id = ct.descendant_id
                LEFT JOIN comments parent ON c.parent_comment_id = parent.id
            WHERE ct.ancestor_id = @CommentId
                AND ct.depth = 1
                AND c.is_deleted = false
            ORDER BY c.created_at ASC OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY
            """;

        var countSql = """
            SELECT COUNT(*)
            FROM comment_trees ct
                INNER JOIN comments c ON c.id = ct.descendant_id
            WHERE ct.ancestor_id = @CommentId
                AND ct.depth = 1
                AND c.is_deleted = false
            """;

        var parameters = new { CommentId = commentId, Offset = offset, PageSize = pageSize, CurrentUserId = currentUserId };

        var replies = await connection.QueryAsync<Comment, CloudAsset, CommentUser, CommentResponse>(
            sql,
            (comment, media, user) =>
            {
                comment.UpdateMedia(media);

                return new CommentResponse
                {
                    Id = comment.Id,
                    PostId = comment.PostId,
                    Author = new AuthorDto
                    {
                        Id = user.Id,
                        FullName = $"{user.FirstName} {user.LastName}",
                        AvatarUrl = user.AvatarUrl
                    },
                    Content = comment.Content ?? string.Empty,
                    Media = comment.Media,
                    ParentCommentId = comment.ParentCommentId,
                    ReactionsCount = comment.ReactionCount,
                    UserReaction = user.UserReaction,
                    ReplyCount = comment.ReplyCount,
                    CreatedAt = comment.CreatedAt,
                    UpdatedAt = comment.UpdatedAt,
                    IsParentDeleted = comment.IsParentDeleted
                };
            },
            parameters,
            splitOn: "url,id");

        var totalCount = await connection.ExecuteScalarAsync<int>(countSql, new { CommentId = commentId });

        return new PagedList<CommentResponse>(replies, totalCount, page, pageSize);
    }
}
