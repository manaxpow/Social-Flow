using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;

public class CloudinaryMediaService : IMediaService
{
    private readonly Cloudinary _cloudinary;

    public CloudinaryMediaService(IOptions<CloudinarySettings> options)
    {
        var settings = options.Value;
        var account = new Account(settings.CloudName, settings.ApiKey, settings.ApiSecret);
        _cloudinary = new Cloudinary(account);
    }

    public SetupUploadResponse GenerateSignature(string folder)
    {
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();

        var parameters = new Dictionary<string, object>
        {
            { "folder", folder },
            { "timestamp", timestamp }
        };

        var signature = _cloudinary.Api.SignParameters(parameters);

        return new SetupUploadResponse
        {
            Signature = signature,
            Timestamp = timestamp,
            ApiKey = _cloudinary.Api.Account.ApiKey,
            CloudName = _cloudinary.Api.Account.Cloud
        };
    }

    public async Task<MediaUploadResult> UploadAssetAsync(IFormFile file, string folder)
    {
        if (file.Length == 0) return MediaUploadResult.Failure("File is empty");

        try
        {
            using var stream = file.OpenReadStream();
            var fileName = file.FileName;
            var contentType = file.ContentType;

            // 1. Xác định MediaType dựa trên ContentType
            var mediaType = ResolveMediaType(contentType);

            var fileDescription = new FileDescription(file.FileName, stream);

            RawUploadParams uploadParams = mediaType switch
            {
                MediaType.Video or MediaType.Audio => new VideoUploadParams
                {
                    File = fileDescription,
                    Folder = folder
                },
                MediaType.Image or MediaType.Gif => new ImageUploadParams
                {
                    File = fileDescription,
                    Folder = folder
                },
                _ => new RawUploadParams
                {
                    File = fileDescription,
                    Folder = folder
                }
            };

            var result = await _cloudinary.UploadAsync(uploadParams);

            if (result.Error != null)
                return MediaUploadResult.Failure(result.Error.Message);

            return MediaUploadResult.Success(
                result.SecureUrl.AbsoluteUri,
                result.PublicId,
                mediaType
            );
        }
        catch (Exception ex)
        {
            return MediaUploadResult.Failure(ex.Message);
        }
    }

    public async Task DeleteAssetAsync(string publicId, MediaType type)
    {
        var deleteParams = new DeletionParams(publicId)
        {
            ResourceType = ResolveCloudinaryResourceType(type)
        };
        await _cloudinary.DestroyAsync(deleteParams);
    }

    // Helper: Chuyển đổi từ MIME sang Domain Enum
    private MediaType ResolveMediaType(string contentType)
    {
        if (contentType.Contains("video/")) return MediaType.Video;
        if (contentType.Contains("audio/")) return MediaType.Audio;
        if (contentType.Contains("image/gif")) return MediaType.Gif;
        if (contentType.Contains("image/")) return MediaType.Image;
        return MediaType.Document;
    }

    // Helper: Chuyển đổi từ Domain Enum sang ResourceType của Cloudinary
    private ResourceType ResolveCloudinaryResourceType(MediaType type)
    {
        return type switch
        {
            MediaType.Video or MediaType.Audio => ResourceType.Video,
            MediaType.Image or MediaType.Gif => ResourceType.Image,
            _ => ResourceType.Raw
        };
    }
}