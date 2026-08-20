using Microsoft.EntityFrameworkCore;
using Musakuce.Application.Abstractions;
using Musakuce.Application.Audit;
using Musakuce.Application.Common;
using Musakuce.Domain.Entities;
using Musakuce.Domain.Enums;

namespace Musakuce.Application.Corrections;

public class CorrectionSuggestionService(IMusakuceDbContext db, IAuditLogService auditLog) : ICorrectionSuggestionService
{
    public async Task<PagedResult<CorrectionSuggestionDto>> GetPagedAsync(CorrectionSuggestionQuery query, CancellationToken ct = default)
    {
        var suggestions = db.CorrectionSuggestions
            .Include(s => s.PhotoMediaAsset)
            .AsNoTracking()
            .AsQueryable();

        if (query.Status is not null)
            suggestions = suggestions.Where(s => s.Status == query.Status);
        if (!string.IsNullOrWhiteSpace(query.TargetEntityType))
            suggestions = suggestions.Where(s => s.TargetEntityType == query.TargetEntityType);
        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var term = query.Search.ToLower();
            suggestions = suggestions.Where(s => s.TargetTitle.ToLower().Contains(term));
        }

        suggestions = suggestions.OrderByDescending(s => s.CreatedAt);

        var totalCount = await suggestions.CountAsync(ct);
        var items = await suggestions
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(ct);

        return PagedResult<CorrectionSuggestionDto>.Create(items.Select(ToDto).ToList(), query.Page, query.PageSize, totalCount);
    }

    public async Task<CorrectionSuggestionDto> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var suggestion = await db.CorrectionSuggestions
            .Include(s => s.PhotoMediaAsset)
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == id, ct)
            ?? throw new NotFoundException(nameof(CorrectionSuggestion), id);
        return ToDto(suggestion);
    }

    public async Task<CorrectionSuggestionDto> CreateAsync(CreateCorrectionSuggestionRequest request, CancellationToken ct = default)
    {
        var targetTitle = await ResolveTargetTitleAsync(request.TargetEntityType, request.TargetEntityId, ct)
            ?? throw new NotFoundException(request.TargetEntityType, request.TargetEntityId);

        var suggestion = new CorrectionSuggestion
        {
            TargetEntityType = request.TargetEntityType,
            TargetEntityId = request.TargetEntityId,
            TargetTitle = targetTitle,
            FieldOrSection = request.FieldOrSection,
            SuggestedChange = request.SuggestedChange,
            AdditionalNotes = request.AdditionalNotes,
            SubmitterName = request.SubmitterName,
            ContactInfo = request.ContactInfo,
        };

        if (request.PhotoMediaAssetId is { } mediaId)
        {
            suggestion.PhotoMediaAsset = await db.MediaAssets.FirstOrDefaultAsync(m => m.Id == mediaId, ct)
                ?? throw new NotFoundException(nameof(MediaAsset), mediaId);
        }

        db.CorrectionSuggestions.Add(suggestion);
        await db.SaveChangesAsync(ct);
        await auditLog.LogAsync("Create", nameof(CorrectionSuggestion), suggestion.Id.ToString(), newValue: $"{suggestion.TargetEntityType}:{suggestion.TargetTitle}", ct: ct);
        return ToDto(suggestion);
    }

    public async Task<CorrectionSuggestionDto> UpdateStatusAsync(Guid id, UpdateCorrectionSuggestionStatusRequest request, CancellationToken ct = default)
    {
        var suggestion = await db.CorrectionSuggestions
            .Include(s => s.PhotoMediaAsset)
            .FirstOrDefaultAsync(s => s.Id == id, ct)
            ?? throw new NotFoundException(nameof(CorrectionSuggestion), id);

        var oldStatus = suggestion.Status;
        suggestion.Status = request.Status;
        suggestion.ReviewerNote = request.ReviewerNote;
        suggestion.UpdatedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(ct);

        var action = request.Status switch
        {
            ModerationStatus.Approved => "Approve",
            ModerationStatus.Rejected => "Reject",
            _ => "CorrectionStatusChange",
        };
        await auditLog.LogAsync(action, nameof(CorrectionSuggestion), suggestion.Id.ToString(), oldStatus.ToString(), suggestion.Status.ToString(), ct);

        return ToDto(suggestion);
    }

    /// <summary>Looks up the current display title of the suggestion's
    /// target so the admin list/detail view can show what it's about
    /// without needing a generic cross-entity join. Returns null if the
    /// target no longer exists (surfaced by the caller as 404 — a
    /// suggestion cannot be filed against a record that isn't there).</summary>
    private async Task<string?> ResolveTargetTitleAsync(string targetEntityType, Guid targetEntityId, CancellationToken ct) =>
        targetEntityType switch
        {
            CorrectionTargetTypes.Person => await db.People.Where(p => p.Id == targetEntityId)
                .Select(p => p.FirstName + " " + p.LastName).FirstOrDefaultAsync(ct),
            CorrectionTargetTypes.HistoricalEvent => await db.HistoricalEvents.Where(e => e.Id == targetEntityId)
                .Select(e => e.Title).FirstOrDefaultAsync(ct),
            CorrectionTargetTypes.EducationEntry => await db.EducationEntries.Where(e => e.Id == targetEntityId)
                .Select(e => e.Title).FirstOrDefaultAsync(ct),
            CorrectionTargetTypes.MemorialRecord => await db.MemorialRecords.Where(m => m.Id == targetEntityId)
                .Select(m => m.FullName).FirstOrDefaultAsync(ct),
            CorrectionTargetTypes.CulturalHeritageItem => await db.CulturalHeritageItems.Where(c => c.Id == targetEntityId)
                .Select(c => c.Title).FirstOrDefaultAsync(ct),
            CorrectionTargetTypes.Interview => await db.Interviews.Where(i => i.Id == targetEntityId)
                .Select(i => i.Title ?? i.PersonName).FirstOrDefaultAsync(ct),
            CorrectionTargetTypes.Place => await db.Places.Where(p => p.Id == targetEntityId)
                .Select(p => p.Name).FirstOrDefaultAsync(ct),
            CorrectionTargetTypes.LocalInfoEntry => await db.LocalInfoEntries.Where(l => l.Id == targetEntityId)
                .Select(l => l.Name).FirstOrDefaultAsync(ct),
            CorrectionTargetTypes.Photo => await db.Photos.Where(p => p.Id == targetEntityId)
                .Select(p => p.Title).FirstOrDefaultAsync(ct),
            CorrectionTargetTypes.Video => await db.Videos.Where(v => v.Id == targetEntityId)
                .Select(v => v.Title).FirstOrDefaultAsync(ct),
            _ => null,
        };

    private static CorrectionSuggestionDto ToDto(CorrectionSuggestion s) => new(
        s.Id, s.TargetEntityType, s.TargetEntityId, s.TargetTitle, s.FieldOrSection, s.SuggestedChange, s.AdditionalNotes,
        s.PhotoMediaAssetId, s.PhotoMediaAsset?.Url, s.SubmitterName, s.ContactInfo, s.Status, s.ReviewerNote, s.CreatedAt);
}
