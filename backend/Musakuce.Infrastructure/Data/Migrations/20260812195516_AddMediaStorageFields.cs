using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Musakuce.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddMediaStorageFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "MediaType",
                table: "MediaAssets",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "OriginalFileName",
                table: "MediaAssets",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OriginalStorageKey",
                table: "MediaAssets",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OriginalUrl",
                table: "MediaAssets",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "SizeBytes",
                table: "MediaAssets",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StorageKeyPrefix",
                table: "MediaAssets",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ThumbnailUrl",
                table: "MediaAssets",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "UploadedByUserId",
                table: "MediaAssets",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_MediaAssets_StorageKeyPrefix",
                table: "MediaAssets",
                column: "StorageKeyPrefix");

            migrationBuilder.CreateIndex(
                name: "IX_MediaAssets_UploadedByUserId",
                table: "MediaAssets",
                column: "UploadedByUserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_MediaAssets_StorageKeyPrefix",
                table: "MediaAssets");

            migrationBuilder.DropIndex(
                name: "IX_MediaAssets_UploadedByUserId",
                table: "MediaAssets");

            migrationBuilder.DropColumn(
                name: "MediaType",
                table: "MediaAssets");

            migrationBuilder.DropColumn(
                name: "OriginalFileName",
                table: "MediaAssets");

            migrationBuilder.DropColumn(
                name: "OriginalStorageKey",
                table: "MediaAssets");

            migrationBuilder.DropColumn(
                name: "OriginalUrl",
                table: "MediaAssets");

            migrationBuilder.DropColumn(
                name: "SizeBytes",
                table: "MediaAssets");

            migrationBuilder.DropColumn(
                name: "StorageKeyPrefix",
                table: "MediaAssets");

            migrationBuilder.DropColumn(
                name: "ThumbnailUrl",
                table: "MediaAssets");

            migrationBuilder.DropColumn(
                name: "UploadedByUserId",
                table: "MediaAssets");
        }
    }
}
