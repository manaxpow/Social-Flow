using MediatR;

public class DeleteMediaHandler : IRequestHandler<DeleteMediaCommand, Result<Unit>>
{
    private readonly IMediaService _mediaService;

    public DeleteMediaHandler(IMediaService mediaService)
    {
        _mediaService = mediaService;
    }

    public async Task<Result<Unit>> Handle(DeleteMediaCommand request, CancellationToken cancellationToken)
    {
        await _mediaService.DeleteAssetAsync(request.PublicId, request.MediaType);
        return Result<Unit>.Success(Unit.Value);
    }
}