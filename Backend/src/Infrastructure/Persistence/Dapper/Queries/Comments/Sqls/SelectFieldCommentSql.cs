public static class CommentQueriesSql
{
    public const string SelectCommentFields = """
        c.id,
        c.post_id,
        c.author_id,
        c.parent_comment_id,
        c.content,
        c.reaction_count,
        c.reply_count,
        c.is_parent_deleted,
        c.created_at,
        c.updated_at,
        c.media_url AS url,
        c.media_type AS type,
        u.id AS id,
        u.first_name,
        u.last_name,
        u.avatar_url,
        (
            SELECT react_type
            FROM reactions
            WHERE target_id = c.id
                AND target_type = 2
                AND user_id = @CurrentUserId
        ) AS user_reaction
        """;
}