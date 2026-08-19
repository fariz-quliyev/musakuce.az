using Microsoft.EntityFrameworkCore;
using Musakuce.Application.Abstractions;
using Musakuce.Application.Audit;
using Musakuce.Application.Common;
using Musakuce.Application.Media;
using Musakuce.Domain.Entities;
using Musakuce.Domain.Enums;

namespace Musakuce.Application.People;

public class PersonService(IMusakuceDbContext db, IAuditLogService auditLog, IMediaUploadService mediaUploadService) : IPersonService
{
    public async Task<PagedResult<PersonDto>> GetPagedAsync(PersonQuery query, bool includeEditorial, CancellationToken ct = default)
    {
        var people = db.People
            .Include(p => p.CoverMediaAsset)
            .Include(p => p.AdditionalImages).ThenInclude(i => i.MediaAsset)
            .AsNoTracking()
            .AsQueryable();

        if (query.Category is not null)
            people = people.Where(p => p.Category == query.Category);
        people = people.Where(p => p.PublicationStatus == (query.PublicationStatus ?? PublicationStatus.Published));
        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var term = query.Search.ToLower();
            people = people.Where(p => p.FirstName.ToLower().Contains(term) || p.LastName.ToLower().Contains(term));
        }

        people = people.OrderBy(p => p.LastName).ThenBy(p => p.FirstName);

        var totalCount = await people.CountAsync(ct);
        var items = await people
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(ct);

