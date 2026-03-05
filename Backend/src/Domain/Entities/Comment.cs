public class Comment : BaseEntity
{
    public Guid PostId { get; private set; }
    public Guid AuthorId { get; private set; }
    public Guid? ParentCommentId { get; private set; }
    public string Content { get; private set; } = string.Empty;

    public Post Post { get; private set; } = null!;
    public User Author { get; private set; } = null!;
    public Comment? ParentComment { get; set; } = null!;

    public virtual ICollection<Mention> Mentions { get; set; } = new List<Mention>();
    public virtual ICollection<CloudImage> Images { get; private set; } = new List<CloudImage>();

    public Comment() { }

    public Comment(Guid postId, Guid authorId, Guid? parentCommentId, string content)
    {
        PostId = postId;
        AuthorId = authorId;
        ParentCommentId = parentCommentId;
        Content = content;

        AddDomainEvent(new CommentCreatedEvent(Id, PostId, AuthorId));
    }

    public void UpdateContent(string newContent)
    {
        if (string.IsNullOrWhiteSpace(newContent))
        {
            throw new ArgumentException("Nội dung bình luận không được để trống.");
        }

        if (Content != newContent)
        {
            Content = newContent;
            UpdatedAt = DateTime.UtcNow;
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