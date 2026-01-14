namespace SocialFlow.Domain.Common;

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string Message { get; set; }
    public T? Data { get; set; }
    public string[]? Errors { get; set; }
    public string TraceId { get; set; } = string.Empty;
    public ApiResponse(T data, string message = "Success")
    {
        Success = true;
        Message = message;
        Data = data;
    }

    public ApiResponse(string[] errors, string message = "Failure")
    {
        Success = false;
        Message = message;
        Data = default;
    }
}