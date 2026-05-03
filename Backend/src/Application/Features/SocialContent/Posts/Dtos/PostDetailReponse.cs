using AutoMapper;

public sealed record PostDetailResponse : IMapFrom<Post>
{
    public Guid Id { get; init; }
    public string? Content { get; init; } = string.Empty;
    public PostType Type { get; init; } = PostType.Standard;
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }

    // Author information
    public AuthorDto Author { get; init; } = null!;

    // Media 
    public List<PostMediaDto> MediaItems { get; init; } = new();

    // Interaction Counts
    public int ReactionCount { get; init; }
    public int CommentCount { get; init; }
    public int ShareCount { get; init; }

    // Mentions
    public List<MentionDto> Mentions { get; init; } = new();

    // Sharing Logic
    public PostDetailResponse? SharedPost { get; init; }
    public bool IsShared => SharedPost != null;

    // Social Previews 
    public List<ReactType> TopReactTypes { get; init; } = new();

    public void Mapping(Profile profile)
    {
        profile.CreateMap<Post, PostDetailResponse>()
        .ForMember(dest => dest.SharedPost, opt => opt.MapFrom(src => src.SharedPost));
    }
};