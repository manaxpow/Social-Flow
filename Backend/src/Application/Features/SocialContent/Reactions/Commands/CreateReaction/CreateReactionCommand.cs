
using MediatR;

public record CreateReactionCommand
(
    Guid TargetId,
    ReactType ReactType,
    TargetType TargetType
) : IRequest<Result<ReactionResponse>>;