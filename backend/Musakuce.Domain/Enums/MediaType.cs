namespace Musakuce.Domain.Enums;

/// <summary>Broad category of an uploaded/linked MediaAsset — lets
/// queries and validation branch without re-parsing ContentType.</summary>
public enum MediaType
{
    Image,
    Video,
    Document,
}
