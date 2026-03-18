using AutoMapper;
using MediatR;

public class CreateCommentHandler : IRequestHandler<CreateCommentCommand, Result<CommentResponse>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public CreateCommentHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<CommentResponse>> Handle(CreateCommentCommand request, CancellationToken cancellationToken)
    {
        var comment = _mapper.Map<Comment>(request);
        await _unitOfWork.Comments.AddAsync(comment);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result<CommentResponse>.Success(_mapper.Map<CommentResponse>(comment));
    }
}