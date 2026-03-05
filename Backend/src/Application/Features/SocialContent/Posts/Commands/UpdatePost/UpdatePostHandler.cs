using AutoMapper;
using MediatR;

public class UpdatePostHandler : IRequestHandler<UpdatePostCommand, Result<PostResponse>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMediaService _mediaService;

    public UpdatePostHandler(IUnitOfWork unitOfWork, IMapper mapper, ICurrentUserService currentUserService, IMediaService mediaService)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _currentUserService = currentUserService;
        _mediaService = mediaService;
    }

    public async Task<Result<PostResponse>> Handle(UpdatePostCommand request, CancellationToken cancellationToken)
    {
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

            var post = await _unitOfWork.Posts.GetByIdAsync(request.Id);
            if (post is null) return Result<PostResponse>.Failure(PostErrors.NotFound);

            if (post.AuthorId != _currentUserService.UserId) return Result<PostResponse>.Failure(AuthErrors.Unauthorized);

            post.UpdateContent(request.Content ?? post.Content);

            if (uploadedImages.Count > 0)
            {
                post.AddImages(uploadedImages);
            }

            if (request.MentionedUserIds != null)
            {
                var newMentions = request.MentionedUserIds.Select(userId => new Mention(userId, post.Id, null)).ToList();
                post.UpdateMentions(newMentions);
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var response = _mapper.Map<PostResponse>(post);
            return Result<PostResponse>.Success(response);

        }
        catch
        {
            foreach (var img in uploadedImages)
            {
                await _mediaService.DeleteImageAsync(img.PublicId);
            }

            return Result<PostResponse>.Failure(PostErrors.ImageUploadFailed);
        }
    }
}