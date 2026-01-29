using MediatR;

public record GetPostByIdQuery(Guid Id) : IRequest<Result<PostResponse>>;