public class Result<T>
{
    public bool IsSuccess { get; }
    public T? Value { get; }
    public string? Error { get; }

    private Result(bool isSuccess, T value, string errorMessage)
    {
        IsSuccess = isSuccess;
        Value = value;
        Error = errorMessage;
    }

    public static Result<T> Success(T value) => new Result<T>(true, value, string.Empty);

    public static Result<T> Failure(string errorMessage) => new Result<T>(false, default!, errorMessage);
}