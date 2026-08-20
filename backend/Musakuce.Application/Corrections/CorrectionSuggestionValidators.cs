using FluentValidation;
using Musakuce.Domain.Entities;

namespace Musakuce.Application.Corrections;

public class CreateCorrectionSuggestionRequestValidator : AbstractValidator<CreateCorrectionSuggestionRequest>
{
    public CreateCorrectionSuggestionRequestValidator()
    {
        RuleFor(x => x.TargetEntityType).NotEmpty().Must(t => CorrectionTargetTypes.All.Contains(t))
            .WithMessage("Unknown target content type.");
        RuleFor(x => x.TargetEntityId).NotEmpty();
        RuleFor(x => x.FieldOrSection).MaximumLength(200);
        RuleFor(x => x.SuggestedChange).MaximumLength(4000);
        RuleFor(x => x.AdditionalNotes).MaximumLength(4000);
        RuleFor(x => x.SubmitterName).MaximumLength(100);
        RuleFor(x => x.ContactInfo).MaximumLength(200);
        RuleFor(x => x)
            .Must(x => !string.IsNullOrWhiteSpace(x.SuggestedChange) || !string.IsNullOrWhiteSpace(x.AdditionalNotes) || x.PhotoMediaAssetId is not null)
            .WithMessage("Provide at least a proposed change, additional notes, or a photo.")
            .WithName("SuggestedChange");
    }
}

public class UpdateCorrectionSuggestionStatusRequestValidator : AbstractValidator<UpdateCorrectionSuggestionStatusRequest>
{
    public UpdateCorrectionSuggestionStatusRequestValidator()
    {
        RuleFor(x => x.Status).IsInEnum();
        RuleFor(x => x.ReviewerNote).MaximumLength(1000);
    }
}
