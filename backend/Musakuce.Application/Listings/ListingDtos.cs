using Musakuce.Application.Common;
using Musakuce.Domain.Enums;

namespace Musakuce.Application.Listings;

public record ListingDto(
    Guid Id,
    string Title,
    string Description,
    ClassifiedCategory Category,
    decimal? Price,
    string Location,
    string ContactName,
    string ContactInfo,
    ListingStatus ListingStatus,
    ModerationStatus ModerationStatus,
    string? RejectionReason,
    DateTimeOffset PostedAt,
    DateTimeOffset ExpiresAt,
    IReadOnlyList<string> ImageUrls
);

/// <summary>Public, anonymous submission — no status fields; the server
/// always creates it as Pending/Active.</summary>
public class CreateListingRequest
{
    public required string Title { get; set; }
    public required string Description { get; set; }
    public ClassifiedCategory Category { get; set; }
    public decimal? Price { get; set; }
    public required string Location { get; set; }
    public required string ContactName { get; set; }
    public required string ContactInfo { get; set; }
    public List<string> ImageUrls { get; set; } = [];
}

/// <summary>
/// ADMIN-PRIVILEGED — full field edit (typo fixes, correcting a
/// submitter's entry before approval, etc). No authentication/RBAC
/// exists yet (Phase 7); this endpoint MUST be protected before any
/// production deployment.
/// </summary>
public class UpdateListingRequest : CreateListingRequest;

/// <summary>
/// ADMIN-PRIVILEGED moderation action — at least one field must be
/// supplied. Same pre-production auth requirement as UpdateListingRequest.
/// </summary>
public class UpdateListingStatusRequest
{
    public ModerationStatus? ModerationStatus { get; set; }
    public ListingStatus? ListingStatus { get; set; }
    /// <summary>Required in practice when ModerationStatus is Rejected —
    /// enforced by the validator, not the type system, since it's only
    /// conditionally required.</summary>
    public string? RejectionReason { get; set; }
}

public class ListingQuery : PagedQuery
{
    public ClassifiedCategory? Category { get; set; }
    public ListingStatus? ListingStatus { get; set; }
    public ModerationStatus? ModerationStatus { get; set; }
    /// <summary>"newest" (default), "priceAsc", or "priceDesc".</summary>
    public string? SortBy { get; set; }
}
