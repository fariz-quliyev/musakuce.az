using System.Text;

namespace Musakuce.Application.Common;

/// <summary>Generates a URL-safe slug from Azerbaijani text (transliterates
/// the extra Latin letters ə/ö/ü/ğ/ş/ı/ç so routes stay ASCII).</summary>
public static class SlugGenerator
{
    private static readonly Dictionary<char, string> Translit = new()
    {
        ['ə'] = "e", ['Ə'] = "e",
        ['ö'] = "o", ['Ö'] = "o",
        ['ü'] = "u", ['Ü'] = "u",
        ['ğ'] = "g", ['Ğ'] = "g",
        ['ş'] = "s", ['Ş'] = "s",
        ['ı'] = "i", ['İ'] = "i",
        ['ç'] = "c", ['Ç'] = "c",
    };

    public static string Generate(string input, Guid? disambiguator = null)
    {
        var sb = new StringBuilder();
        foreach (var ch in input)
        {
            if (Translit.TryGetValue(ch, out var replacement))
                sb.Append(replacement);
            else if (char.IsLetterOrDigit(ch))
                sb.Append(char.ToLowerInvariant(ch));
            else if (char.IsWhiteSpace(ch) || ch is '-' or '_')
                sb.Append('-');
        }

        var slug = string.Join('-', sb.ToString().Split('-', StringSplitOptions.RemoveEmptyEntries));
        return disambiguator is null ? slug : $"{slug}-{disambiguator.Value:N}"[..Math.Min(slug.Length + 9, 80)];
    }
}
