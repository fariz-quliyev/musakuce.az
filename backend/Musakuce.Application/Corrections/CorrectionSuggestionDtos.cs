using Musakuce.Application.Common;
using Musakuce.Domain.Enums;

namespace Musakuce.Application.Corrections;

public record CorrectionSuggestionDto(
    Guid Id,
    string TargetEntityType,
    Guid TargetEntityId,
    string TargetTitle,
    string? FieldOrSection,
    string? SuggestedChange,
    string? AdditionalNotes,
    Guid? PhotoMediaAssetId,
    string? PhotoUrl,
    string? SubmitterName,
    string? ContactInfo,
    ModerationStatus Status,
    string? ReviewerNote,
    DateTimeOffset CreatedAt
);

/// <summary>The public, anonymous "Düzəliş təklif et" intake — always
/// created Pending regardless of who submits it. At least one of
/// SuggestedChange, AdditionalNotes, or PhotoMediaAssetId must be
/// present (enforced by CreateCorrectionSuggestionRequestValidator) — an
/// empty suggestion carries nothing for a moderator to review.</summary>
public class CreateCorrectionSuggestionRequest
{
    public required string TargetEntityType { get; set; }
    public required Guid TargetEntityId { get; set; }
    public string? FieldOrSection { get; set; }
    public string? SuggestedChange { get; set; }
    public string? AdditionalNotes { get; set; }
    public Guid? PhotoMediaAssetId { get; set; }
    public string? SubmitterName { get; set; }
    public string? ContactInfo { get; set; }
}

public class UpdateCorrectionSuggestionStatusRequest
{
    public required ModerationStatus Status { get; set; }
    public string? ReviewerNote { get; set; }
}

public class CorrectionSuggestionQuery : PagedQuery
{
    public ModerationStatus? Status { get; set; }
    public string? TargetEntityType { get; set; }
}
