public class CloudImage
{
    public string Url { get; private set; } = string.Empty;
    public string PublicId { get; private set; } = string.Empty;

    // EF Core yêu cầu constructor rỗng
    private CloudImage() { }

    public CloudImage(string url, string publicId)
    {
        if (string.IsNullOrWhiteSpace(url))
            throw new ArgumentException("Url cannot be empty");
        if (string.IsNullOrWhiteSpace(publicId))
            throw new ArgumentException("PublicId cannot be empty");

        Url = url;
        PublicId = publicId;
    }

    // Trả về ảnh mặc định cho User
    public static CloudImage DefaultAvatar => new CloudImage(
        "https://res.cloudinary.com/demo/image/upload/v1/default_avatar.png",
        "default_avatar"
    );

    // Trả về ảnh placeholder cho Post nếu cần
    public static CloudImage Placeholder => new CloudImage(
        "https://res.cloudinary.com/demo/image/upload/v1/placeholder.png",
        "placeholder"
    );
}