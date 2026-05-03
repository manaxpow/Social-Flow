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
        Console.WriteLine(user);

        var result = await _userManager.CreateAsync(user, request.Password);

        if (!result.Succeeded)
        {
            // Lấy lỗi đầu tiên từ Identity (ví dụ: "Password must have one non alphanumeric character")
            var firstError = result.Errors.First();
            return Result<RegisterResponse>.Failure(new Error(firstError.Code, firstError.Description));
        }
        var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        var encodedToken = Uri.EscapeDataString(token);
        var confirmationLink =
        $"{options.Value.BaseUrl}/{options.Value.EmailConfirmationPath}?userId={user.Id}&token={encodedToken}";

        _jobService.Enqueue<IEmailService>(emailService => emailService.SendEmailConfirmationEmailAsync(user.LastName, user.Email!, confirmationLink));

        return Result<RegisterResponse>.Success(new RegisterResponse { Id = user.Id });
    }
}