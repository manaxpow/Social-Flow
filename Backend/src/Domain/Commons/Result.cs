public class Result<T>
{
    public bool IsSuccess { get; }
    public bool IsFailure => !IsSuccess;
    public T? Value { get; }
    public Error Error { get; }
    public IEnumerable<string>? Errors { get; }

    public object? Metadata { get; }

    private Result(bool isSuccess, T? value, Error error, IEnumerable<string>? errors = null, object? metadata = null)
    {
        IsSuccess = isSuccess;
        Value = value;
        Error = error;
        Errors = errors;
        Metadata = metadata;
    }

    public static Result<T> Success(T value) => new(true, value, Error.None);

    public static Result<T> Failure(Error error) => new(false, default, error);

    public static Result<T> Failure(Error error, object? metadata) =>
        new(false, default, error, null, metadata);

    public static Result<T> Failure(IEnumerable<string> errors) =>
        new(false, default, new Error("Validation.Error", "One or more validation errors occurred."), errors);
}