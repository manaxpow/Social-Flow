using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

[Collection("Shared Database")]
public class CreatePostTests : IntegrationTestBase
{
    public CreatePostTests(SocialFlowApiFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task CreatePost_WithContentMediaAndMentions_ShouldCreateSuccessfully()
    {
        // Arrange
        var authorId = Guid.NewGuid();
        var mentionedUserId = Guid.NewGuid();
        const string imageUrl = "https://example.com/image.jpg";
        const string imagePublicId = "image.jpg";
        const string content = "Hello, world!";

        AuthenticateAs(authorId);
        await CreateUserAsync(authorId);
        await CreateUserAsync(mentionedUserId);

        var request = new CreatePostCommand(
            content,
            new List<CreatePostMediaRequest>
            {
                new(imageUrl, imagePublicId, MediaType.Image, 0)
            },
            null,
            new List<Guid> { mentionedUserId }
        );

        // Act
        var response = await Client.PostAsJsonAsync("/api/post", request);

        // Assert — HTTP response
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };
        options.Converters.Add(new JsonStringEnumConverter());

        var postResponse = await response.Content.ReadFromJsonAsync<PostDetailResponse>(options);
        postResponse.Should().NotBeNull();
        postResponse!.Id.Should().NotBeEmpty();
        postResponse.Content.Should().Be(content);
        postResponse.Author.Id.Should().Be(authorId);

        // Assert — Database state
        var post = await Context.Posts
            .Include(p => p.MediaItems)
            .Include(p => p.Mentions)
            .FirstOrDefaultAsync(p => p.Id == postResponse.Id);

        post.Should().NotBeNull();
        post!.Content.Should().Be(content);
        post.AuthorId.Should().Be(authorId);
        post.Type.Should().Be(PostType.Standard);

        // Assert — Media
        post.MediaItems.Should().HaveCount(1);
        var media = post.MediaItems.First();
        media.Media.Url.Should().Be(imageUrl);
        media.Media.Type.Should().Be(MediaType.Image);
        media.PostId.Should().Be(post.Id);
        media.SortOrder.Should().Be(0);

        // Assert — Mentions
        post.Mentions.Should().HaveCount(1);
        post.Mentions.First().UserId.Should().Be(mentionedUserId);
        post.Mentions.First().PostId.Should().Be(post.Id);
    }

    [Fact]
    public async Task CreatePost_WithOnlyContent_ShouldCreateSuccessfully()
    {
        // Arrange
        var authorId = Guid.NewGuid();
        const string content = "Just a text post";

        AuthenticateAs(authorId);
        await CreateUserAsync(authorId);

        var request = new CreatePostCommand(
            content,
            null,
            null,
            new List<Guid>()
        );

        // Act
        var response = await Client.PostAsJsonAsync("/api/post", request);

        // Assert
        response.EnsureSuccessStatusCode();
        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };
        options.Converters.Add(new JsonStringEnumConverter());
        var postResponse = await response.Content.ReadFromJsonAsync<PostDetailResponse>(options);
        postResponse.Should().NotBeNull();
        postResponse!.Content.Should().Be(content);
        postResponse.Author.Id.Should().Be(authorId);

        var post = await Context.Posts
            .Include(p => p.MediaItems)
            .FirstOrDefaultAsync(p => p.Id == postResponse.Id);

