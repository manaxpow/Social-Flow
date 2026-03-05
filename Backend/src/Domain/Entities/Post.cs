using SocialFlow.Domain.Events;

public class Post : BaseEntity
{
    public Guid AuthorId { get; private set; }
    public User Author { get; private set; } = null!;
    public string? Content { get; private set; } = string.Empty;
    public int ReactionCount { get; private set; } = 0;
    public int CommentCount { get; private set; } = 0;
    public Guid? SharedPostId { get; private set; }
    public Post? SharedPost { get; private set; }
    public bool IsShared => SharedPostId.HasValue;

    public List<ReactType> TopReactTypes { get; private set; } = new();
    public List<CommentPreview> TopComments { get; private set; } = new();
    public virtual ICollection<Mention> Mentions { get; private set; } = new List<Mention>();
    public virtual ICollection<Post> Shares { get; private set; } = new List<Post>();

    public virtual ICollection<CloudImage> Images { get; private set; } = new List<CloudImage>();

    public virtual ICollection<Comment> Comments
    { get; set; } = new List<Comment>();

    public Post()
    {
    }

    public Post(Guid id, string content, Guid authorId, Guid? sharedPostId, List<Guid> mentionedUserIds)
    {
        Id = id;
        Content = content;
        AuthorId = authorId;
        SharedPostId = sharedPostId;
        CreatedAt = DateTime.UtcNow;

        AddDomainEvent(new PostCreatedEvent(Id, AuthorId, mentionedUserIds, sharedPostId));
    }

    public void UpdateContent(string? newContent)
    {
        if (string.IsNullOrWhiteSpace(newContent))
        {
            throw new ArgumentException("Nội dung bài viết không được để trống.");
        }

        if (Content != newContent)
        {
            Content = newContent;
            UpdatedAt = DateTime.UtcNow;
        }
    }

    public void UpdateMentions(IEnumerable<Mention> newMentions)
    {
        Mentions.Clear();
        foreach (var mention in newMentions)
        {
            Mentions.Add(mention);
        }
    }

    public void AddImages(IEnumerable<CloudImage> newImages)
    {
        foreach (var img in newImages)
        {
            Images.Add(img);
        }
        UpdatedAt = DateTime.UtcNow;
    }

    public void ClearImages()
    {
        Images.Clear();
        UpdatedAt = DateTime.UtcNow;
    }
}