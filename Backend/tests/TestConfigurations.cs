using Xunit;

// Tắt chạy song song cho toàn bộ project Test
[assembly: CollectionBehavior(DisableParallelization = true)]