using FluentValidation;

namespace Musakuce.Application.Memorial;

public class CreateMemorialRecordRequestValidator : AbstractValidator<CreateMemorialRecordRequest>
{
    public CreateMemorialRecordRequestValidator()
    {
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(150);
        RuleFor(x => x.FatherName).MaximumLength(100);
        RuleFor(x => x.Category).IsInEnum();
        RuleFor(x => x.Biography).MaximumLength(8000);
        RuleFor(x => x.Achievements).MaximumLength(4000);
        RuleFor(x => x.SourceStatus).IsInEnum();
        RuleFor(x => x.SourceReference).MaximumLength(500);
        RuleFor(x => x.EditorialNote).MaximumLength(2000);
        RuleFor(x => x.OriginalSourceText).MaximumLength(8000);
        RuleFor(x => x.DeathDate)
            .GreaterThanOrEqualTo(x => x.BirthDate!.Value)
            .When(x => x.BirthDate.HasValue && x.DeathDate.HasValue)
            .WithMessage("DeathDate must be on or after BirthDate.");
    }
}

public class UpdateMemorialRecordRequestValidator : AbstractValidator<UpdateMemorialRecordRequest>
{
    public UpdateMemorialRecordRequestValidator()
    {
        Include(new CreateMemorialRecordRequestValidator());
    }
}

public class UpdateMemorialRecordStatusRequestValidator : AbstractValidator<UpdateMemorialRecordStatusRequest>
{
    public UpdateMemorialRecordStatusRequestValidator()
    {
        RuleFor(x => x.PublicationStatus).IsInEnum();
    }
}
