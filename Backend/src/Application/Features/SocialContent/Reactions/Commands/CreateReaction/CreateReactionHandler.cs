using AutoMapper;
using MediatR;

public class CreateReactionHandler : IRequestHandler<CreateReactionCommand, Result<ReactionResponse>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUserService;

    public CreateReactionHandler(IUnitOfWork unitOfWork, IMapper mapper, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _currentUserService = currentUserService;
    }

    public async Task<Result<ReactionResponse>> Handle(CreateReactionCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue)
            return Result<ReactionResponse>.Failure(AuthErrors.Unauthorized);

        // Check if user already has a reaction on this target
        var existingReaction = await _unitOfWork.Reactions.GetByUserAndTargetAsync(userId.Value, request.TargetId, cancellationToken);

        if (existingReaction != null)
        {
            // If same type -> toggle off (soft delete)
            if (existingReaction.ReactType == request.ReactType)
            {
                _unitOfWork.Reactions.Delete(existingReaction);
                await _unitOfWork.SaveChangesAsync(cancellationToken);
                return Result<ReactionResponse>.Success(_mapper.Map<ReactionResponse>(existingReaction));
            }

            // Different type -> update to new type
            existingReaction.UpdateReactType(request.ReactType);
            _unitOfWork.Reactions.Update(existingReaction);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return Result<ReactionResponse>.Success(_mapper.Map<ReactionResponse>(existingReaction));
        }

        // No existing reaction -> create new one
        var reaction = new Reaction(request.TargetId, request.TargetType, userId.Value, request.ReactType);
        await _unitOfWork.Reactions.AddAsync(reaction, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result<ReactionResponse>.Success(_mapper.Map<ReactionResponse>(reaction));
    }
}
