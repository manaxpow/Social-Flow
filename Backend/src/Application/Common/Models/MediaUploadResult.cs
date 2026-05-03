public class MediaUploadResult
{
    public string Url { get; init; } = string.Empty;
    public string PublicId { get; init; } = string.Empty;
    public MediaType MediaType { get; init; }
    // Các field xác định trạng thái
    public bool IsSuccess { get; init; }
    public string? ErrorMessage { get; init; }

    // Helper methods để tạo nhanh kết quả
    public static MediaUploadResult Success(string url, string publicId, MediaType mediaType) =>
        new() { Url = url, PublicId = publicId, MediaType = mediaType, IsSuccess = true };

    public static MediaUploadResult Failure(string errorMessage) =>
        new() { IsSuccess = false, ErrorMessage = errorMessage };

    public CloudAsset ToCloudAsset() => new(Url, PublicId, MediaType);
}