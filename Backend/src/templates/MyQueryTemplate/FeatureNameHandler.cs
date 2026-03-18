using MediatR;

namespace Shop.Application.Features.Placeholder.Commands.FeatureName;

public class FeatureNameHandler : IRequestHandler<FeatureNameQuery, Result<FeatureNameResponse>>
{
    private readonly IMapper _mapper;

    public FeatureNameHandler(IMapper mapper)
    {
        _mapper = mapper;
    }

    public async Task<Result<FeatureNameResponse>> Handle(FeatureNameQuery request, CancellationToken cancellationToken)
    {
        // TODO: Implement business logic
        return Result<FeatureNameResponse>.Success(new FeatureNameResponse());
    }
}