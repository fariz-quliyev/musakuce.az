namespace Musakuce.Application.Common;

/// <summary>Base query parameters shared by every list endpoint.</summary>
public abstract class PagedQuery
{
    private const int MaxPageSize = 50;
    private int _page = 1;
    private int _pageSize = 20;

    public int Page
    {
        get => _page;
        set => _page = value < 1 ? 1 : value;
    }

    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = value switch
        {
            < 1 => 20,
            > MaxPageSize => MaxPageSize,
            _ => value,
        };
    }

    /// <summary>Free-text search, matched against each resource's
    /// relevant title/name fields.</summary>
    public string? Search { get; set; }
}
