using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Musakuce.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddPlaceSourceReference : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "SourceReference",
                table: "Places",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SourceReference",
                table: "Places");
        }
    }
}
