
using MediatR;

public record DeleteCommentCommand(Guid Id) : IRequest<Result<Unit>>;