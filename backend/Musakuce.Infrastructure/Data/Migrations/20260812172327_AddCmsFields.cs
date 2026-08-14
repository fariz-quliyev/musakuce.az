using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Musakuce.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddCmsFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "Videos",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<DateOnly>(
                name: "RecordedDate",
                table: "Videos",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SourceReference",
                table: "HistoricalEvents",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RejectionReason",
                table: "ClassifiedListings",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Category",
                table: "Videos");

            migrationBuilder.DropColumn(
                name: "RecordedDate",
                table: "Videos");

            migrationBuilder.DropColumn(
                name: "SourceReference",
                table: "HistoricalEvents");

            migrationBuilder.DropColumn(
                name: "RejectionReason",
                table: "ClassifiedListings");
        }
    }
}
