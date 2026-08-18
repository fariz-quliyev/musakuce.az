using FluentValidation;

namespace Musakuce.Application.History;

public class CreateHistoricalEventRequestValidator : AbstractValidator<CreateHistoricalEventRequest>
{
    public CreateHistoricalEventRequestValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Period).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Description).NotEmpty().MaximumLength(4000);
        RuleFor(x => x.DetailedText).MaximumLength(8000);
        RuleFor(x => x.SourceStatus).IsInEnum();
        RuleFor(x => x.SourceReference).MaximumLength(500);
        RuleFor(x => x.EditorialNote).MaximumLength(2000);
        RuleFor(x => x.OriginalSourceText).MaximumLength(8000);
    }
}

public class UpdateHistoricalEventRequestValidator : AbstractValidator<UpdateHistoricalEventRequest>
{
    public UpdateHistoricalEventRequestValidator()
    {
        Include(new CreateHistoricalEventRequestValidator());
    }
}

public class UpdateHistoricalEventStatusRequestValidator : AbstractValidator<UpdateHistoricalEventStatusRequest>
{
    public UpdateHistoricalEventStatusRequestValidator()
    {
        RuleFor(x => x.PublicationStatus).IsInEnum();
    }
}
