using AutoMapper;
using MediatR;

namespace Shop.Application.Features.Placeholder.Commands.GetPostById;

public class GetPostByIdHandler : IRequestHandler<GetPostByIdQuery, Result<PostDetailResponse>>
{
    private readonly IMapper _mapper;
    private readonly IPostQueries _postQueries;

    public GetPostByIdHandler(IMapper mapper, IPostQueries postQueries)
    {
        _mapper = mapper;
        _postQueries = postQueries;
    }

    public async Task<Result<PostDetailResponse>> Handle(GetPostByIdQuery request, CancellationToken cancellationToken)
    {
        var post = await _postQueries.GetPostDetailAsync(request.Id, cancellationToken);
        if (post is null)
            return Result<PostDetailResponse>.Failure(PostErrors.NotFound);

        return Result<PostDetailResponse>.Success(post);
    }
}