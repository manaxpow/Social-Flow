public sealed class Comment : AggregateRoot, IOwnable
{
    // Basic properties
    public Guid PostId { get; private set; }
    public Post Post { get; private set; } = null!;
    public Guid AuthorId { get; private set; }
    public User Author { get; private set; } = null!;
    public string? Content { get; private set; } = string.Empty;
    public CloudAsset? Media { get; private set; }

    // Optional parent comment for replies
    public Guid? ParentCommentId { get; private set; }
    public Comment? ParentComment { get; set; } = null!;

    // Counters for reactions and replies
    public int ReactionCount { get; private set; } = 0;
    public int ReplyCount { get; private set; } = 0;

    // Parent deleted flag - shows "[Comment] đã bị xóa" when parent comment is deleted
    public bool IsParentDeleted { get; private set; } = false;

    // Mentions
    private readonly List<Mention> _mentions = new();
    public IReadOnlyCollection<Mention> Mentions => _mentions.AsReadOnly();
    public Comment() { }

    public Comment(Guid postId, Guid authorId, Guid? parentCommentId, CloudAsset? media, string? content, List<Guid>? mentionedUserIds) : this()
    {
        PostId = postId;
        AuthorId = authorId;
        ParentCommentId = parentCommentId;
        Media = media;
        Content = content;
        if (mentionedUserIds != null)
        {
            foreach (var userId in mentionedUserIds)
            {
                _mentions.Add(Mention.CreateForComment(userId, Id));
            }
        }
    }

    public static Comment Create(Guid postId, Guid authorId, Guid? parentCommentId, CloudAsset? media, string? content, List<Guid>? mentionedUserIds)
    {
        if (string.IsNullOrWhiteSpace(content) && media == null)
            throw new ArgumentException("Comment must have either content or media");

        var comment = new Comment(postId, authorId, parentCommentId, media, content, mentionedUserIds);

        comment.AddDomainEvent(new CommentCreatedEvent(
            comment.Id,
            comment.PostId,
            comment.AuthorId,
            comment.ParentCommentId,
            comment.ParentCommentId,
            comment.Mentions.Select(m => m.UserId).ToList()));
        return comment;
    }

    public void UpdateContent(string? newContent)
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

    public void UpdateMedia(CloudAsset? newMedia)
    {
        // Don't set UpdatedAt if only reassigning the same value
        // This prevents UpdatedAt from being set during query mapping
        Media = newMedia;
    }

    public void UpdateMentions(List<Guid>? newMentionedUserIds)
    {
        var currentMentionedUserIds = _mentions.Select(m => m.UserId).ToHashSet();
        var newMentionedUserIdsSet = newMentionedUserIds != null ? new HashSet<Guid>(newMentionedUserIds) : new HashSet<Guid>();

        // Add new mentions
        foreach (var userId in newMentionedUserIdsSet)
        {
            if (!currentMentionedUserIds.Contains(userId))
            {
                AddMention(userId);
            }
        }

        // Remove old mentions
        foreach (var mention in _mentions.ToList())
        {
            if (!newMentionedUserIdsSet.Contains(mention.UserId))
            {
                _mentions.Remove(mention);
            }
        }

        UpdatedAt = DateTime.UtcNow;
    }

    public void AddMention(Guid mentionedUserId)
    {
        if (_mentions.Any(m => m.UserId == mentionedUserId))
            return;

        _mentions.Add(Mention.CreateForComment(mentionedUserId, Id));
    }

    public void IncrementReactionCount() => ReactionCount++;
    public void DecrementReactionCount() => ReactionCount = Math.Max(0, ReactionCount - 1);
    public void IncrementReplyCount() => ReplyCount++;
    public void DecrementReplyCount() => ReplyCount = Math.Max(0, ReplyCount - 1);

    public void Delete()
    {
        SoftDelete();
        AddDomainEvent(new CommentDeletedEvent(Id, PostId, ParentCommentId));
    }
}
