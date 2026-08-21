using FluentValidation;

namespace Musakuce.Application.Education;

public class CreateEducationEntryRequestValidator : AbstractValidator<CreateEducationEntryRequest>
{
    public CreateEducationEntryRequestValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Kind).IsInEnum();
        RuleFor(x => x.OtherKindLabel).MaximumLength(100);
        RuleFor(x => x.Summary).MaximumLength(500);
        RuleFor(x => x.Content).MaximumLength(16000);
        RuleFor(x => x.Period).MaximumLength(50);
        RuleFor(x => x.SourceStatus).IsInEnum();
        RuleFor(x => x.SourceReference).MaximumLength(500);
        RuleFor(x => x.EditorialNote).MaximumLength(2000);
        RuleFor(x => x.OriginalSourceText).MaximumLength(8000);
    }
}

public class UpdateEducationEntryRequestValidator : AbstractValidator<UpdateEducationEntryRequest>
{
    public UpdateEducationEntryRequestValidator()
    {
        Include(new CreateEducationEntryRequestValidator());
    }
}

public class UpdateEducationEntryStatusRequestValidator : AbstractValidator<UpdateEducationEntryStatusRequest>
{
    public UpdateEducationEntryStatusRequestValidator()
    {
        RuleFor(x => x.PublicationStatus).IsInEnum();
    }
}
