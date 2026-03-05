using AutoMapper;
using MediatR;
using SocialFlow.Domain.Events;

public class CreatePostHandler : IRequestHandler<CreatePostCommand, Result<PostResponse>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMediaService _mediaService;
    public CreatePostHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService, IMapper mapper, IMediaService mediaService)
    {
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _mapper = mapper;
        _mediaService = mediaService;
    }

    public async Task<Result<PostResponse>> Handle(CreatePostCommand request, CancellationToken cancellationToken)
    {
        if (_currentUserService.UserId == null || !_currentUserService.IsAuthenticated)
            return Result<PostResponse>.Failure(AuthErrors.Unauthorized);

        var uploadedImages = new List<CloudImage>();

        try
        {
            if (request.Files != null && request.Files.Count > 0)
            {
                foreach (var file in request.Files)
                {
                    var uploadResult = await _mediaService.UploadImageAsync(file, "posts");
                    if (uploadResult.IsSuccess)
                    {
                        uploadedImages.Add(new CloudImage(uploadResult.Url, uploadResult.PublicId));
                    }
                    else
                    {
                        return Result<PostResponse>.Failure(PostErrors.ImageUploadFailed);
                    }
                }
            }

            var post = new Post(
            Guid.NewGuid(),
            request.Content,
            _currentUserService.UserId.Value,
            request.SharedPostId,
            request.MentionedUserIds
            );

            post.AddImages(uploadedImages);

            await _unitOfWork.Posts.AddAsync(post);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var response = _mapper.Map<PostResponse>(post);
            return Result<PostResponse>.Success(response);

        }
        catch (System.Exception)
        {

            foreach (var img in uploadedImages)
            {
                await _mediaService.DeleteImageAsync(img.PublicId);
            }

            return Result<PostResponse>.Failure(PostErrors.ImageUploadFailed);
        }

    }
}
