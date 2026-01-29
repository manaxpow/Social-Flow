using AutoMapper;
using MediatR;

public class UpdateReactionHandler : IRequestHandler<UpdateReactionCommand, Result<ReactionResponse>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IMapper _mapper;

    public UpdateReactionHandler(IUnitOfWork unitOfWork, IMapper mapper, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _currentUserService = currentUserService;
    }

    public async Task<Result<ReactionResponse>> Handle(UpdateReactionCommand request, CancellationToken cancellationToken)
    {
        var reaction = await _unitOfWork.Reactions.GetByIdAsync(request.Id);
        if (reaction == null) return Result<ReactionResponse>.Failure(ReactionErrors.NotFound);


        if (reaction.UserId != _currentUserService.UserId)
            return Result<ReactionResponse>.Failure(AuthErrors.Unauthorized);

        reaction.ReactType = request.ReactType;

        _unitOfWork.Reactions.Update(reaction);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result<ReactionResponse>.Success(_mapper.Map<ReactionResponse>(reaction));
    }
}