        return PagedResult<PersonDto>.Create(items.Select(p => ToDto(p, includeEditorial)).ToList(), query.Page, query.PageSize, totalCount);
    }

    public async Task<PersonDto> GetByIdAsync(Guid id, PublicationStatus? publicationStatus, bool includeEditorial, CancellationToken ct = default)
    {
        var person = await db.People
            .Include(p => p.CoverMediaAsset)
            .Include(p => p.AdditionalImages).ThenInclude(i => i.MediaAsset)
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == id && p.PublicationStatus == (publicationStatus ?? PublicationStatus.Published), ct)
            ?? throw new NotFoundException(nameof(Person), id);
        return ToDto(person, includeEditorial);
    }

    public async Task<PersonDto> CreateAsync(CreatePersonRequest request, CancellationToken ct = default)
    {
        var person = new Person
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            FatherName = request.FatherName,
            BirthDate = request.BirthDate,
            DeathDate = request.DeathDate,
            Category = request.Category,
            Occupation = request.Occupation,
            Biography = request.Biography,
            SourceStatus = request.SourceStatus,
            SourceReference = request.SourceReference,
            EditorialNote = request.EditorialNote,
            OriginalSourceText = request.OriginalSourceText,
            Slug = await GenerateUniqueSlugAsync($"{request.FirstName} {request.LastName}", excludeId: null, ct),
        };

        if (request.CoverMediaAssetId is { } mediaId)
        {
            person.CoverMediaAsset = await db.MediaAssets.FirstOrDefaultAsync(m => m.Id == mediaId, ct)
                ?? throw new NotFoundException(nameof(MediaAsset), mediaId);
        }

        // Added before ApplyAdditionalImagesAsync (not after, as it used
        // to be) — that method needs Person already tracked so its own
        // intermediate SaveChangesAsync (see its doc comment) has
        // something valid to flush.
        db.People.Add(person);
        await ApplyAdditionalImagesAsync(person, request.AdditionalImageMediaAssetIds, ct);

        await db.SaveChangesAsync(ct);
        await auditLog.LogAsync("Create", nameof(Person), person.Id.ToString(), newValue: $"{person.FirstName} {person.LastName}", ct: ct);
        return ToDto(person, includeEditorial: true);
    }

    public async Task<PersonDto> UpdateAsync(Guid id, UpdatePersonRequest request, CancellationToken ct = default)
    {
        var person = await db.People
            .Include(p => p.CoverMediaAsset)
            .Include(p => p.AdditionalImages).ThenInclude(i => i.MediaAsset)
            .FirstOrDefaultAsync(p => p.Id == id, ct)
            ?? throw new NotFoundException(nameof(Person), id);

        var oldName = $"{person.FirstName} {person.LastName}";
        var oldMediaAssetId = person.CoverMediaAssetId;
        // Snapshotted before ApplyAdditionalImagesAsync mutates the
        // collection — diffed against the post-save state below to find
        // which images were actually removed, so only those get a
        // cleanup attempt (an image still present after the edit must
        // not be touched, even if it was also present before).
        var oldImageMediaAssetIds = person.AdditionalImages.Select(i => i.MediaAssetId).ToList();

        person.FirstName = request.FirstName;
        person.LastName = request.LastName;
        person.FatherName = request.FatherName;
        person.BirthDate = request.BirthDate;
        person.DeathDate = request.DeathDate;
        person.Category = request.Category;
        person.Occupation = request.Occupation;
        person.Biography = request.Biography;
        person.SourceStatus = request.SourceStatus;
        person.SourceReference = request.SourceReference;
        person.EditorialNote = request.EditorialNote;
        person.OriginalSourceText = request.OriginalSourceText;
        person.Slug = await GenerateUniqueSlugAsync($"{request.FirstName} {request.LastName}", excludeId: id, ct);
        person.UpdatedAt = DateTimeOffset.UtcNow;

        if (request.CoverMediaAssetId != person.CoverMediaAssetId)
        {
            if (request.CoverMediaAssetId is { } newMediaId)
            {
                person.CoverMediaAsset = await db.MediaAssets.FirstOrDefaultAsync(m => m.Id == newMediaId, ct)
                    ?? throw new NotFoundException(nameof(MediaAsset), newMediaId);
            }
            else
            {
                person.CoverMediaAsset = null;
                person.CoverMediaAssetId = null;
            }
        }

        await ApplyAdditionalImagesAsync(person, request.AdditionalImageMediaAssetIds, ct);

        await db.SaveChangesAsync(ct);
        await auditLog.LogAsync("Update", nameof(Person), person.Id.ToString(), oldValue: oldName, newValue: $"{person.FirstName} {person.LastName}", ct: ct);

        if (oldMediaAssetId is { } removedId && oldMediaAssetId != person.CoverMediaAssetId)
        {
            try { await mediaUploadService.DeleteIfUnreferencedAsync(removedId, ct); }
            catch { /* safe to ignore — see MediaUploadService.DeleteIfUnreferencedAsync */ }
        }

        // Same best-effort cleanup as the cover photo above, run only
        // after the save succeeded (so IsReferencedAsync sees the DB's
        // real post-save state) — an image still attached to the person
        // (or shared with another person/photo) is never touched.
        var removedImageIds = oldImageMediaAssetIds.Except(person.AdditionalImages.Select(i => i.MediaAssetId));
        foreach (var removedImageId in removedImageIds)
        {
            try { await mediaUploadService.DeleteIfUnreferencedAsync(removedImageId, ct); }
            catch { /* safe to ignore — see MediaUploadService.DeleteIfUnreferencedAsync */ }
        }

        return ToDto(person, includeEditorial: true);
    }

    public async Task<PersonDto> UpdateStatusAsync(Guid id, UpdatePersonStatusRequest request, CancellationToken ct = default)
    {
        var person = await db.People.FirstOrDefaultAsync(p => p.Id == id, ct)
            ?? throw new NotFoundException(nameof(Person), id);

        var oldStatus = person.PublicationStatus;
        person.PublicationStatus = request.PublicationStatus;
        person.UpdatedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(ct);

        var action = request.PublicationStatus switch
        {
            PublicationStatus.Published => "Publish",
            PublicationStatus.Archived => "Archive",
            _ => "Unpublish",
        };
        await auditLog.LogAsync(action, nameof(Person), person.Id.ToString(), oldStatus.ToString(), person.PublicationStatus.ToString(), ct);

        return ToDto(person, includeEditorial: true);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var person = await db.People.Include(p => p.AdditionalImages).FirstOrDefaultAsync(p => p.Id == id, ct)
            ?? throw new NotFoundException(nameof(Person), id);

        var name = $"{person.FirstName} {person.LastName}";
        var coverMediaAssetId = person.CoverMediaAssetId;
        var albumMediaAssetIds = person.AdditionalImages.Select(i => i.MediaAssetId).ToList();

        db.People.Remove(person);
        await db.SaveChangesAsync(ct);
        await auditLog.LogAsync("Delete", nameof(Person), id.ToString(), oldValue: name, ct: ct);

        // Same best-effort pattern for both — only removes an id if
        // nothing else (another person, a photo, etc.) still references
        // the same MediaAsset. The PersonImage join rows themselves are
        // already gone via the FK's own Cascade delete regardless of
        // whether this cleanup succeeds.
        foreach (var mediaId in albumMediaAssetIds.Cast<Guid?>().Append(coverMediaAssetId).OfType<Guid>())
        {
            try { await mediaUploadService.DeleteIfUnreferencedAsync(mediaId, ct); }
            catch { /* safe to ignore — see MediaUploadService.DeleteIfUnreferencedAsync */ }
        }
    }

    /// <summary>Wholesale replace — same strategy as HistoricalEventService's
    /// AdditionalImages handling — with two corrections, both confirmed by
    /// actually reproducing the failure against a real save, not just code
    /// review:
    ///
    /// 1. HistoricalEventService's version does a blind clear-then-recreate
    /// (remove every existing row, re-add one row per incoming id), which
    /// throws a DbUpdateConcurrencyException whenever the new list is a
    /// STRICT SUBSET of the old one (reproduced against History's own live
    /// endpoint — e.g. removing 1 of 3 images while keeping the other 2).
    /// Diffing instead — only remove rows whose MediaAssetId truly isn't in
    /// the new list, only insert rows for MediaAssetIds not already
    /// present, and just update SortOrder in place for ones that persist —
    /// is also less work for the common case where most images are
    /// unchanged between saves.
    ///
    /// 2. Even with that diff in place, removing+updating existing rows and
    /// inserting new ones for the SAME table in a single SaveChangesAsync
    /// batch still throws the same DbUpdateConcurrencyException (an EF
    /// Core + Npgsql provider batching limitation, not something fixable
    /// from LINQ-level code) — confirmed by instrumenting and observing a
    /// brand-new INSERT-shaped entity getting emitted as an UPDATE against
    /// its own (never-before-persisted) id, hitting 0 matching rows.
    /// Flushing the delete/update phase in its own SaveChangesAsync before
    /// the insert phase avoids the mixed batch entirely. Callers must
    /// ensure `person` is already tracked (Added or loaded from the DB)
    /// before calling this, since the intermediate save needs something
    /// valid to flush.</summary>
    private async Task ApplyAdditionalImagesAsync(Person person, List<Guid> mediaAssetIds, CancellationToken ct)
    {
        var toRemove = person.AdditionalImages.Where(image => !mediaAssetIds.Contains(image.MediaAssetId)).ToList();
        foreach (var image in toRemove)
            person.AdditionalImages.Remove(image);

        for (var index = 0; index < mediaAssetIds.Count; index++)
        {
            var existing = person.AdditionalImages.FirstOrDefault(image => image.MediaAssetId == mediaAssetIds[index]);
            if (existing is not null) existing.SortOrder = index;
        }

        await db.SaveChangesAsync(ct);

        for (var index = 0; index < mediaAssetIds.Count; index++)
        {
            var mediaAssetId = mediaAssetIds[index];
            if (person.AdditionalImages.Any(image => image.MediaAssetId == mediaAssetId)) continue;

            var media = await db.MediaAssets.FirstOrDefaultAsync(m => m.Id == mediaAssetId, ct)
                ?? throw new NotFoundException(nameof(MediaAsset), mediaAssetId);
            var newImage = new PersonImage { PersonId = person.Id, MediaAssetId = mediaAssetId, MediaAsset = media, SortOrder = index };
            // db.PersonImages.Add (not person.AdditionalImages.Add): adding
            // via the navigation collection left EF's change tracker
            // guessing this brand-new entity's state from its (non-default,
            // client-generated) Guid key instead of trusting that it's
            // genuinely new, which produced an UPDATE against a row that
            // never existed. DbSet.Add is the unambiguous, explicit way to
            // mark an entity Added regardless of its key value.
            db.PersonImages.Add(newImage);
        }
    }

    /// <summary>Person.Slug has a unique DB index (PersonConfiguration.cs)
    /// but nothing previously checked for a collision before saving — two
    /// people whose name transliterates to the same slug (e.g. two
    /// "Eyni Adam" entries, or a coincidental name collision) made
    /// SaveChangesAsync throw an unhandled DbUpdateException, surfacing
    /// to the admin as an opaque save failure. SlugGenerator already
    /// supports a `disambiguator` for exactly this case; it just wasn't
    /// wired up here. Checked with AsNoTracking since this is a read-only
    /// existence probe, not part of the tracked save.</summary>
    private async Task<string> GenerateUniqueSlugAsync(string name, Guid? excludeId, CancellationToken ct)
    {
        var slug = SlugGenerator.Generate(name);
        var collides = await db.People.AsNoTracking().AnyAsync(p => p.Slug == slug && p.Id != excludeId, ct);
        return collides ? SlugGenerator.Generate(name, Guid.NewGuid()) : slug;
    }

    private static PersonDto ToDto(Person p, bool includeEditorial) => new(
        p.Id, p.FirstName, p.LastName, p.FatherName, p.BirthDate, p.DeathDate, p.Category,
        p.Occupation, p.Biography, p.CoverMediaAssetId, p.CoverMediaAsset?.Url, p.SourceStatus, p.SourceReference,
        includeEditorial ? p.EditorialNote : null, includeEditorial ? p.OriginalSourceText : null,
        p.Slug, p.PublicationStatus,
        p.AdditionalImages.OrderBy(i => i.SortOrder).Select(i => new PersonImageDto(i.Id, i.MediaAssetId, i.MediaAsset!.Url, i.SortOrder)).ToList());
}
