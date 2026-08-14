using FluentValidation;

namespace Musakuce.Application.Interviews;

public class CreateInterviewRequestValidator : AbstractValidator<CreateInterviewRequest>
{
    public CreateInterviewRequestValidator()
    {
        RuleFor(x => x.PersonName).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Title).MaximumLength(200);
        RuleFor(x => x.Description).MaximumLength(2000);
        RuleFor(x => x.Transcript).MaximumLength(20000);
        RuleFor(x => x.EmbedProvider).IsInEnum();
        RuleFor(x => x.EmbedUrlOrKey).NotEmpty().MaximumLength(500);
        RuleFor(x => x.SourceStatus).IsInEnum();
        RuleFor(x => x.SourceReference).MaximumLength(500);
        RuleFor(x => x.EditorialNote).MaximumLength(2000);
        RuleFor(x => x.OriginalSourceText).MaximumLength(8000);
    }
}

public class UpdateInterviewRequestValidator : AbstractValidator<UpdateInterviewRequest>
{
    public UpdateInterviewRequestValidator()
    {
        Include(new CreateInterviewRequestValidator());
    }
}

public class UpdateInterviewStatusRequestValidator : AbstractValidator<UpdateInterviewStatusRequest>
{
    public UpdateInterviewStatusRequestValidator()
    {
        RuleFor(x => x.PublicationStatus).IsInEnum();
    }
}
