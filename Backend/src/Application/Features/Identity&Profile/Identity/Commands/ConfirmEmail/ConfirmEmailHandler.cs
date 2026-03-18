using MediatR;
using Microsoft.AspNetCore.Identity;

public class ConfirmEmailHandler : IRequestHandler<ConfirmEmailCommand, Result<Unit>>
{
    private readonly UserManager<User> _userManager;

    public ConfirmEmailHandler(UserManager<User> userManager)
    {
        _userManager = userManager;
    }

    public async Task<Result<Unit>> Handle(ConfirmEmailCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.UserId);
        if (user == null)
        {
            return Result<Unit>.Failure(UserErrors.NotFound);
        }

        var decodedToken = Uri.UnescapeDataString(request.Token);

        var result = await _userManager.ConfirmEmailAsync(user, decodedToken);

        if (!result.Succeeded)
        {
            return Result<Unit>.Failure(AuthErrors.InvalidToken);
        }

        return Result<Unit>.Success(Unit.Value);
    }
}