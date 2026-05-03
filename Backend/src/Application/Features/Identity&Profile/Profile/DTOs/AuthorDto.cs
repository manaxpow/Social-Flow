using AutoMapper;

public record AuthorDto : IMapFrom<User>
{
    public Guid Id { get; init; }
    public string FullName { get; init; } = string.Empty;
    public string? AvatarUrl { get; init; }

    public void Mapping(Profile profile)
    {
        profile.CreateMap<User, AuthorDto>()
            .ForMember(d => d.FullName, opt => opt.MapFrom(s => $"{s.FirstName} {s.LastName}"))
            .ForMember(d => d.AvatarUrl, opt => opt.MapFrom(s => s.Avatar != null ? s.Avatar.Url : null));
    }
}