using MediatR;

public record LoginCommand(
    string Email,
    string Password
) : IRequest<Result<LoginResponse>>;