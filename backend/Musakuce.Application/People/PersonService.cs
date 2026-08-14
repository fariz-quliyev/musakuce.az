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
            Slug = SlugGenerator.Generate($"{request.FirstName} {request.LastName}"),
        };

        if (request.CoverMediaAssetId is { } mediaId)
        {
            person.CoverMediaAsset = await db.MediaAssets.FirstOrDefaultAsync(m => m.Id == mediaId, ct)
                ?? throw new NotFoundException(nameof(MediaAsset), mediaId);
        }

        db.People.Add(person);
        await db.SaveChangesAsync(ct);
        await auditLog.LogAsync("Create", nameof(Person), person.Id.ToString(), newValue: $"{person.FirstName} {person.LastName}", ct: ct);
        return ToDto(person, includeEditorial: true);
    }

    public async Task<PersonDto> UpdateAsync(Guid id, UpdatePersonRequest request, CancellationToken ct = default)
    {
        var person = await db.People.Include(p => p.CoverMediaAsset).FirstOrDefaultAsync(p => p.Id == id, ct)
            ?? throw new NotFoundException(nameof(Person), id);

        var oldName = $"{person.FirstName} {person.LastName}";
        var oldMediaAssetId = person.CoverMediaAssetId;

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
        person.Slug = SlugGenerator.Generate($"{request.FirstName} {request.LastName}");
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

        await db.SaveChangesAsync(ct);
        await auditLog.LogAsync("Update", nameof(Person), person.Id.ToString(), oldValue: oldName, newValue: $"{person.FirstName} {person.LastName}", ct: ct);

        if (oldMediaAssetId is { } removedId && oldMediaAssetId != person.CoverMediaAssetId)
        {
            try { await mediaUploadService.DeleteIfUnreferencedAsync(removedId, ct); }
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

    private static PersonDto ToDto(Person p, bool includeEditorial) => new(
        p.Id, p.FirstName, p.LastName, p.FatherName, p.BirthDate, p.DeathDate, p.Category,
        p.Occupation, p.Biography, p.CoverMediaAssetId, p.CoverMediaAsset?.Url, p.SourceStatus, p.SourceReference,
        includeEditorial ? p.EditorialNote : null, includeEditorial ? p.OriginalSourceText : null,
        p.Slug, p.PublicationStatus);
}