        post.Should().NotBeNull();
        post!.MediaItems.Should().BeEmpty();
        post.Mentions.Should().BeEmpty();
    }

    [Fact]
    public async Task CreatePost_WithOnlyMediaAndNoContent_ShouldCreateSuccessfully()
    {
        // Arrange
        var authorId = Guid.NewGuid();

        AuthenticateAs(authorId);
        await CreateUserAsync(authorId);

        var request = new CreatePostCommand(
            null!,
            new List<CreatePostMediaRequest>
            {
                new("https://example.com/photo.jpg", "photo.jpg", MediaType.Image, 0)
            },
            null,
            new List<Guid>()
        );

        // Act
        var response = await Client.PostAsJsonAsync("/api/post", request);

        // Assert
        response.EnsureSuccessStatusCode();
        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };
        options.Converters.Add(new JsonStringEnumConverter());
        var postResponse = await response.Content.ReadFromJsonAsync<PostDetailResponse>(options);
        postResponse.Should().NotBeNull();
        postResponse!.Author.Id.Should().Be(authorId);

        var post = await Context.Posts
            .Include(p => p.MediaItems)
            .FirstOrDefaultAsync(p => p.Id == postResponse.Id);

        post.Should().NotBeNull();
        post!.MediaItems.Should().HaveCount(1);
        post.Content.Should().BeNull();
    }

    [Fact]
    public async Task CreatePost_WithMultipleMediaItems_ShouldPersistAllInOrder()
    {
        // Arrange
        var authorId = Guid.NewGuid();

        AuthenticateAs(authorId);
        await CreateUserAsync(authorId);

        var request = new CreatePostCommand(
            "Multi-media post",
            new List<CreatePostMediaRequest>
            {
                new("https://example.com/img1.jpg", "img1.jpg", MediaType.Image, 0),
                new("https://example.com/img2.jpg", "img2.jpg", MediaType.Image, 1),
                new("https://example.com/vid1.mp4", "vid1.mp4", MediaType.Video, 2)
            },
            null,
            new List<Guid>()
        );

        // Act
        var response = await Client.PostAsJsonAsync("/api/post", request);

        // Assert
        response.EnsureSuccessStatusCode();
        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };
        options.Converters.Add(new JsonStringEnumConverter());
        var postResponse = await response.Content.ReadFromJsonAsync<PostDetailResponse>(options);

        var post = await Context.Posts
            .Include(p => p.MediaItems)
            .FirstOrDefaultAsync(p => p.Id == postResponse!.Id);

        post.Should().NotBeNull();
        post!.MediaItems.Should().HaveCount(3);

        var sortedMedia = post.MediaItems.OrderBy(m => m.SortOrder).ToList();
        sortedMedia[0].Media.Type.Should().Be(MediaType.Image);
        sortedMedia[0].SortOrder.Should().Be(0);
        sortedMedia[1].Media.Type.Should().Be(MediaType.Image);
        sortedMedia[1].SortOrder.Should().Be(1);
        sortedMedia[2].Media.Type.Should().Be(MediaType.Video);
        sortedMedia[2].SortOrder.Should().Be(2);
    }

    [Fact]
    public async Task CreatePost_WithMultipleMentions_ShouldPersistAll()
    {
        // Arrange
        var authorId = Guid.NewGuid();
        var mentionedUser1 = Guid.NewGuid();
        var mentionedUser2 = Guid.NewGuid();

        AuthenticateAs(authorId);
        await CreateUserAsync(authorId);
        await CreateUserAsync(mentionedUser1);
        await CreateUserAsync(mentionedUser2);

        var request = new CreatePostCommand(
            "Mentioning friends",
            null,
            null,
            new List<Guid> { mentionedUser1, mentionedUser2 }
        );

        // Act
        var response = await Client.PostAsJsonAsync("/api/post", request);

        // Assert
        response.EnsureSuccessStatusCode();
        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };
        options.Converters.Add(new JsonStringEnumConverter());
        var postResponse = await response.Content.ReadFromJsonAsync<PostDetailResponse>(options);

        var post = await Context.Posts
            .Include(p => p.Mentions)
            .FirstOrDefaultAsync(p => p.Id == postResponse!.Id);

        post.Should().NotBeNull();
        post!.Mentions.Should().HaveCount(2);
        post.Mentions.Select(m => m.UserId).Should().Contain(new[] { mentionedUser1, mentionedUser2 });
    }

    [Fact]
    public async Task CreatePost_WithoutAuthentication_ShouldReturnUnauthorized()
    {
        // Arrange — explicitly clear authentication
        TestAuthHandler.CurrentUserId = null;

        var request = new CreatePostCommand(
            "Unauthorized post",
            null,
            null,
            new List<Guid>()
        );

        // Act
        var response = await Client.PostAsJsonAsync("/api/post", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task CreatePost_WithEmptyContentAndNoMedia_ShouldReturnBadRequest()
    {
        // Arrange
        var authorId = Guid.NewGuid();
        AuthenticateAs(authorId);
        await CreateUserAsync(authorId);

        var request = new CreatePostCommand(
            null!,
            null,
            null,
            new List<Guid>()
        );

        // Act
        var response = await Client.PostAsJsonAsync("/api/post", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreatePost_WithContentExceedingMaxLength_ShouldReturnBadRequest()
    {
        // Arrange
        var authorId = Guid.NewGuid();
        AuthenticateAs(authorId);
        await CreateUserAsync(authorId);

        var longContent = new string('a', 10001);

        var request = new CreatePostCommand(
            longContent,
            null,
            null,
            new List<Guid>()
        );

        // Act
        var response = await Client.PostAsJsonAsync("/api/post", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreatePost_WithEmptyMediaList_ShouldReturnBadRequest()
    {
        // Arrange
        var authorId = Guid.NewGuid();
        AuthenticateAs(authorId);
        await CreateUserAsync(authorId);

        var request = new CreatePostCommand(
            null!,
            new List<CreatePostMediaRequest>(),
            null,
            new List<Guid>()
        );

        // Act
        var response = await Client.PostAsJsonAsync("/api/post", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreatePost_WithTooManyMediaItems_ShouldReturnBadRequest()
    {
        // Arrange
        var authorId = Guid.NewGuid();
        AuthenticateAs(authorId);
        await CreateUserAsync(authorId);

        var mediaItems = Enumerable.Range(0, 6)
            .Select(i => new CreatePostMediaRequest(
                $"https://example.com/img{i}.jpg",
                $"img{i}.jpg",
                MediaType.Image,
                i
            ))
            .ToList();

        var request = new CreatePostCommand(
            "Post with too many media",
            mediaItems,
            null,
            new List<Guid>()
        );

        // Act
        var response = await Client.PostAsJsonAsync("/api/post", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreatePost_WithDuplicateMentions_ShouldReturnBadRequest()
    {
        // Arrange
        var authorId = Guid.NewGuid();
        var mentionedUserId = Guid.NewGuid();
        AuthenticateAs(authorId);
        await CreateUserAsync(authorId);

        var request = new CreatePostCommand(
            "Duplicate mentions",
            null,
            null,
            new List<Guid> { mentionedUserId, mentionedUserId }
        );

        // Act
        var response = await Client.PostAsJsonAsync("/api/post", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreatePost_WithMediaMissingUrl_ShouldReturnBadRequest()
    {
        // Arrange
        var authorId = Guid.NewGuid();
        AuthenticateAs(authorId);
        await CreateUserAsync(authorId);

        var request = new CreatePostCommand(
            "Invalid media",
            new List<CreatePostMediaRequest>
            {
                new("", "image.jpg", MediaType.Image, 0)
            },
            null,
            new List<Guid>()
        );

        // Act
        var response = await Client.PostAsJsonAsync("/api/post", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreatePost_WithMediaMissingPublicId_ShouldReturnBadRequest()
    {
        // Arrange
        var authorId = Guid.NewGuid();
        AuthenticateAs(authorId);
        await CreateUserAsync(authorId);

        var request = new CreatePostCommand(
            "Invalid media publicId",
            new List<CreatePostMediaRequest>
            {
                new("https://example.com/img.jpg", "", MediaType.Image, 0)
            },
            null,
            new List<Guid>()
        );

        // Act
        var response = await Client.PostAsJsonAsync("/api/post", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreatePost_WithNegativeSortOrder_ShouldReturnBadRequest()
    {
        // Arrange
        var authorId = Guid.NewGuid();
        AuthenticateAs(authorId);
        await CreateUserAsync(authorId);

        var request = new CreatePostCommand(
            "Negative sort order",
            new List<CreatePostMediaRequest>
            {
                new("https://example.com/img.jpg", "img.jpg", MediaType.Image, -1)
            },
            null,
            new List<Guid>()
        );

        // Act
        var response = await Client.PostAsJsonAsync("/api/post", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreatePost_WithContentAtMaxLength_ShouldSucceed()
    {
        // Arrange
        var authorId = Guid.NewGuid();
        var content = new string('a', 1000);

        AuthenticateAs(authorId);
        await CreateUserAsync(authorId);

        var request = new CreatePostCommand(
            content,
            null,
            null,
            new List<Guid>()
        );

        // Act
        var response = await Client.PostAsJsonAsync("/api/post", request);

        // Assert
        response.EnsureSuccessStatusCode();
        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };
        options.Converters.Add(new JsonStringEnumConverter());
        var postResponse = await response.Content.ReadFromJsonAsync<PostDetailResponse>(options);

        var post = await Context.Posts.FirstOrDefaultAsync(p => p.Id == postResponse!.Id);
        post.Should().NotBeNull();
        post!.Content.Should().HaveLength(1000);
    }

    [Fact]
    public async Task CreatePost_WithMaxAllowedMediaItems_ShouldSucceed()
    {
        // Arrange
        var authorId = Guid.NewGuid();
        AuthenticateAs(authorId);
        await CreateUserAsync(authorId);

        var mediaItems = Enumerable.Range(0, 5)
            .Select(i => new CreatePostMediaRequest(
                $"https://example.com/img{i}.jpg",
                $"img{i}.jpg",
                MediaType.Image,
                i
            ))
            .ToList();

        var request = new CreatePostCommand(
            "Post with max media",
            mediaItems,
            null,
            new List<Guid>()
        );

        // Act
        var response = await Client.PostAsJsonAsync("/api/post", request);

        // Assert
        response.EnsureSuccessStatusCode();
        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };
        options.Converters.Add(new JsonStringEnumConverter());
        var postResponse = await response.Content.ReadFromJsonAsync<PostDetailResponse>(options);

        var post = await Context.Posts
            .Include(p => p.MediaItems)
            .FirstOrDefaultAsync(p => p.Id == postResponse!.Id);

        post.Should().NotBeNull();
        post!.MediaItems.Should().HaveCount(5);
    }
}