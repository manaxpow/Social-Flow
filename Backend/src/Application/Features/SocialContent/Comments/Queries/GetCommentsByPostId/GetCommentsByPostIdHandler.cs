using AutoMapper;
using MediatR;

namespace Shop.Application.Features.Placeholder.Commands.GetCommentsByPostId;

public class GetCommentsByPostIdHandler : IRequestHandler<GetCommentsByPostIdQuery, Result<PagedList<CommentResponse>>>
{
    private readonly IMapper _mapper;
    private readonly ICommentQueries _commentQueries;
    private readonly ICurrentUserService _currentUserService;
    private readonly IPostRepository _postRepository; // Để lấy AuthorId của Post

    public GetCommentsByPostIdHandler(
        IMapper mapper,
        ICommentQueries commentQueries,
        ICurrentUserService currentUserService,
        IPostRepository postRepository)
    {
        _mapper = mapper;
        _commentQueries = commentQueries;
        _currentUserService = currentUserService;
        _postRepository = postRepository;
    }

    public async Task<Result<PagedList<CommentResponse>>> Handle(GetCommentsByPostIdQuery request, CancellationToken cancellationToken)
    {
        // 1. Lấy thông tin bài viết để biết ai là PostAuthor
        var post = await _postRepository.GetByIdAsync(request.PostId);
        if (post == null) return Result<PagedList<CommentResponse>>.Failure(PostErrors.NotFound);

        // 2. Lấy danh sách comment từ Infra (Dapper)
        var currentUserId = _currentUserService.UserId;
        if (currentUserId == null) return Result<PagedList<CommentResponse>>.Failure(AuthErrors.Unauthorized);

        var pagedComments = await _commentQueries.GetCommentsByPostIdAsync(
            request.PostId,
            request.PageNumber,
            request.PageSize,
            currentUserId.Value,
            request.parentCommentId,
            cancellationToken);

        var enrichedItems = pagedComments.Items.Select(c =>
        {
            var response = _mapper.Map<CommentResponse>(c);

            return response with
            {
                IsCommentAuthor = c.Author.Id == currentUserId,
                IsPostAuthor = post.AuthorId == currentUserId,
                HasMoreReplies = c.ReplyCount > request.PageSize,
            };
        }).ToList();

        var result = new PagedList<CommentResponse>(
            enrichedItems,
            pagedComments.TotalCount,
            pagedComments.CurrentPage,
            pagedComments.PageSize);

        return Result<PagedList<CommentResponse>>.Success(result);
    }
}