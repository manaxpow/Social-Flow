public static class UserErrors
{
    public static readonly Error NotFound = new(
        "User.NotFound", "User not found.");

    public static readonly Error DuplicateEmail = new(
        "User.DuplicateEmail", "Email is already in use.");

    public static readonly Error UploadFailed = new(
        "User.UploadFailed", "Failed to upload the avatar image.");
}