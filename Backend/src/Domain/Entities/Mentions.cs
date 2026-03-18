public class Mention : Entity
{
    public Guid UserId { get; private set; }
    public User User { get; private set; } = null!;
    public Guid? PostId { get; private set; }
    public Post? Post { get; private set; }
    public Guid? CommentId { get; private set; }
    public Comment? Comment { get; private set; }
    public Mention() { }

    public Mention(Guid userId, Guid? postId, Guid? commentId)
    {
        UserId = userId;
        PostId = postId;
        CommentId = commentId;
    }
}