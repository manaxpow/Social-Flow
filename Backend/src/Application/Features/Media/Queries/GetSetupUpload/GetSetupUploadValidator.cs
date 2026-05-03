using FluentValidation;

public class GetSetupUploadValidator : AbstractValidator<GetSetupUploadQuery>
{
    public GetSetupUploadValidator()
    {
        RuleFor(x => x.Folder)
            .NotEmpty().WithMessage("Folder is required.")
            .MaximumLength(255).WithMessage("Folder name must not exceed 255 characters.");
    }
}