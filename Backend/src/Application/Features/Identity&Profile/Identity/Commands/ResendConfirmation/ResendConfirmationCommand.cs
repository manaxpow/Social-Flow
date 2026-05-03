using MediatR;

public record ResendConfirmationCommand(string Email) : IRequest<Result<Unit>>;
