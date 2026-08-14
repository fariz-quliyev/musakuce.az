using FluentValidation;
using Musakuce.Domain.Enums;

namespace Musakuce.Application.Listings;

public class CreateListingRequestValidator : AbstractValidator<CreateListingRequest>
{
    public CreateListingRequestValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(150);
        RuleFor(x => x.Description).NotEmpty().MaximumLength(4000);
        RuleFor(x => x.Category).IsInEnum();
        RuleFor(x => x.Price).GreaterThanOrEqualTo(0).When(x => x.Price.HasValue);
        RuleFor(x => x.Location).NotEmpty().MaximumLength(200);
        RuleFor(x => x.ContactName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.ContactInfo).NotEmpty().MaximumLength(200);
        RuleFor(x => x.ImageUrls).Must(x => x.Count <= 10)
            .WithMessage("A listing can have at most 10 images.");
    }
}

/// <summary>ADMIN-PRIVILEGED.</summary>
public class UpdateListingRequestValidator : AbstractValidator<UpdateListingRequest>
{
    public UpdateListingRequestValidator()
    {
        Include(new CreateListingRequestValidator());
    }
}

/// <summary>ADMIN-PRIVILEGED.</summary>
public class UpdateListingStatusRequestValidator : AbstractValidator<UpdateListingStatusRequest>
{
    public UpdateListingStatusRequestValidator()
    {
        RuleFor(x => x)
            .Must(x => x.ModerationStatus.HasValue || x.ListingStatus.HasValue)
            .WithMessage("At least one of moderationStatus or listingStatus must be supplied.");
        RuleFor(x => x.ModerationStatus!.Value).IsInEnum().When(x => x.ModerationStatus.HasValue);
        RuleFor(x => x.ListingStatus!.Value).IsInEnum().When(x => x.ListingStatus.HasValue);
        RuleFor(x => x.RejectionReason)
            .NotEmpty().WithMessage("A rejection reason is required when rejecting a listing.")
            .When(x => x.ModerationStatus == ModerationStatus.Rejected);
    }
}
