using AutoMapper;
using MediatR;

namespace Shop.Application.Features.Placeholder.Commands.GetReactionsByPostId;

public class GetReactionsByPostIdHandler : IRequestHandler<GetReactionsByPostIdQuery, Result<ReactionResponse>>
{
    private readonly IMapper _mapper;
    private readonly IReactionQueries _reactionsQueries;

    public GetReactionsByPostIdHandler(IMapper mapper, IReactionQueries reactionsQueries)
    {
        _mapper = mapper;
        _reactionsQueries = reactionsQueries;
    }

    public async Task<Result<ReactionResponse>> Handle(GetReactionsByPostIdQuery request, CancellationToken cancellationToken)
    {
        var reactions = await _reactionsQueries.GetReactionsByPostIdAsync(request.PostId, cancellationToken);
        return Result<ReactionResponse>.Success(_mapper.Map<ReactionResponse>(reactions));
    }
}