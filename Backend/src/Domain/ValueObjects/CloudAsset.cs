public class CloudAsset
{
    public string Url { get; private set; } = string.Empty;
    public string PublicId { get; private set; } = string.Empty;
    public MediaType Type { get; private set; }

    // EF Core yêu cầu constructor rỗng
    private CloudAsset() { }

    public CloudAsset(string url, string publicId, MediaType type)
    {
        if (string.IsNullOrWhiteSpace(url))
            throw new ArgumentException("Url cannot be empty");
        if (string.IsNullOrWhiteSpace(publicId))
            throw new ArgumentException("PublicId cannot be empty");

        Url = url;
        PublicId = publicId;
        Type = type;
    }

    internal void UpdateValues(string url, string publicId, MediaType type)
    {
        if (string.IsNullOrWhiteSpace(url)) throw new ArgumentException("Url is required");

        Url = url;
        PublicId = publicId;
        Type = type;
    }

    public void UpdateMedia(string url, string publicId, MediaType type)
    {
        if (string.IsNullOrWhiteSpace(url))
            throw new ArgumentException("Url cannot be empty");
        if (string.IsNullOrWhiteSpace(publicId))
            throw new ArgumentException("PublicId cannot be empty");

        Url = url;
        PublicId = publicId;
        Type = type;
    }

    // Trả về ảnh mặc định cho User
    public static CloudAsset DefaultAvatar => new CloudAsset(
        "https://res.cloudinary.com/demo/image/upload/v1/default_avatar.png",
        "default_avatar",
        MediaType.Image
    );

    // Trả về ảnh bìa mặc định cho User
    public static CloudAsset DefaultCover => new CloudAsset(
        "https://res.cloudinary.com/demo/image/upload/v1/default_cover.jpg",
        "default_cover",
        MediaType.Image
    );

    // Create CloudAsset from Cloudinary URL
    public static CloudAsset? FromUrl(string? url)
    {
        if (string.IsNullOrWhiteSpace(url)) return null;

        try
        {
            var uri = new Uri(url);
            var pathSegments = uri.AbsolutePath.Split('/', StringSplitOptions.RemoveEmptyEntries);

            // Format: .../v{version}/{public_id}.{format}
            // Find "v{version}" segment and get public_id from next segment
            var publicIdIndex = -1;
            for (int i = 0; i < pathSegments.Length; i++)
            {
                if (pathSegments[i].StartsWith('v') && pathSegments[i].Length > 1 && int.TryParse(pathSegments[i].Substring(1), out _))
                {
                    publicIdIndex = i + 1;
                    break;
                }
            }

            if (publicIdIndex < 0 || publicIdIndex >= pathSegments.Length)
                return null;

            var publicIdWithFormat = pathSegments[publicIdIndex];
            var lastDotIndex = publicIdWithFormat.LastIndexOf('.');
            var publicId = lastDotIndex > 0 ? publicIdWithFormat.Substring(0, lastDotIndex) : publicIdWithFormat;
            var format = lastDotIndex > 0 ? publicIdWithFormat.Substring(lastDotIndex + 1) : "";

            // Determine media type from format
            var mediaType = format.ToLowerInvariant() switch
            {
                "jpg" or "jpeg" or "png" or "gif" or "webp" or "svg" => MediaType.Image,
                "mp4" or "mov" or "avi" or "webm" => MediaType.Video,
                "mp3" or "wav" or "ogg" => MediaType.Audio,
                _ => MediaType.Document
            };

            return new CloudAsset(url, publicId, mediaType);
        }
        catch
        {
            return null;
        }
    }
}
