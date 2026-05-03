using MediatR;

namespace Shop.Application.Features.Placeholder.Commands.GetSetupUpload;

public class GetSetupUploadHandler : IRequestHandler<GetSetupUploadQuery, Result<SetupUploadResponse>>
{
    private readonly IMediaService _mediaService;
    public GetSetupUploadHandler(IMediaService mediaService)
    {
        _mediaService = mediaService;
    }


    public async Task<Result<SetupUploadResponse>> Handle(GetSetupUploadQuery request, CancellationToken cancellationToken)
    {
        var setupUploadResponse = _mediaService.GenerateSignature(request.Folder);
        return Result<SetupUploadResponse>.Success(setupUploadResponse);
    }
}