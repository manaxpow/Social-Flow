using AutoMapper;
using MediatR;

namespace Shop.Application.Features.Placeholder.Commands.GetCommentsByPostId;

public class GetCommentsByPostIdHandler : IRequestHandler<GetCommentsByPostIdQuery, Result<PagedList<CommentResponse>>>
{
    private readonly IMapper _mapper;
    private readonly ICommentQueries _commentQueries;
    public GetCommentsByPostIdHandler(IMapper mapper, ICommentQueries commentQueries)
    {
        _mapper = mapper;
        _commentQueries = commentQueries;
    }

    public async Task<Result<PagedList<CommentResponse>>> Handle(GetCommentsByPostIdQuery request, CancellationToken cancellationToken)
    {
        var comments = await _commentQueries.GetCommentsByPostIdAsync(
            request.PostId,
            request.PageNumber,
            request.PageSize,
            cancellationToken);

        return Result<PagedList<CommentResponse>>.Success(_mapper.Map<PagedList<CommentResponse>>(comments));
    }
}