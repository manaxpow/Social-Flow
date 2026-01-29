
using MediatR;

public record DeleteReactionCommand(Guid Id) : IRequest<Result<Unit>>;