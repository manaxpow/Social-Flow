var builder = DistributedApplication.CreateBuilder(args);

var postgres = builder
    .AddPostgres("postgres")
    .WithDataVolume()
    .WithPgAdmin();

var database = postgres
    .AddDatabase("socialFlow");

var redis = builder
    .AddRedis("redis")
    .WithDataVolume();

var api = builder
    .AddProject<Projects.Api>("api")
    .WithReference(database)
    .WithReference(redis)
    .WaitFor(database)
    .WaitFor(redis)
    .WithExternalHttpEndpoints();

builder
    .AddViteApp("frontend", "../../Frontend")
    .WithPnpm()
    .WithReference(api)
    .WithEnvironment(
        "VITE_API_BASE_URL",
        api.GetEndpoint("https"))
    .WithEnvironment(
        "VITE_CLOUDINARY_CLOUD_NAME",
        "dviq7xxlu")
    .WithEnvironment(
        "VITE_CLOUDINARY_UPLOAD_PRESET",
        "ml_default")
    .WaitFor(api)
    .WithExternalHttpEndpoints();

builder.Build().Run();
