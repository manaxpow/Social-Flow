public class FeatureNameHandler : IRequestHandler<FeatureNameCommand, ApiResponse<FeatureNameResponse>>
{
    private readonly IAppDbContext _context;

    public FeatureNameHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<FeatureNameResponse>> Handle(FeatureNameCommand request, CancellationToken cancellationToken)
    {
        // TODO: Implement business logic
        return ApiResponse<FeatureNameResponse>.Success(new FeatureNameResponse());
    }
}