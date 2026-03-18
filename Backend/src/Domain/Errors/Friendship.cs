public static class FriendshipErrors
{
    public static readonly Error NotFound = new("Friendship.NotFound", "Friendship not found.");
    public static readonly Error FriendshipAlreadyExists = new("Friendship.AlreadyExists", "Friendship already exists.");
    public static readonly Error RequestFriendshipFailed = new("RequestFriendship.Failed", "Request friendship failed.");
    public static readonly Error CancelFriendshipFailed = new("CancelFriendship.Failed", "Cancel friendship failed.");
    public static readonly Error AcceptFriendshipFailed = new("AcceptFriendship.Failed", "Accept friendship failed.");
    public static readonly Error UnBlockUserFailed = new("UnBlockUser.Failed", "UnBlock user failed.");
    public static readonly Error UnFriendFailed = new("BlockUser.Failed", "Block user failed.");
    public static readonly Error RequestYourself = new("RequestYourself", "You can't request yourself.");


}