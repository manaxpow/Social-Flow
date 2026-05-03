public sealed class PostMedia : Entity
{
    public Guid PostId { get; private set; }
    public CloudAsset Media { get; private set; } = default!;
    public int SortOrder { get; private set; }

    public PostMedia() { }

    public PostMedia(Guid postId, CloudAsset media, int sortOrder)
    {
        PostId = postId;
        Media = media ?? throw new ArgumentNullException(nameof(media));
        SortOrder = sortOrder;
    }

    public void UpdateMedia(CloudAsset newMedia, int sortOrder)
    {
        if (newMedia == null) throw new ArgumentNullException(nameof(newMedia));

        SortOrder = sortOrder;
        this.Media.UpdateValues(newMedia.Url, newMedia.PublicId, newMedia.Type);
    }
}