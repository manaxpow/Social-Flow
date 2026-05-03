public record SetupUploadResponse
{
    public string Signature { get; init; } = string.Empty;
    public long Timestamp { get; init; }
    public string ApiKey { get; init; } = string.Empty;
    public string CloudName { get; init; } = string.Empty;
}