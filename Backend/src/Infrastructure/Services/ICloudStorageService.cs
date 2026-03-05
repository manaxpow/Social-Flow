using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http;

public class CloudinaryMediaService : IMediaService
{
    private readonly Cloudinary _cloudinary;

    public CloudinaryMediaService(CloudinarySettings settings)
    {
        _cloudinary = new Cloudinary(new Account(settings.CloudName, settings.ApiKey, settings.ApiSecret));
    }

    public async Task<MediaUploadResult> UploadImageAsync(IFormFile file, string folder)
    {
        try
        {
            using var stream = file.OpenReadStream();
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                Folder = folder
            };

            var result = await _cloudinary.UploadAsync(uploadParams);

            if (result.Error != null)
            {
                return MediaUploadResult.Failure(result.Error.Message);
            }

            return MediaUploadResult.Success(result.SecureUrl.AbsoluteUri, result.PublicId);
        }
        catch (Exception ex)
        {
            return MediaUploadResult.Failure(ex.Message);
        }
    }

    public async Task DeleteImageAsync(string publicId) =>
        await _cloudinary.DestroyAsync(new DeletionParams(publicId));
}