using MediatR;

public record GetReactionsByPostIdQuery(Guid PostId) : IRequest<Result<ReactionResponse>>;