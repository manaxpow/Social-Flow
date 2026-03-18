using AutoMapper;
using MediatR;

namespace Shop.Application.Features.Placeholder.Commands.GetPostById;

public class GetPostByIdHandler : IRequestHandler<GetPostByIdQuery, Result<PostResponse>>
{
    private readonly IMapper _mapper;
    private readonly IPostQueries _postQueries;

    public GetPostByIdHandler(IMapper mapper, IPostQueries postQueries)
    {
        _mapper = mapper;
        _postQueries = postQueries;
    }

    public async Task<Result<PostResponse>> Handle(GetPostByIdQuery request, CancellationToken cancellationToken)
    {
        var post = await _postQueries.GetPostDetailAsync(request.Id, cancellationToken);
        return Result<PostResponse>.Success(_mapper.Map<PostResponse>(post));
    }
}