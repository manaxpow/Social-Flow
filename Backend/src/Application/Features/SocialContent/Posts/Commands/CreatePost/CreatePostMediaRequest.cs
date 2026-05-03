public record CreatePostMediaRequest(
    string Url,
    string PublicId,
    MediaType Type,
    int SortOrder
);