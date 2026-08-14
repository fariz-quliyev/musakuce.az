using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Musakuce.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class Phase14PublicationStatusIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_VillageEvents_PublicationStatus",
                table: "VillageEvents",
                column: "PublicationStatus");

            migrationBuilder.CreateIndex(
                name: "IX_Videos_PublicationStatus",
                table: "Videos",
                column: "PublicationStatus");

            migrationBuilder.CreateIndex(
                name: "IX_Places_PublicationStatus",
                table: "Places",
                column: "PublicationStatus");

            migrationBuilder.CreateIndex(
                name: "IX_Photos_PublicationStatus",
                table: "Photos",
                column: "PublicationStatus");

            migrationBuilder.CreateIndex(
                name: "IX_People_PublicationStatus",
                table: "People",
                column: "PublicationStatus");

            migrationBuilder.CreateIndex(
                name: "IX_MemorialRecords_PublicationStatus",
                table: "MemorialRecords",
                column: "PublicationStatus");

            migrationBuilder.CreateIndex(
                name: "IX_LocalInfoEntries_PublicationStatus",
                table: "LocalInfoEntries",
                column: "PublicationStatus");

            migrationBuilder.CreateIndex(
                name: "IX_Interviews_PublicationStatus",
                table: "Interviews",
                column: "PublicationStatus");

            migrationBuilder.CreateIndex(
                name: "IX_HistoricalEvents_PublicationStatus",
                table: "HistoricalEvents",
                column: "PublicationStatus");

            migrationBuilder.CreateIndex(
                name: "IX_EducationEntries_PublicationStatus",
                table: "EducationEntries",
                column: "PublicationStatus");

            migrationBuilder.CreateIndex(
                name: "IX_CulturalHeritageItems_PublicationStatus",
                table: "CulturalHeritageItems",
                column: "PublicationStatus");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_VillageEvents_PublicationStatus",
                table: "VillageEvents");

            migrationBuilder.DropIndex(
                name: "IX_Videos_PublicationStatus",
                table: "Videos");

            migrationBuilder.DropIndex(
                name: "IX_Places_PublicationStatus",
                table: "Places");

            migrationBuilder.DropIndex(
                name: "IX_Photos_PublicationStatus",
                table: "Photos");

            migrationBuilder.DropIndex(
                name: "IX_People_PublicationStatus",
                table: "People");

            migrationBuilder.DropIndex(
                name: "IX_MemorialRecords_PublicationStatus",
                table: "MemorialRecords");

            migrationBuilder.DropIndex(
                name: "IX_LocalInfoEntries_PublicationStatus",
                table: "LocalInfoEntries");

            migrationBuilder.DropIndex(
                name: "IX_Interviews_PublicationStatus",
                table: "Interviews");

            migrationBuilder.DropIndex(
                name: "IX_HistoricalEvents_PublicationStatus",
                table: "HistoricalEvents");

            migrationBuilder.DropIndex(
                name: "IX_EducationEntries_PublicationStatus",
                table: "EducationEntries");

            migrationBuilder.DropIndex(
                name: "IX_CulturalHeritageItems_PublicationStatus",
                table: "CulturalHeritageItems");
        }
    }
}
