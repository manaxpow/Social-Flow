public record NotificationResponse(
    NotificationType Type,
    string TitleKey, // Ví dụ: "NOTIFICATION_FRIEND_REQUEST_TITLE"
    object? Data,    // Metadata
    DateTime CreatedAt
);