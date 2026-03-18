using FluentValidation;

public class GetSearchPostsValidator : AbstractValidator<GetSearchPostsQuery>
{
    public GetSearchPostsValidator()
    {
        RuleFor(x => x.SearchTerm).NotEmpty();
        RuleFor(x => x.PageNumber).GreaterThanOrEqualTo(1);
        RuleFor(x => x.PageSize).GreaterThanOrEqualTo(1);
    }
}