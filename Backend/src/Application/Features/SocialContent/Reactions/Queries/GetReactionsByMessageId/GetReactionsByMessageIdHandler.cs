using AutoMapper;
using MediatR;

namespace Shop.Application.Features.Placeholder.Commands.GetReactionsByMessageId;

public class GetReactionsByMessageIdHandler : IRequestHandler<GetReactionsByMessageIdQuery, Result<ReactionResponse>>
{
    private readonly IMapper _mapper;
    private readonly IReactionQueries _reactionsQueries;

    public GetReactionsByMessageIdHandler(IMapper mapper, IReactionQueries reactionsQueries)
    {
        _mapper = mapper;
        _reactionsQueries = reactionsQueries;
    }

    public async Task<Result<ReactionResponse>> Handle(GetReactionsByMessageIdQuery request, CancellationToken cancellationToken)
    {
        var reactions = await _reactionsQueries.GetReactionsByMessageIdAsync(request.MessageId, cancellationToken);
        return Result<ReactionResponse>.Success(_mapper.Map<ReactionResponse>(reactions));
    }
}