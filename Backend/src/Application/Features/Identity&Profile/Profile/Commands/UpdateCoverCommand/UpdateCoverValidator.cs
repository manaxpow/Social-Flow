using FluentValidation;

public class UpdateCoverValidator : AbstractValidator<UpdateCoverCommand>
{
    public UpdateCoverValidator()
    {
        this.ApplyMediaRules(
            x => x.CoverUrl,
            x => x.MediaType,
            x => x.PublicId
        );
    }
}