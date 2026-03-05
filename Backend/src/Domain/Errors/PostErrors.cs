public static class PostErrors
{
    public static readonly Error NotFound = new(
        "Post.NotFound", "Post not found.");
    public static readonly Error NoPermission = new(
        "Post.NoPermission", "You do not have permission to perform this action.");

    public static readonly Error ImageUploadFailed = new(
        "Post.ImageUploadFailed", "Failed to upload image.");
}