using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[Authorize]
public class AuthController(IMediator mediator) : BaseApiController(mediator)
{

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginCommand command)
    {
        var result = await _mediator.Send(command);
        if (result.IsSuccess && result.Value != null)
        {

            CookiesHelper.AppendCookie(Response, "accessToken", result.Value.AccessToken, 15); // 15 minutes
            CookiesHelper.AppendCookie(Response, "refreshToken", result.Value.RefreshToken, 10080); // 7 days

            var resultWithoutToken = Result<LoginResponse>.Success(new LoginResponse
            {
                User = result.Value.User,
                AccessToken = string.Empty,
                RefreshToken = string.Empty
            });
            return HandleResult(resultWithoutToken);
        }

        return HandleResult(result);
    }

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterCommand command)
    {
        var result = await _mediator.Send(command);
        if (!result.IsSuccess)
        {
            CookiesHelper.DeleteCookie(Response, "accessToken");
            CookiesHelper.DeleteCookie(Response, "refreshToken");
        }
        return HandleResult(result);
    }

    [AllowAnonymous]
    [HttpPost("refresh-token")]
    public async Task<IActionResult> RefreshToken()
    {
        var refreshToken = CookiesHelper.GetCookie(Request, "refreshToken");
        if (string.IsNullOrEmpty(refreshToken))
        {
            return HandleResult(Result<LoginResponse>.Failure(AuthErrors.InvalidToken));
        }

        var command = new RefreshTokenCommand(refreshToken);
        var result = await _mediator.Send(command);
        if (result.IsSuccess)
        {
            CookiesHelper.AppendCookie(Response, "accessToken", result.Value!.AccessToken, 15); // 15 minutes
            CookiesHelper.AppendCookie(Response, "refreshToken", result.Value!.RefreshToken, 10080); // 7 days

            var resultWithoutToken = Result<LoginResponse>.Success(new LoginResponse
            {
                AccessToken = string.Empty,
                RefreshToken = string.Empty
            });
            return HandleResult(resultWithoutToken);
        }

        CookiesHelper.DeleteCookie(Response, "accessToken");
        CookiesHelper.DeleteCookie(Response, "refreshToken");
        return HandleResult(result);
    }


    [AllowAnonymous]
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordCommand command)
    {
        var result = await _mediator.Send(command);
        return HandleResult(result);
    }


    [AllowAnonymous]
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordCommand command)
    {
        var result = await _mediator.Send(command);
        return HandleResult(result);
    }

    [AllowAnonymous]
    [HttpPost("confirm-email")]
    public async Task<IActionResult> ConfirmEmail([FromBody] ConfirmEmailCommand command)
    {
        var result = await _mediator.Send(command);
        return HandleResult(result);
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        CookiesHelper.DeleteCookie(Response, "accessToken");
        CookiesHelper.DeleteCookie(Response, "refreshToken");
        return Ok();
    }
}