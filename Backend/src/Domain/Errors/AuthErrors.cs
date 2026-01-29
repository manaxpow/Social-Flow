public static class AuthErrors
{

    public static readonly Error InvalidCredentials = new(
        "Auth.InvalidCredentials", "Email or password is incorrect.");

    public static readonly Error Locked = new(
        "Auth.Locked", "Your account has been locked due to multiple failed login attempts. Please try again later.");

    public static readonly Error EmailNotConfirmed = new(
        "Auth.EmailNotConfirmed", "Please confirm your email before logging in.");

    public static readonly Error InvalidToken = new(
        "Auth.InvalidToken", "Invalid refresh token.");

    public static readonly Error TokenExpired = new(
        "Auth.TokenExpired", "Refresh token has expired.");

    public static readonly Error Unauthorized = new(
        "Auth.Unauthorized", "You are not authorized to perform this action."
    );

}