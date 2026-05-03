using MediatR;

public record GetFriendsQuery(string? Search = null) : IRequest<Result<List<UserResponse>>>;