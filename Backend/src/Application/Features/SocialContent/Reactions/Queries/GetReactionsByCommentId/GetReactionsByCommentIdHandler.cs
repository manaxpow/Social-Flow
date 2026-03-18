using AutoMapper;
using MediatR;

namespace Shop.Application.Features.Placeholder.Commands.GetReactionsByCommentId;

public class GetReactionsByCommentIdHandler : IRequestHandler<GetReactionsByCommentIdQuery, Result<ReactionResponse>>
{
    private readonly IMapper _mapper;
    private readonly IReactionQueries _reactionsQueries;

    public GetReactionsByCommentIdHandler(IMapper mapper, IReactionQueries reactionsQueries)
    {
        _mapper = mapper;
        _reactionsQueries = reactionsQueries;
    }

    public async Task<Result<ReactionResponse>> Handle(GetReactionsByCommentIdQuery request, CancellationToken cancellationToken)
    {
        var reactions = await _reactionsQueries.GetReactionsByCommentIdAsync(request.CommentId, cancellationToken);
        return Result<ReactionResponse>.Success(_mapper.Map<ReactionResponse>(reactions));
    }
}