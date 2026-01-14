using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SocialFlow.Domain.Common;

public class ForgotPasswordHandler : IRequestHandler<ForgotPasswordCommand, Result<Unit>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly UserManager<User> _userManager;
    private readonly IJobService _jobService;
    private readonly ILogger<ForgotPasswordHandler> _logger;
    private readonly IOptions<ClientSettings> options;

    public ForgotPasswordHandler(IUnitOfWork unitOfWork, UserManager<User> userManager, IJobService jobService, ILogger<ForgotPasswordHandler> logger, IOptions<ClientSettings> clientSettings)
    {
        _unitOfWork = unitOfWork;
        _userManager = userManager;
        _jobService = jobService;
        _logger = logger;
        options = clientSettings;
    }

    public async Task<Result<Unit>> Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
        {
            _logger.LogWarning("Password reset requested for non-existent email: {Email}", request.Email);
            return Result<Unit>.Success(Unit.Value);
        }

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        var encodeToken = Uri.EscapeDataString(token);
        var resetLink = $"{options.Value.BaseUrl}/{options.Value.PasswordResetPath}?email={request.Email}&token={encodeToken}";

        _jobService.Enqueue<IEmailService>(emailService => emailService.SendPasswordResetEmailAsync(request.Email, resetLink));

        _logger.LogInformation("Password reset requested for {Email}", request.Email);

        return Result<Unit>.Success(Unit.Value);
    }
}