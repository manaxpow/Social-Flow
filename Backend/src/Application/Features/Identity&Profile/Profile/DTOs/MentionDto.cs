using AutoMapper;

public record MentionDto : IMapFrom<Mention>
{
    public Guid UserId { get; init; }
    public string FullName { get; init; } = string.Empty;

    public void Mapping(Profile profile)
    {
        profile.CreateMap<Mention, MentionDto>()
            .ForMember(x => x.UserId, opt => opt.MapFrom(x => x.User.Id))
            .ForMember(x => x.FullName, opt => opt.MapFrom(x => $"{x.User.FirstName} {x.User.LastName}"));
    }
}