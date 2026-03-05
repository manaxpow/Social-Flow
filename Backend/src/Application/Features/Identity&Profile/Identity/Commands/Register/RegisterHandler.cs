using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, Result<RegisterResponse>>
{
    private readonly UserManager<User> _userManager;
    private readonly IOptions<ClientSettings> options;
    private readonly IJobService _jobService;
    public RegisterCommandHandler(UserManager<User> userManager, IOptions<ClientSettings> clientSettings, IJobService jobService)
    {
        _userManager = userManager;
        options = clientSettings;
        _jobService = jobService;
    }

    public async Task<Result<RegisterResponse>> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        var user = new User(
            request.Email,
            request.FirstName,
            request.LastName,
            request.DateOfBirth,
            request.Gender,
            request.Bio);
        var result = await _userManager.CreateAsync(user, request.Password);

        if (!result.Succeeded)
        {
            return Result<RegisterResponse>.Failure(result.Errors.Select(x => x.Description).ToList());
        }

        var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        var encodedToken = Uri.EscapeDataString(token);
        var confirmationLink =
        $"{options.Value.BaseUrl}/{options.Value.EmailConfirmationPath}?userId={user.Id}&token={encodedToken}";

        _jobService.Enqueue<IEmailService>(emailService => emailService.SendEmailConfirmationEmailAsync(user.LastName, user.Email, confirmationLink));

        return Result<RegisterResponse>.Success(new RegisterResponse { Id = user.Id });
    }
}