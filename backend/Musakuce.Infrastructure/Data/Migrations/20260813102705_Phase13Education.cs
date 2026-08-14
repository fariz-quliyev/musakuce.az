using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Musakuce.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class Phase13Education : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "EducationEntries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Slug = table.Column<string>(type: "character varying(180)", maxLength: 180, nullable: false),
                    Summary = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Content = table.Column<string>(type: "character varying(8000)", maxLength: 8000, nullable: true),
                    Kind = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Period = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    EventDate = table.Column<DateOnly>(type: "date", nullable: true),
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
                    table.PrimaryKey("PK_EducationEntries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EducationEntries_MediaAssets_CoverMediaAssetId",
                        column: x => x.CoverMediaAssetId,
                        principalTable: "MediaAssets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_EducationEntries_People_RelatedPersonId",
                        column: x => x.RelatedPersonId,
                        principalTable: "People",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_EducationEntries_CoverMediaAssetId",
                table: "EducationEntries",
                column: "CoverMediaAssetId");

            migrationBuilder.CreateIndex(
                name: "IX_EducationEntries_RelatedPersonId",
                table: "EducationEntries",
                column: "RelatedPersonId");

            migrationBuilder.CreateIndex(
                name: "IX_EducationEntries_Slug",
                table: "EducationEntries",
                column: "Slug",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EducationEntries");
        }
    }
}
