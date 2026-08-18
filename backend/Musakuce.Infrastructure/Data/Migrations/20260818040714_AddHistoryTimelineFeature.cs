using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Musakuce.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddHistoryTimelineFeature : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "CoverMediaAssetId",
                table: "HistoricalEvents",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DetailedText",
                table: "HistoricalEvents",
                type: "character varying(8000)",
                maxLength: 8000,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDefault",
                table: "HistoricalEvents",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "ShowInTimeline",
                table: "HistoricalEvents",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            migrationBuilder.CreateTable(
                name: "HistoricalEventImages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    HistoricalEventId = table.Column<Guid>(type: "uuid", nullable: false),
                    MediaAssetId = table.Column<Guid>(type: "uuid", nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HistoricalEventImages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HistoricalEventImages_HistoricalEvents_HistoricalEventId",
                        column: x => x.HistoricalEventId,
                        principalTable: "HistoricalEvents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_HistoricalEventImages_MediaAssets_MediaAssetId",
                        column: x => x.MediaAssetId,
                        principalTable: "MediaAssets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TimelineSettings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Subtitle = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    MaxEventsDesktop = table.Column<int>(type: "integer", nullable: true),
                    DefaultSelection = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    MobileBehavior = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TimelineSettings", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_HistoricalEvents_CoverMediaAssetId",
                table: "HistoricalEvents",
                column: "CoverMediaAssetId");

            migrationBuilder.CreateIndex(
                name: "IX_HistoricalEventImages_HistoricalEventId",
                table: "HistoricalEventImages",
                column: "HistoricalEventId");

            migrationBuilder.CreateIndex(
                name: "IX_HistoricalEventImages_MediaAssetId",
                table: "HistoricalEventImages",
                column: "MediaAssetId");

            migrationBuilder.AddForeignKey(
                name: "FK_HistoricalEvents_MediaAssets_CoverMediaAssetId",
                table: "HistoricalEvents",
                column: "CoverMediaAssetId",
                principalTable: "MediaAssets",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            // Seed content — so /kendimiz's timeline isn't empty before an
            // admin has entered anything. Description is deliberately
            // written as an explicit "this is placeholder" notice, never
            // as if it were a real historical fact (see HistoricalEvent.IsDefault
            // doc comment) — SourceStatus is "UnderResearch" for the same
            // reason. Fixed GUIDs so Down() can remove exactly these rows.
            var seededAt = new DateTimeOffset(2026, 1, 1, 0, 0, 0, TimeSpan.Zero);
            const string placeholderNotice =
                "Bu, nümunə məzmundur — admin panelində real məlumatla əvəz edilməlidir.";

            migrationBuilder.InsertData(
                table: "HistoricalEvents",
                columns: new[]
                {
                    "Id", "Title", "Period", "EventDate", "Description", "DetailedText",
                    "SourceStatus", "SourceReference", "EditorialNote", "OriginalSourceText",
                    "DisplayOrder", "PublicationStatus", "CoverMediaAssetId", "ShowInTimeline", "IsDefault",
                    "CreatedAt", "UpdatedAt",
                },
                values: new object[,]
                {
                    { new Guid("11111111-1111-1111-1111-111111111001"), "İlk məskunlaşma izləri", "XIX əsr", null, placeholderNotice, null, "UnderResearch", null, null, null, 1, "Published", null, true, true, seededAt, seededAt },
                    { new Guid("11111111-1111-1111-1111-111111111002"), "Kənd böyüyür", "1900–1940", null, placeholderNotice, null, "UnderResearch", null, null, null, 2, "Published", null, true, true, seededAt, seededAt },
                    { new Guid("11111111-1111-1111-1111-111111111003"), "Müharibə illərinin izi", "1941–1945", null, placeholderNotice, null, "UnderResearch", null, null, null, 3, "Published", null, true, true, seededAt, seededAt },
                    { new Guid("11111111-1111-1111-1111-111111111004"), "Yeni nəsil, yeni həyat", "1960–1980", null, placeholderNotice, null, "UnderResearch", null, null, null, 4, "Published", null, true, true, seededAt, seededAt },
                    { new Guid("11111111-1111-1111-1111-111111111005"), "Dəyişən zaman", "1990–2000", null, placeholderNotice, null, "UnderResearch", null, null, null, 5, "Published", null, true, true, seededAt, seededAt },
                    { new Guid("11111111-1111-1111-1111-111111111006"), "Musaküçə yaşayır", "Bu gün", null, placeholderNotice, null, "UnderResearch", null, null, null, 6, "Published", null, true, true, seededAt, seededAt },
                });

            migrationBuilder.InsertData(
                table: "TimelineSettings",
                columns: new[] { "Id", "Title", "Subtitle", "IsActive", "MaxEventsDesktop", "DefaultSelection", "MobileBehavior", "CreatedAt", "UpdatedAt" },
                values: new object[]
                {
                    new Guid("22222222-2222-2222-2222-222222222001"),
                    "Zaman xəttində Musaküçə",
                    "Nəsildən-nəslə ötürülən xatirələr, hadisələr və insanların zəhməti ilə bu günümüzə gəlib çatan Musaküçənin tarixi.",
                    true, null, "First", "HorizontalScroll", seededAt, seededAt,
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(table: "TimelineSettings", keyColumn: "Id", keyValue: new Guid("22222222-2222-2222-2222-222222222001"));

            migrationBuilder.DeleteData(
                table: "HistoricalEvents",
                keyColumn: "Id",
                keyValues: new object[]
                {
                    new Guid("11111111-1111-1111-1111-111111111001"),
                    new Guid("11111111-1111-1111-1111-111111111002"),
                    new Guid("11111111-1111-1111-1111-111111111003"),
                    new Guid("11111111-1111-1111-1111-111111111004"),
                    new Guid("11111111-1111-1111-1111-111111111005"),
                    new Guid("11111111-1111-1111-1111-111111111006"),
                });

            migrationBuilder.DropForeignKey(
                name: "FK_HistoricalEvents_MediaAssets_CoverMediaAssetId",
                table: "HistoricalEvents");

            migrationBuilder.DropTable(
                name: "HistoricalEventImages");

            migrationBuilder.DropTable(
                name: "TimelineSettings");

            migrationBuilder.DropIndex(
                name: "IX_HistoricalEvents_CoverMediaAssetId",
                table: "HistoricalEvents");

            migrationBuilder.DropColumn(
                name: "CoverMediaAssetId",
                table: "HistoricalEvents");

            migrationBuilder.DropColumn(
                name: "DetailedText",
                table: "HistoricalEvents");

            migrationBuilder.DropColumn(
                name: "IsDefault",
                table: "HistoricalEvents");

            migrationBuilder.DropColumn(
                name: "ShowInTimeline",
                table: "HistoricalEvents");
        }
    }
}
