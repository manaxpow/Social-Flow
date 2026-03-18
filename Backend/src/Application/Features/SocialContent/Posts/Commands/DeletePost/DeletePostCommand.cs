
using MediatR;

public record DeletePostCommand(Guid Id) : IRequest<Result<Unit>>;