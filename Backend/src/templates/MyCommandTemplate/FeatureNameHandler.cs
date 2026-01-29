public class FeatureNameHandler : IRequestHandler<FeatureNameCommand, Result<FeatureNameResponse>>
{
    private readonly IUnitOfWork _unitOfWork;

    public FeatureNameHandler(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<FeatureNameResponse>> Handle(FeatureNameCommand request, CancellationToken cancellationToken)
    {
        // TODO: Implement business logic
        return Result<FeatureNameResponse>.Success(new FeatureNameResponse());
    }
}