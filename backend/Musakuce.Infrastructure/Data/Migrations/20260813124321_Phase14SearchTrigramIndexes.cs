using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Musakuce.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    /// <summary>
    /// Phase 14 §3/§6 — SearchService.cs's 11 global-search groups were
    /// confirmed via live EXPLAIN to be full Seq Scans with no index able
    /// to help (no pg_trgm extension, no trigram index existed at all).
    /// These are hand-written CREATE INDEX statements, not EF's fluent
    /// HasIndex, because every one of them must be an EXPRESSION index on
    /// lower(column) — EF's fluent index API can only target raw
    /// properties, not a function call, and SearchService.cs's queries
    /// (deliberately left as field.ToLower().Contains(term) rather than a
    /// Postgres-specific ILIKE call, since Musakuce.Application has no
    /// dependency on the Npgsql provider by design) compile to
    /// `lower(column) LIKE @pattern`. An index on the raw column would
    /// never be chosen by the planner for that expression — confirmed
    /// live before settling on this approach.
    /// </summary>
    public partial class Phase14SearchTrigramIndexes : Migration
    {
        private static readonly (string Table, string Column)[] TrigramColumns =
        [
            ("People", "FirstName"),
            ("People", "LastName"),
            ("HistoricalEvents", "Title"),
            ("HistoricalEvents", "Description"),
            ("Photos", "Title"),
            ("Photos", "Description"),
            ("Videos", "Title"),
            ("Videos", "Description"),
            ("Places", "Name"),
            ("Places", "Description"),
            ("VillageEvents", "Title"),
            ("VillageEvents", "Description"),
            ("LocalInfoEntries", "Name"),
            ("LocalInfoEntries", "Description"),
            ("MemorialRecords", "FullName"),
            ("CulturalHeritageItems", "Title"),
            ("CulturalHeritageItems", "Description"),
            ("Interviews", "PersonName"),
            ("Interviews", "Title"),
            ("EducationEntries", "Title"),
            ("EducationEntries", "Summary"),
        ];

        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:PostgresExtension:pg_trgm", ",,");

            foreach (var (table, column) in TrigramColumns)
            {
                migrationBuilder.Sql(
                    $"""CREATE INDEX "IX_{table}_{column}_trgm" ON "{table}" USING gin (lower("{column}") gin_trgm_ops);""");
            }
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            foreach (var (table, column) in TrigramColumns)
            {
                migrationBuilder.Sql($"""DROP INDEX IF EXISTS "IX_{table}_{column}_trgm";""");
            }

            migrationBuilder.AlterDatabase()
                .OldAnnotation("Npgsql:PostgresExtension:pg_trgm", ",,");
        }
    }
}
