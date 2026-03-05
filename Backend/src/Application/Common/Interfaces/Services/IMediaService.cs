using Microsoft.AspNetCore.Http;

public interface IMediaService
{
    Task<MediaUploadResult> UploadImageAsync(IFormFile file, string folder);
    Task DeleteImageAsync(string publicId);
}