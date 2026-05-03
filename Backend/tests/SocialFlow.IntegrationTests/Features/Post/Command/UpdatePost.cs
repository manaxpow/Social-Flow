using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

[Collection("Shared Database")]
public class UpdatePostTests : IntegrationTestBase
{
    public UpdatePostTests(SocialFlowApiFactory factory) : base(factory)
    {
    }

    private async Task<Guid> SeedPostAsync(Guid authorId, string content = "Original content")
    {
        var post = new Post(
            Guid.NewGuid(),
            content,
            authorId,
            null,
            null,
            new List<Guid>()
        );
        Context.Posts.Add(post);
        await Context.SaveChangesAsync();
        Context.ChangeTracker.Clear();
        return post.Id;
    }

    private async Task<Guid> SeedPostWithMediaAsync(Guid authorId)
    {
        var postId = Guid.NewGuid();
        var post = new Post(
            postId,
            "Post with media",
            authorId,
            new List<PostMedia>
            {
                new(postId, new CloudAsset("https://example.com/original.jpg", "original.jpg", MediaType.Image), 0)
            },
            null,
            new List<Guid>()
        );
        Context.Posts.Add(post);
        await Context.SaveChangesAsync();
        Context.ChangeTracker.Clear();
        return post.Id;
    }

    [Fact]
    public async Task UpdatePost_WithNewContent_ShouldUpdateSuccessfully()
    {
        // Arrange
        var authorId = Guid.NewGuid();
        AuthenticateAs(authorId);
        await CreateUserAsync(authorId);

        var postId = await SeedPostAsync(authorId);
        const string newContent = "Updated content!";

        var request = new UpdatePostCommand(
            Guid.Empty,
            newContent,
            null,
            new List<Guid>()
        );

        // Act
        var response = await Client.PatchAsJsonAsync($"/api/post/{postId}", request);

        // Assert — HTTP response
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var postResponse = await response.Content.ReadFromJsonAsync<PostResponse>();
        postResponse.Should().NotBeNull();
        postResponse!.Id.Should().Be(postId);
        postResponse.Content.Should().Be(newContent);
        postResponse.AuthorId.Should().Be(authorId);

        // Assert — Database state
        var post = await Context.Posts.FirstOrDefaultAsync(p => p.Id == postId);
        post.Should().NotBeNull();
        post!.Content.Should().Be(newContent);
        post.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public async Task UpdatePost_WithNewMedia_ShouldReplaceMedia()
    {
        // Arrange
        var authorId = Guid.NewGuid();
        AuthenticateAs(authorId);
        await CreateUserAsync(authorId);

        var postId = await SeedPostWithMediaAsync(authorId);

        var request = new UpdatePostCommand(
            Guid.Empty,
            "Updated with new media",
            new List<CreatePostMediaRequest>
            {
                new("https://example.com/new1.jpg", "new1.jpg", MediaType.Image, 0),
                new("https://example.com/new2.jpg", "new2.jpg", MediaType.Video, 1)
            },
            new List<Guid>()
        );

        // Act
        var response = await Client.PatchAsJsonAsync($"/api/post/{postId}", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var post = await Context.Posts
            .Include(p => p.MediaItems)
            .FirstOrDefaultAsync(p => p.Id == postId);

        post.Should().NotBeNull();
        post!.MediaItems.Should().HaveCount(2);

        var sortedMedia = post.MediaItems.OrderBy(m => m.SortOrder).ToList();
        sortedMedia[0].Media.Url.Should().Be("https://example.com/new1.jpg");
        sortedMedia[0].Media.Type.Should().Be(MediaType.Image);
        sortedMedia[0].SortOrder.Should().Be(0);
        sortedMedia[1].Media.Url.Should().Be("https://example.com/new2.jpg");
        sortedMedia[1].Media.Type.Should().Be(MediaType.Video);
        sortedMedia[1].SortOrder.Should().Be(1);
    }

    [Fact]
    public async Task UpdatePost_WithContentAndMediaTogether_ShouldUpdateBoth()
    {
        // Arrange
        var authorId = Guid.NewGuid();
        AuthenticateAs(authorId);
        await CreateUserAsync(authorId);

        var postId = await SeedPostAsync(authorId);
        const string newContent = "Updated content and media";

        var request = new UpdatePostCommand(
            Guid.Empty,
            newContent,
            new List<CreatePostMediaRequest>
            {
                new("https://example.com/updated.jpg", "updated.jpg", MediaType.Image, 0)
            },
            new List<Guid>()
        );

        // Act
        var response = await Client.PatchAsJsonAsync($"/api/post/{postId}", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var post = await Context.Posts
            .Include(p => p.MediaItems)
            .FirstOrDefaultAsync(p => p.Id == postId);

        post.Should().NotBeNull();
        post!.Content.Should().Be(newContent);
        post.MediaItems.Should().HaveCount(1);
        post.MediaItems.First().Media.Url.Should().Be("https://example.com/updated.jpg");
    }

    [Fact]
    public async Task UpdatePost_WithoutAuthentication_ShouldReturnUnauthorized()
    {
        // Arrange — explicitly clear authentication
        TestAuthHandler.CurrentUserId = null;

        var request = new UpdatePostCommand(
            Guid.Empty,
            "Should not work",
            null,
            new List<Guid>()
        );

        // Act
        var response = await Client.PatchAsJsonAsync($"/api/post/{Guid.NewGuid()}", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task UpdatePost_AsNonOwner_ShouldReturnForbidden()
    {
        // Arrange
        var ownerId = Guid.NewGuid();
        var otherUserId = Guid.NewGuid();
        await CreateUserAsync(ownerId);
        await CreateUserAsync(otherUserId);

        var postId = await SeedPostAsync(ownerId);

        AuthenticateAs(otherUserId);

        var request = new UpdatePostCommand(
            Guid.Empty,
            "Hacked content",
            null,
            new List<Guid>()
        );

        // Act
        var response = await Client.PatchAsJsonAsync($"/api/post/{postId}", request);

        // Assert — handler returns AuthErrors.Forbidden which maps to 400 via ResultExtensions
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        // Verify content was NOT changed
        var post = await Context.Posts.FirstOrDefaultAsync(p => p.Id == postId);
        post.Should().NotBeNull();
        post!.Content.Should().Be("Original content");
    }

    [Fact]
    public async Task UpdatePost_WithNonExistentId_ShouldReturnNotFound()
    {
        // Arrange
        var authorId = Guid.NewGuid();
        AuthenticateAs(authorId);
        await CreateUserAsync(authorId);

        var fakePostId = Guid.NewGuid();

        var request = new UpdatePostCommand(
            Guid.Empty,
            "Update ghost post",
            null,
            new List<Guid>()
        );

        // Act
        var response = await Client.PatchAsJsonAsync($"/api/post/{fakePostId}", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task UpdatePost_WithContentExceedingMaxLength_ShouldReturnBadRequest()
    {
        // Arrange
        var authorId = Guid.NewGuid();
        AuthenticateAs(authorId);
        await CreateUserAsync(authorId);

        var postId = await SeedPostAsync(authorId);
        var longContent = new string('b', 2001);

        var request = new UpdatePostCommand(
            Guid.Empty,
            longContent,
            null,
            new List<Guid>()
        );

        // Act
        var response = await Client.PatchAsJsonAsync($"/api/post/{postId}", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task UpdatePost_WithEmptyMediaList_ShouldReturnBadRequest()
    {
        // Arrange
        var authorId = Guid.NewGuid();
        AuthenticateAs(authorId);
        await CreateUserAsync(authorId);

        var postId = await SeedPostAsync(authorId);

        var request = new UpdatePostCommand(
            Guid.Empty,
            "Content with empty media",
            new List<CreatePostMediaRequest>(),
            new List<Guid>()
        );

        // Act
        var response = await Client.PatchAsJsonAsync($"/api/post/{postId}", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task UpdatePost_WithMediaMissingUrl_ShouldReturnBadRequest()
    {
        // Arrange
        var authorId = Guid.NewGuid();
        AuthenticateAs(authorId);
        await CreateUserAsync(authorId);

        var postId = await SeedPostAsync(authorId);

        var request = new UpdatePostCommand(
            Guid.Empty,
            "Invalid media url",
            new List<CreatePostMediaRequest>
            {
                new("", "image.jpg", MediaType.Image, 0)
            },
            new List<Guid>()
        );

        // Act
        var response = await Client.PatchAsJsonAsync($"/api/post/{postId}", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task UpdatePost_WithNegativeSortOrder_ShouldReturnBadRequest()
    {
        // Arrange
        var authorId = Guid.NewGuid();
        AuthenticateAs(authorId);
        await CreateUserAsync(authorId);

        var postId = await SeedPostAsync(authorId);

        var request = new UpdatePostCommand(
            Guid.Empty,
            "Negative sort order",
            new List<CreatePostMediaRequest>
            {
                new("https://example.com/img.jpg", "img.jpg", MediaType.Image, -1)
            },
            new List<Guid>()
        );

        // Act
        var response = await Client.PatchAsJsonAsync($"/api/post/{postId}", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }
}