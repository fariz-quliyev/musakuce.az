using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Musakuce.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddCorrectionSuggestions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CorrectionSuggestions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TargetEntityType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    TargetEntityId = table.Column<Guid>(type: "uuid", nullable: false),
                    TargetTitle = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    FieldOrSection = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    SuggestedChange = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    AdditionalNotes = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    PhotoMediaAssetId = table.Column<Guid>(type: "uuid", nullable: true),
                    SubmitterName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    ContactInfo = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    ReviewerNote = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CorrectionSuggestions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CorrectionSuggestions_MediaAssets_PhotoMediaAssetId",
                        column: x => x.PhotoMediaAssetId,
                        principalTable: "MediaAssets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CorrectionSuggestions_PhotoMediaAssetId",
                table: "CorrectionSuggestions",
                column: "PhotoMediaAssetId");

            migrationBuilder.CreateIndex(
                name: "IX_CorrectionSuggestions_Status",
                table: "CorrectionSuggestions",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_CorrectionSuggestions_TargetEntityType_TargetEntityId",
                table: "CorrectionSuggestions",
                columns: new[] { "TargetEntityType", "TargetEntityId" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CorrectionSuggestions");
        }
    }
}
