using Microsoft.AspNetCore.Http;

public interface IMediaService
{
    Task<MediaUploadResult> UploadAssetAsync(IFormFile file, string folder);
    Task DeleteAssetAsync(string publicId, MediaType type);
    SetupUploadResponse GenerateSignature(string folder);
}