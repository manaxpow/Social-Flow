using SocialFlow.Domain.Events;

public class Post : BaseEntity
{
    public Guid AuthorId { get; set; }
    public User Author { get; set; } = null!;
    public string? Content { get; set; } = string.Empty;
    public string? MediaUrl { get; set; }
    public int ReactionCount { get; set; } = 0;
    public int CommentCount { get; set; } = 0;
    public Guid? SharedPostId { get; set; }
    public Post? SharedPost { get; set; }
    public bool IsShared => SharedPostId.HasValue;

    public List<ReactType> TopReactTypes { get; set; } = new();
    public List<CommentPreview> TopComments { get; set; } = new();
    public virtual ICollection<Mention> Mentions { get; set; } = new List<Mention>();
    public virtual ICollection<Post> Shares { get; set; } = new List<Post>();

    public virtual ICollection<Comment> Comments
    { get; set; } = new List<Comment>();

    public Post()
    {
    }

    public Post(Guid id, string content, Guid authorId, string? mediaUrl, Guid? sharedPostId, List<Guid> mentionedUserIds)
    {
        Id = id;
        Content = content;
        AuthorId = authorId;
        MediaUrl = mediaUrl;
        SharedPostId = sharedPostId;
        CreatedAt = DateTime.UtcNow;

        AddDomainEvent(new PostCreatedEvent(Id, AuthorId, mentionedUserIds, sharedPostId));
    }
}