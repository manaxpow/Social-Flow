using AutoMapper;
using MediatR;

namespace Application.Features.SocialContent.Comments.Queries.GetCommentReplies;

public class GetCommentRepliesHandler : IRequestHandler<GetCommentRepliesQuery, Result<PagedList<CommentResponse>>>
{
    private readonly IMapper _mapper;
    private readonly ICommentQueries _commentQueries;
    private readonly IPostRepository _postRepository;
    private readonly ICurrentUserService _currentUserService;


    public GetCommentRepliesHandler(IMapper mapper, ICommentQueries commentQueries, ICurrentUserService currentUserService, IPostRepository postRepository)
    {
        _mapper = mapper;
        _commentQueries = commentQueries;
        _currentUserService = currentUserService;
        _postRepository = postRepository;
    }

    public async Task<Result<PagedList<CommentResponse>>> Handle(GetCommentRepliesQuery request, CancellationToken cancellationToken)
    {
        var post = await _postRepository.GetByIdAsync(request.PostId);
        if (post == null) return Result<PagedList<CommentResponse>>.Failure(PostErrors.NotFound);

        var currentUserId = _currentUserService.UserId;
        if (currentUserId == null) return Result<PagedList<CommentResponse>>.Failure(AuthErrors.Unauthorized);

        var replies = await _commentQueries.GetRepliesByCommentIdAsync(
            request.CommentId,
            request.PageNumber,
            request.PageSize,
            currentUserId.Value,
            cancellationToken);

        var enrichedItems = replies.Items.Select(c =>
               {
                   var response = _mapper.Map<CommentResponse>(c);

                   return response with
                   {
                       IsCommentAuthor = c.Author.Id == currentUserId,
                       IsPostAuthor = post.AuthorId == currentUserId,
                       HasMoreReplies = c.ReplyCount > request.PageSize,
                   };
               }).ToList();

        return Result<PagedList<CommentResponse>>.Success(_mapper.Map<PagedList<CommentResponse>>(replies));
    }
}
