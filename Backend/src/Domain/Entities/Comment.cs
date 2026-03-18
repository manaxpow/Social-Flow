public class Comment : AggregateRoot
{
    public Guid PostId { get; private set; }
    public Guid AuthorId { get; private set; }
    public Guid? ParentCommentId { get; private set; }
    public string Content { get; private set; } = string.Empty;

    public Post Post { get; private set; } = null!;
    public User Author { get; private set; } = null!;
    public Comment? ParentComment { get; set; } = null!;

    public virtual ICollection<Mention> Mentions { get; set; } = new List<Mention>();

    public Comment() { }

    public Comment(Guid postId, Guid authorId, Guid? parentCommentId, string content)
    {
        PostId = postId;
        AuthorId = authorId;
        ParentCommentId = parentCommentId;
        Content = content;

        AddDomainEvent(new CommentCreatedEvent(Id, PostId, AuthorId));
    }
}