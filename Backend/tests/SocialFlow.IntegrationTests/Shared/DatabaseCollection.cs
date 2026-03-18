using Xunit;

namespace SocialFlow.IntegrationTests;

[CollectionDefinition("Shared Database")]
public class DatabaseCollection : ICollectionFixture<SocialFlowApiFactory>
{
    // Class này không có code, chỉ dùng để định nghĩa Collection
}