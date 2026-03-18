using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;

public class IdentityService : IIdentityService
{
    private readonly SignInManager<User> _signInManager;
    private readonly UserManager<User> _userManager;
    private readonly IJobService _jobService;
    private readonly ILogger<IdentityService> _logger;

    public IdentityService(
        SignInManager<User> signInManager,
        UserManager<User> userManager,
        IJobService jobService,
        ILogger<IdentityService> logger)
    {
        _signInManager = signInManager;
        _userManager = userManager;
        _jobService = jobService;
        _logger = logger;
    }

    public async Task<Result<User>> AuthenticateAsync(string email, string password)
    {
        var user = await _userManager.FindByEmailAsync(email);

        if (user == null)
        {
            _logger.LogWarning("Xác thực thất bại: Email {Email} không tồn tại.", email);
            return Result<User>.Failure(AuthErrors.InvalidCredentials);
        }

        var result = await _signInManager.CheckPasswordSignInAsync(user, password, lockoutOnFailure: true);

        if (result.IsLockedOut)
        {
            _logger.LogWarning("Tài khoản bị khóa: {Email}.", email);

            // Đẩy việc gửi mail vào Hangfire qua IJobService
            _jobService.Enqueue<IEmailService>(emailService =>
                emailService.SendLockoutEmailAsync(user.Email!, user.UserName!, Guid.NewGuid().ToString()));

            return Result<User>.Failure(AuthErrors.Locked);
        }

        if (!result.Succeeded)
        {
            var maxAttempts = _signInManager.Options.Lockout.MaxFailedAccessAttempts;
            var currentAttempts = await _userManager.GetAccessFailedCountAsync(user);
            var remainingAttempts = maxAttempts - currentAttempts;

            _logger.LogWarning("Xác thực thất bại: Sai mật khẩu cho {Email}.", email);
            if (remainingAttempts <= 3)
            {
                _logger.LogWarning("Tài khoản sẽ bị khóa: {Email}. sau {RemainingAttempts} lần.", email, remainingAttempts);
                return Result<User>.Failure(AuthErrors.InvalidCredentials, new { RemainingAttempts = remainingAttempts });
            }

            return Result<User>.Failure(AuthErrors.InvalidCredentials);
        }

        _logger.LogInformation("Người dùng {Email} đăng nhập thành công.", email);
        await _userManager.ResetAccessFailedCountAsync(user);
        return Result<User>.Success(user);
    }

    public string GenerateRefreshToken() => Guid.NewGuid().ToString();
}