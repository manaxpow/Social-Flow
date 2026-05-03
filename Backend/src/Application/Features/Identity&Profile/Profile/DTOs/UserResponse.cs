using AutoMapper;

public record UserResponse() : IMapFrom<User>
{
    public Guid Id { get; init; }
    public string Email { get; init; } = string.Empty;
    public string FullName { get; init; } = string.Empty;
    public DateTime DateOfBirth { get; init; }
    public Gender Gender { get; init; }
    public string? AvatarUrl { get; init; }
    public string? CoverUrl { get; init; }
    public string? Bio { get; init; }
    public DateTime CreatedAt { get; init; }
    public int FollowersCount { get; init; }
    public int FollowingCount { get; init; }

    void IMapFrom<User>.Mapping(Profile profile)
    {
        profile.CreateMap<User, UserResponse>()
            .ForMember(dest => dest.AvatarUrl, opt => opt.MapFrom(src => src.Avatar != null ? src.Avatar.Url : null))
            .ForMember(dest => dest.CoverUrl, opt => opt.MapFrom(src => src.Cover != null ? src.Cover.Url : null))
            .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => $"{src.FirstName} {src.LastName}"));
    }
}
