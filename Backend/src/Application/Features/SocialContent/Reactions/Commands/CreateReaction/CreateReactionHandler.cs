using AutoMapper;
using MediatR;

public class CreateReactionHandler : IRequestHandler<CreateReactionCommand, Result<ReactionResponse>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public CreateReactionHandler(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<ReactionResponse>> Handle(CreateReactionCommand request, CancellationToken cancellationToken)
    {
        var reaction = _mapper.Map<Reaction>(request);
        await _unitOfWork.Reactions.AddAsync(reaction);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result<ReactionResponse>.Success(_mapper.Map<ReactionResponse>(reaction));
    }
}