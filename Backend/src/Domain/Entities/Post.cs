using SocialFlow.Domain.Events;

public class Post : AggregateRoot, IOwnable
{
    public Guid AuthorId { get; private set; }
    public User Author { get; private set; } = null!;
    public PostType Type { get; private set; } = PostType.Standard;
    public string? Content { get; private set; } = string.Empty;

    // Interaction Count
    public int ReactionCount { get; private set; } = 0;
    public int CommentCount { get; private set; } = 0;
    public int ShareCount { get; private set; } = 0;

    // Sharing
    public Guid? SharedPostId { get; private set; }
    public Post? SharedPost { get; private set; }
    public bool IsShared => SharedPostId.HasValue;
    public virtual ICollection<Post> Shares { get; private set; } = new List<Post>();

    // Media
    public ICollection<PostMedia> MediaItems { get; private set; } = new List<PostMedia>();

    // Mentions
    private readonly List<Mention> _mentions = new();
    public IReadOnlyCollection<Mention> Mentions => _mentions.AsReadOnly();

    // Comments
    public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();

    public Post()
    {
    }

    public Post(Guid id, string? content, Guid authorId, IEnumerable<PostMedia>? mediaItems, Guid? sharedPostId, List<Guid>? mentionedUserIds)
    {
        if (string.IsNullOrWhiteSpace(content) && mediaItems == null)
            throw new ArgumentException("Post must have either content or media");

        Id = id;
        Content = content;
        AuthorId = authorId;
        MediaItems = mediaItems?.ToList() ?? new List<PostMedia>();
        SharedPostId = sharedPostId;
        CreatedAt = DateTime.UtcNow;

        _mentions = new List<Mention>();
        AddListMention(mentionedUserIds ?? new List<Guid>());
        AddDomainEvent(new PostCreatedEvent(Id, AuthorId, mentionedUserIds, sharedPostId));
    }

    public static Post CreateSharePost(Guid authorId, Guid sharedPostId, string? content, List<Guid> mentionedUserIds)
    {
        var post = new Post
        {
            Id = Guid.NewGuid(),
            AuthorId = authorId,
            SharedPostId = sharedPostId,
            Content = content,
            Type = PostType.Shared,
            CreatedAt = DateTime.UtcNow
        };
        post.AddListMention(mentionedUserIds);

        post.AddDomainEvent(new PostCreatedEvent(post.Id, authorId, mentionedUserIds, sharedPostId));
        return post;
    }

    public static Post CreateAvatarUpdatePost(Guid authorId, CloudAsset newAvatar)
    {
        var post = new Post
        {
            Id = Guid.NewGuid(),
            AuthorId = authorId,
            Type = PostType.AvatarUpdate,
            CreatedAt = DateTime.UtcNow
        };

        post.MediaItems.Add(new PostMedia(post.Id, newAvatar, 0));
        post.AddDomainEvent(new PostCreatedEvent(post.Id, authorId, new List<Guid>(), null));
        return post;
    }

    public static Post CreateCoverUpdatePost(Guid authorId, CloudAsset newCover)
    {
        var post = new Post
        {
            Id = Guid.NewGuid(),
            AuthorId = authorId,
            Type = PostType.CoverUpdate,
            CreatedAt = DateTime.UtcNow
        };

        post.MediaItems.Add(new PostMedia(post.Id, newCover, 0));
        post.AddDomainEvent(new PostCreatedEvent(post.Id, authorId, new List<Guid>(), null));
        return post;
    }

    public void AddListMention(IEnumerable<Guid> mentionedUserIds)
    {
        foreach (var userId in mentionedUserIds)
        {
            AddMention(userId);
        }
    }
    public void AddMention(Guid mentionedUserId)
    {
        if (_mentions.Any(m => m.UserId == mentionedUserId))
            return;

        _mentions.Add(Mention.CreateForPost(mentionedUserId, Id));
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

    public void UpdateMediaItems(IEnumerable<CloudAsset> incomingAssets)
    {
        var assets = incomingAssets.ToList();
        var currentUrl = incomingAssets.Select(a => a.Url).ToHashSet();
        var mediaToRemove = MediaItems.Where(m => !currentUrl.Contains(m.Media.Url)).ToList();
        foreach (var media in mediaToRemove)
        {
            MediaItems.Remove(media);
        }

        int sortOrder = 0;
        foreach (var asset in incomingAssets)
        {
            var existingMedia = MediaItems.FirstOrDefault(m => m.Media.Url == asset.Url);
            if (existingMedia != null)
            {
                existingMedia.UpdateMedia(asset, sortOrder);
            }
            else
            {
                MediaItems.Add(new PostMedia(this.Id, asset, sortOrder));
            }
            sortOrder++;
        }
        UpdatedAt = DateTime.UtcNow;
    }
}