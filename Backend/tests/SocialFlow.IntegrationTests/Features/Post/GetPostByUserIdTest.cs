using System.Net;
using System.Text.Json;
using FluentAssertions;

public class GetPostByUserIdTest(SocialFlowApiFactory factory) : IntegrationTestBase(factory)
{
    [Fact]
    public async Task GetPostsByUserId_ShouldReturnPostsWithDetails()
    {
        // --- Arrange ---
        var user = await CreateUserAsync(TestAuthHandler.CurrentUserId);
        var post = new Post
        (
            id: Guid.NewGuid(),
            content: "Hello World!",
            authorId: user.Id,
            sharedPostId: null,
            mentionedUserIds: new List<Guid>()
        );
        Context.Posts.Add(post);
        await Context.SaveChangesAsync();

        // --- Act ---
        var response = await Client.GetAsync($"/api/posts/user/{user.Id}?pageNumber=1&pageSize=10");

        // --- Assert ---
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        var pagedPosts = JsonSerializer.Deserialize<PagedList<PostDetailReponse>>(content, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        pagedPosts.Should().NotBeNull();
        pagedPosts!.Items.Should().ContainSingle();
        var postDetail = pagedPosts.Items.First();
        postDetail.Id.Should().Be(post.Id);
        postDetail.Content.Should().Be(post.Content);
        postDetail.AuthorName.Should().Be($"{user.FirstName} {user.LastName}");
    }
}