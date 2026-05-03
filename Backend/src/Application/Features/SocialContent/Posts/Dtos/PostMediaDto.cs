using AutoMapper;

public record PostMediaDto(
    Guid Id,
    string Url,
    string PublicId,
    MediaType MediaType, // Image, Video
    int Order
) : IMapFrom<PostMedia>
{
    private PostMediaDto() : this(Guid.Empty, string.Empty, string.Empty, MediaType.Image, 0) { }
    public void Mapping(Profile profile)
    {
        profile.CreateMap<PostMedia, PostMediaDto>()
            .ForMember(x => x.Id, opt => opt.MapFrom(x => x.Id))
            .ForMember(x => x.Url, opt => opt.MapFrom(x => x.Media.Url))
            .ForMember(x => x.PublicId, opt => opt.MapFrom(x => x.Media.PublicId))
            .ForMember(x => x.MediaType, opt => opt.MapFrom(x => x.Media.Type))
            .ForMember(x => x.Order, opt => opt.MapFrom(x => x.SortOrder));
    }
}
