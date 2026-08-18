using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Musakuce.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddHistoricalEventIcon : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // defaultValue matches the entity's C# default (EventIcon.General)
            // so pre-existing rows (including the 6 seeded placeholder
            // events) get a valid enum member, not an empty string that
            // would fail to deserialize.
            migrationBuilder.AddColumn<string>(
                name: "EventIcon",
                table: "HistoricalEvents",
                type: "character varying(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "General");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EventIcon",
                table: "HistoricalEvents");
        }
    }
}
