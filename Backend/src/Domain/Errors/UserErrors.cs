public static class UserErrors
{
    public static readonly Error NotFound = new(
        "User.NotFound", "User not found.");

    public static readonly Error DuplicateEmail = new(
        "User.DuplicateEmail", "Email is already in use.");
}