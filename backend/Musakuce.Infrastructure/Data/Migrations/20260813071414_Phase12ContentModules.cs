using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Musakuce.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class Phase12ContentModules : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "EditorialNote",
                table: "Places",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OriginalSourceText",
                table: "Places",
                type: "character varying(8000)",
                maxLength: 8000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EditorialNote",
                table: "People",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OriginalSourceText",
                table: "People",
                type: "character varying(8000)",
                maxLength: 8000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SourceReference",
                table: "People",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EditorialNote",
                table: "HistoricalEvents",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OriginalSourceText",
                table: "HistoricalEvents",
                type: "character varying(8000)",
                maxLength: 8000,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "CulturalHeritageItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Kind = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Description = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: false),
                    CoverMediaAssetId = table.Column<Guid>(type: "uuid", nullable: true),
                    SourceStatus = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    SourceReference = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    EditorialNote = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    OriginalSourceText = table.Column<string>(type: "character varying(8000)", maxLength: 8000, nullable: true),
                    PublicationStatus = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CulturalHeritageItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CulturalHeritageItems_MediaAssets_CoverMediaAssetId",
                        column: x => x.CoverMediaAssetId,
                        principalTable: "MediaAssets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "Interviews",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PersonName = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    RelatedPersonId = table.Column<Guid>(type: "uuid", nullable: true),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    Transcript = table.Column<string>(type: "character varying(20000)", maxLength: 20000, nullable: true),
                    EmbedProvider = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    EmbedUrlOrKey = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    ThumbnailMediaAssetId = table.Column<Guid>(type: "uuid", nullable: true),
                    RecordingDate = table.Column<DateOnly>(type: "date", nullable: true),
                    SourceStatus = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    SourceReference = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    EditorialNote = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    OriginalSourceText = table.Column<string>(type: "character varying(8000)", maxLength: 8000, nullable: true),
                    PublicationStatus = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Interviews", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Interviews_MediaAssets_ThumbnailMediaAssetId",
                        column: x => x.ThumbnailMediaAssetId,
                        principalTable: "MediaAssets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Interviews_People_RelatedPersonId",
                        column: x => x.RelatedPersonId,
                        principalTable: "People",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "MemorialRecords",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FullName = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    FatherName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Category = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    BirthDate = table.Column<DateOnly>(type: "date", nullable: true),
                    DeathDate = table.Column<DateOnly>(type: "date", nullable: true),
                    Biography = table.Column<string>(type: "character varying(8000)", maxLength: 8000, nullable: true),
                    Achievements = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    CoverMediaAssetId = table.Column<Guid>(type: "uuid", nullable: true),
                    RelatedPersonId = table.Column<Guid>(type: "uuid", nullable: true),
                    SourceStatus = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    SourceReference = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    EditorialNote = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    OriginalSourceText = table.Column<string>(type: "character varying(8000)", maxLength: 8000, nullable: true),
                    PublicationStatus = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MemorialRecords", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MemorialRecords_MediaAssets_CoverMediaAssetId",
                        column: x => x.CoverMediaAssetId,
                        principalTable: "MediaAssets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_MemorialRecords_People_RelatedPersonId",
                        column: x => x.RelatedPersonId,
                        principalTable: "People",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "VillageProfiles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    VillageName = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Tagline = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    ShortDescription = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    LongDescription = table.Column<string>(type: "character varying(8000)", maxLength: 8000, nullable: true),
                    Population = table.Column<int>(type: "integer", nullable: true),
                    PopulationAsOfYear = table.Column<int>(type: "integer", nullable: true),
                    AreaHectares = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: true),
                    GeographicalDescription = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    MainOccupations = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    NeighboringSettlements = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    NameOriginNarrative = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    NameOriginSourceStatus = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    NameOriginSourceReference = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Latitude = table.Column<decimal>(type: "numeric(9,6)", precision: 9, scale: 6, nullable: true),
                    Longitude = table.Column<decimal>(type: "numeric(9,6)", precision: 9, scale: 6, nullable: true),
                    HeroMediaAssetId = table.Column<Guid>(type: "uuid", nullable: true),
                    LogoMediaAssetId = table.Column<Guid>(type: "uuid", nullable: true),
                    ContactInfo = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    SocialLinks = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    EditorialNote = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    PublicationStatus = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VillageProfiles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VillageProfiles_MediaAssets_HeroMediaAssetId",
                        column: x => x.HeroMediaAssetId,
                        principalTable: "MediaAssets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_VillageProfiles_MediaAssets_LogoMediaAssetId",
                        column: x => x.LogoMediaAssetId,
                        principalTable: "MediaAssets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CulturalHeritageItems_CoverMediaAssetId",
                table: "CulturalHeritageItems",
                column: "CoverMediaAssetId");

            migrationBuilder.CreateIndex(
                name: "IX_Interviews_RelatedPersonId",
                table: "Interviews",
                column: "RelatedPersonId");

            migrationBuilder.CreateIndex(
                name: "IX_Interviews_ThumbnailMediaAssetId",
                table: "Interviews",
                column: "ThumbnailMediaAssetId");

            migrationBuilder.CreateIndex(
                name: "IX_MemorialRecords_CoverMediaAssetId",
                table: "MemorialRecords",
                column: "CoverMediaAssetId");

            migrationBuilder.CreateIndex(
                name: "IX_MemorialRecords_RelatedPersonId",
                table: "MemorialRecords",
                column: "RelatedPersonId");

            migrationBuilder.CreateIndex(
                name: "IX_VillageProfiles_HeroMediaAssetId",
                table: "VillageProfiles",
                column: "HeroMediaAssetId");

            migrationBuilder.CreateIndex(
                name: "IX_VillageProfiles_LogoMediaAssetId",
                table: "VillageProfiles",
                column: "LogoMediaAssetId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CulturalHeritageItems");

            migrationBuilder.DropTable(
                name: "Interviews");

            migrationBuilder.DropTable(
                name: "MemorialRecords");

            migrationBuilder.DropTable(
                name: "VillageProfiles");

            migrationBuilder.DropColumn(
                name: "EditorialNote",
                table: "Places");

            migrationBuilder.DropColumn(
                name: "OriginalSourceText",
                table: "Places");

            migrationBuilder.DropColumn(
                name: "EditorialNote",
                table: "People");

            migrationBuilder.DropColumn(
                name: "OriginalSourceText",
                table: "People");

            migrationBuilder.DropColumn(
                name: "SourceReference",
                table: "People");

            migrationBuilder.DropColumn(
                name: "EditorialNote",
                table: "HistoricalEvents");

            migrationBuilder.DropColumn(
                name: "OriginalSourceText",
                table: "HistoricalEvents");
        }
    }
}
