using System.Net;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

[Collection("Shared Database")]
public class DeletePostTests : IntegrationTestBase
{
    public DeletePostTests(SocialFlowApiFactory factory) : base(factory)
    {
    }

    private async Task<Guid> SeedPostAsync(Guid authorId, string content = "Post to be deleted")
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
            "Post with media to delete",
            authorId,
            new List<PostMedia>
            {
                new(postId, new CloudAsset("https://example.com/image.jpg", "image.jpg", MediaType.Image), 0)
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
    public async Task DeletePost_AsOwner_ShouldDeleteSuccessfully()
    {
        // Arrange
        var authorId = Guid.NewGuid();
        AuthenticateAs(authorId);
        await CreateUserAsync(authorId);

        var postId = await SeedPostAsync(authorId);

        // Act
        var response = await Client.DeleteAsync($"/api/post/{postId}");

        // Assert — HTTP response
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        // Assert — Post removed from database
        var post = await Context.Posts.FirstOrDefaultAsync(p => p.Id == postId);
        post.Should().BeNull();
    }

    [Fact]
    public async Task DeletePost_WithMedia_ShouldDeletePostAndMedia()
    {
        // Arrange
        var authorId = Guid.NewGuid();
        AuthenticateAs(authorId);
        await CreateUserAsync(authorId);

        var postId = await SeedPostWithMediaAsync(authorId);

        // Act
        var response = await Client.DeleteAsync($"/api/post/{postId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var post = await Context.Posts
            .Include(p => p.MediaItems)
            .FirstOrDefaultAsync(p => p.Id == postId);

        post.Should().BeNull();
    }

    [Fact]
    public async Task DeletePost_WithoutAuthentication_ShouldReturnUnauthorized()
    {
        // Arrange — explicitly clear authentication
        TestAuthHandler.CurrentUserId = null;

        // Act
        var response = await Client.DeleteAsync($"/api/post/{Guid.NewGuid()}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task DeletePost_AsNonOwner_ShouldReturnUnauthorized()
    {
        // Arrange
        var ownerId = Guid.NewGuid();
        var otherUserId = Guid.NewGuid();
        await CreateUserAsync(ownerId);
        await CreateUserAsync(otherUserId);

        var postId = await SeedPostAsync(ownerId);

        AuthenticateAs(otherUserId);

        // Act
        var response = await Client.DeleteAsync($"/api/post/{postId}");

        // Assert — handler checks post.AuthorId != currentUser and returns AuthErrors.Unauthorized
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // Verify post was NOT deleted
        var post = await Context.Posts.FirstOrDefaultAsync(p => p.Id == postId);
        post.Should().NotBeNull();
    }

    [Fact]
    public async Task DeletePost_WithNonExistentId_ShouldReturnNotFound()
    {
        // Arrange
        var authorId = Guid.NewGuid();
        AuthenticateAs(authorId);
        await CreateUserAsync(authorId);

        var fakePostId = Guid.NewGuid();

        // Act
        var response = await Client.DeleteAsync($"/api/post/{fakePostId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task DeletePost_WithEmptyGuid_ShouldReturnBadRequest()
    {
        // Arrange
        var authorId = Guid.NewGuid();
        AuthenticateAs(authorId);
        await CreateUserAsync(authorId);

        // Act — empty GUID fails route constraint, returns 400
        var response = await Client.DeleteAsync($"/api/post/{Guid.Empty}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }
}