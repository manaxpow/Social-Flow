using MediatR;

public record GetReactionsByMessageIdQuery(Guid MessageId) : IRequest<Result<ReactionResponse>>;