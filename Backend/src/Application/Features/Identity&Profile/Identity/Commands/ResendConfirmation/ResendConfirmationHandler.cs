using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;

public class ResendConfirmationHandler : IRequestHandler<ResendConfirmationCommand, Result<Unit>>
{
    private readonly UserManager<User> _userManager;
    private readonly IOptions<ClientSettings> _options;
    private readonly IJobService _jobService;

    public ResendConfirmationHandler(
        UserManager<User> userManager,
        IOptions<ClientSettings> options,
        IJobService jobService)
    {
        _userManager = userManager;
        _options = options;
        _jobService = jobService;
    }

    public async Task<Result<Unit>> Handle(ResendConfirmationCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);

        if (user == null)
        {
            // Return success to prevent email enumeration attacks
            return Result<Unit>.Success(Unit.Value);
        }

        if (user.EmailConfirmed)
        {
            // Email already confirmed, nothing to do
            return Result<Unit>.Success(Unit.Value);
        }

        var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        var encodedToken = Uri.EscapeDataString(token);
        var confirmationLink =
            $"{_options.Value.BaseUrl}/{_options.Value.EmailConfirmationPath}?userId={user.Id}&token={encodedToken}";

        _jobService.Enqueue<IEmailService>(emailService =>
            emailService.SendEmailConfirmationEmailAsync(user.LastName, user.Email!, confirmationLink));

        return Result<Unit>.Success(Unit.Value);
    }
}
