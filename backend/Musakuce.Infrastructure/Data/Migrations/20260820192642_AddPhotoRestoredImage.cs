using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Musakuce.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddPhotoRestoredImage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "RestoredMediaAssetId",
                table: "Photos",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Photos_RestoredMediaAssetId",
                table: "Photos",
                column: "RestoredMediaAssetId");

            migrationBuilder.AddForeignKey(
                name: "FK_Photos_MediaAssets_RestoredMediaAssetId",
                table: "Photos",
                column: "RestoredMediaAssetId",
                principalTable: "MediaAssets",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Photos_MediaAssets_RestoredMediaAssetId",
                table: "Photos");

            migrationBuilder.DropIndex(
                name: "IX_Photos_RestoredMediaAssetId",
                table: "Photos");

            migrationBuilder.DropColumn(
                name: "RestoredMediaAssetId",
                table: "Photos");
        }
    }
}
