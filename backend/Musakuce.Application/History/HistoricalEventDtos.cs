using Musakuce.Application.Common;
using Musakuce.Domain.Enums;

namespace Musakuce.Application.History;

public record HistoricalEventDto(
    Guid Id,
    string Title,
    string Period,
    DateOnly? EventDate,
    string Description,
    SourceStatus SourceStatus,
    string? SourceReference,
    /// <summary>Null unless the caller is a privileged, authenticated
    /// viewer (Phase 12 §7) — never sent to the public site.</summary>
    string? EditorialNote,
    /// <summary>Null unless the caller is a privileged, authenticated
    /// viewer (Phase 12 §7) — never sent to the public site.</summary>
    string? OriginalSourceText,
    int DisplayOrder,
    PublicationStatus PublicationStatus
);

public class CreateHistoricalEventRequest
{
    public required string Title { get; set; }
    public required string Period { get; set; }
    public DateOnly? EventDate { get; set; }
    public required string Description { get; set; }
    public SourceStatus SourceStatus { get; set; } = SourceStatus.UnderResearch;
    /// <summary>Free-text citation — e.g. "Ailə arxivi, Səlim baba ilə söhbət, 2020".</summary>
    public string? SourceReference { get; set; }
    /// <summary>ADMIN-ONLY editorial working note — never public.</summary>
    public string? EditorialNote { get; set; }
    /// <summary>ADMIN-ONLY original source wording — never public.</summary>
    public string? OriginalSourceText { get; set; }
    public int DisplayOrder { get; set; }
}

/// <summary>ADMIN-PRIVILEGED — full field edit.</summary>
public class UpdateHistoricalEventRequest : CreateHistoricalEventRequest;

public class UpdateHistoricalEventStatusRequest
{
    public required PublicationStatus PublicationStatus { get; set; }
}

public class HistoricalEventQuery : PagedQuery
{
    public PublicationStatus? PublicationStatus { get; set; }
}
