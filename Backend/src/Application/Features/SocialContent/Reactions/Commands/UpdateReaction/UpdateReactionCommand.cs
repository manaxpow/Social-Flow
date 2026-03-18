
using MediatR;

public record UpdateReactionCommand
(
    Guid Id,
    ReactType ReactType
) : IRequest<Result<ReactionResponse>>;