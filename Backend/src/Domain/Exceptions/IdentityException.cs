public class IdentityException(string message, int statusCode = 401) : AppException(message, statusCode)
{
    public IdentityException(string[] errors, int statusCode = 401)
        : this("Identity error", statusCode)
    {
        Errors = errors;
    }
    public string[]? Errors { get; } = [message];
}