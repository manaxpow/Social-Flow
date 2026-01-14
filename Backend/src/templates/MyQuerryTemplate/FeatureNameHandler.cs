using MediatR;
using Shop.Application.Common.Interfaces;

namespace Shop.Application.Features.Placeholder.Commands.FeatureName;

public class FeatureNameHandler : IRequestHandler<FeatureNameCommand, ApiResponse<FeatureNameResponse>>
{
    private readonly IAppDbContext _context;
    private readonly IMapper _mapper;

    public FeatureNameHandler(IAppDbContext context,IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<ApiResponse<FeatureNameResponse>> Handle(FeatureNameCommand request, CancellationToken cancellationToken)
    {
        // TODO: Implement business logic
        return ApiResponse<FeatureNameResponse>.Success(new FeatureNameResponse());
    }
}