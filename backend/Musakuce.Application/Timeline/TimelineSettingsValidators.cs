using FluentValidation;

namespace Musakuce.Application.Timeline;

public class UpsertTimelineSettingsRequestValidator : AbstractValidator<UpsertTimelineSettingsRequest>
{
    public UpsertTimelineSettingsRequestValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Subtitle).NotEmpty().MaximumLength(500);
        RuleFor(x => x.MaxEventsDesktop).GreaterThan(0).When(x => x.MaxEventsDesktop.HasValue);
        RuleFor(x => x.DefaultSelection).Must(v => v is "First" or "Last")
            .WithMessage("DefaultSelection must be 'First' or 'Last'.");
        RuleFor(x => x.MobileBehavior).NotEmpty().MaximumLength(30);
    }
}
