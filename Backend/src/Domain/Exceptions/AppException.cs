public class AppException(string message, int statusCode = 500, object? metadata = null) : Exception(message)
{
    public int StatusCode { get; } = statusCode;
    public object? Metadata { get; } = metadata;

}