using MediatR;

public record GetMeQuery : IRequest<Result<UserResponse>>;