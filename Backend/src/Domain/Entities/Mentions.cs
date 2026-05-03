public sealed class Mention : Entity
{
    public Guid UserId { get; private set; }
    public User User { get; private set; } = null!;
    public Guid? PostId { get; private set; }
    public Post? Post { get; private set; }
    public Guid? CommentId { get; private set; }
    public Comment? Comment { get; private set; }
    public Mention() { }

    public static Mention CreateForPost(Guid userId, Guid postId)
    {
        return new Mention
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            PostId = postId
        };
    }

    public static Mention CreateForComment(Guid userId, Guid commentId)
    {
        return new Mention
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            CommentId = commentId
        };
    }
}