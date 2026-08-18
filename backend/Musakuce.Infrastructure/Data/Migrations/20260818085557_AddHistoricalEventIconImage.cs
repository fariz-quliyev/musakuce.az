using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Musakuce.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddHistoricalEventIconImage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "IconMediaAssetId",
                table: "HistoricalEvents",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_HistoricalEvents_IconMediaAssetId",
                table: "HistoricalEvents",
                column: "IconMediaAssetId");

            migrationBuilder.AddForeignKey(
                name: "FK_HistoricalEvents_MediaAssets_IconMediaAssetId",
                table: "HistoricalEvents",
                column: "IconMediaAssetId",
                principalTable: "MediaAssets",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_HistoricalEvents_MediaAssets_IconMediaAssetId",
                table: "HistoricalEvents");

            migrationBuilder.DropIndex(
                name: "IX_HistoricalEvents_IconMediaAssetId",
                table: "HistoricalEvents");

            migrationBuilder.DropColumn(
                name: "IconMediaAssetId",
                table: "HistoricalEvents");
        }
    }
}
