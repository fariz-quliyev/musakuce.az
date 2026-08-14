using FluentValidation;

namespace Musakuce.Application.Events;

public class CreateEventRequestValidator : AbstractValidator<CreateEventRequest>
{
    public CreateEventRequestValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Description).NotEmpty().MaximumLength(4000);
        RuleFor(x => x.Category).IsInEnum();
        RuleFor(x => x.Location).NotEmpty().MaximumLength(200);
        RuleFor(x => x.EndsAt).GreaterThanOrEqualTo(x => x.StartsAt).When(x => x.EndsAt.HasValue)
            .WithMessage("EndsAt must be after StartsAt.");
    }
}

public class UpdateEventRequestValidator : AbstractValidator<UpdateEventRequest>
{
    public UpdateEventRequestValidator()
    {
        Include(new CreateEventRequestValidator());
    }
}

public class UpdateEventStatusRequestValidator : AbstractValidator<UpdateEventStatusRequest>
{
    public UpdateEventStatusRequestValidator()
    {
        RuleFor(x => x.PublicationStatus).IsInEnum();
    }
}
