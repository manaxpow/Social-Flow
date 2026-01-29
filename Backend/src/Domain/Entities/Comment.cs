public class Comment : BaseEntity
{
    public Guid PostId { get; set; }
    public Guid AuthorId { get; set; }
    public Guid? ParentCommentId { get; set; }
    public string Content { get; set; } = string.Empty;

    public Post Post { get; set; } = null!;
    public User Author { get; set; } = null!;
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