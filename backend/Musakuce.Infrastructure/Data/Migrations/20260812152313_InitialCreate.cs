using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Musakuce.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ClassifiedListings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Description = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: false),
                    Category = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Price = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: true),
                    Location = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ContactName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ContactInfo = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ListingStatus = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    ModerationStatus = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    PostedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    ExpiresAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClassifiedListings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CommunitySubmissions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SubmitterName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ContactInfo = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Kind = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Description = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: false),
                    SuggestedDate = table.Column<DateOnly>(type: "date", nullable: true),
                    SuggestedLocation = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    PeopleShown = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    SourceNote = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    PermissionToPublish = table.Column<bool>(type: "boolean", nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    ReviewerNote = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CommunitySubmissions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "HistoricalEvents",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Period = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    EventDate = table.Column<DateOnly>(type: "date", nullable: true),
                    Description = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: false),
                    SourceStatus = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false),
                    PublicationStatus = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HistoricalEvents", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MediaAssets",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Url = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    AltText = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    ContentType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Width = table.Column<int>(type: "integer", nullable: true),
                    Height = table.Column<int>(type: "integer", nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MediaAssets", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ListingImages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ClassifiedListingId = table.Column<Guid>(type: "uuid", nullable: false),
                    MediaAssetId = table.Column<Guid>(type: "uuid", nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ListingImages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ListingImages_ClassifiedListings_ClassifiedListingId",
                        column: x => x.ClassifiedListingId,
                        principalTable: "ClassifiedListings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ListingImages_MediaAssets_MediaAssetId",
                        column: x => x.MediaAssetId,
                        principalTable: "MediaAssets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LocalInfoEntries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Kind = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    ContactInfo = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    AreaServed = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    PhotoMediaAssetId = table.Column<Guid>(type: "uuid", nullable: true),
                    AttachedToEntryId = table.Column<Guid>(type: "uuid", nullable: true),
                    PublicationStatus = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LocalInfoEntries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LocalInfoEntries_LocalInfoEntries_AttachedToEntryId",
                        column: x => x.AttachedToEntryId,
                        principalTable: "LocalInfoEntries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LocalInfoEntries_MediaAssets_PhotoMediaAssetId",
                        column: x => x.PhotoMediaAssetId,
                        principalTable: "MediaAssets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "People",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FirstName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    LastName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    FatherName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    BirthDate = table.Column<DateOnly>(type: "date", nullable: true),
                    DeathDate = table.Column<DateOnly>(type: "date", nullable: true),
                    Category = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Occupation = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    Biography = table.Column<string>(type: "character varying(8000)", maxLength: 8000, nullable: false),
                    CoverMediaAssetId = table.Column<Guid>(type: "uuid", nullable: true),
                    SourceStatus = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Slug = table.Column<string>(type: "character varying(180)", maxLength: 180, nullable: false),
                    PublicationStatus = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_People", x => x.Id);
                    table.ForeignKey(
                        name: "FK_People_MediaAssets_CoverMediaAssetId",
                        column: x => x.CoverMediaAssetId,
                        principalTable: "MediaAssets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "Photos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    TakenDate = table.Column<DateOnly>(type: "date", nullable: true),
                    Location = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Story = table.Column<string>(type: "text", nullable: true),
                    Category = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    SourceStatus = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    UploaderName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    MediaAssetId = table.Column<Guid>(type: "uuid", nullable: false),
                    PublicationStatus = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Photos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Photos_MediaAssets_MediaAssetId",
                        column: x => x.MediaAssetId,
                        principalTable: "MediaAssets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Places",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Slug = table.Column<string>(type: "character varying(180)", maxLength: 180, nullable: false),
                    Kind = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Category = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    HistoricalBackground = table.Column<string>(type: "text", nullable: true),
                    Latitude = table.Column<decimal>(type: "numeric(9,6)", precision: 9, scale: 6, nullable: false),
                    Longitude = table.Column<decimal>(type: "numeric(9,6)", precision: 9, scale: 6, nullable: false),
                    CoverMediaAssetId = table.Column<Guid>(type: "uuid", nullable: true),
                    SourceStatus = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    PublicationStatus = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Places", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Places_MediaAssets_CoverMediaAssetId",
                        column: x => x.CoverMediaAssetId,
                        principalTable: "MediaAssets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "SubmissionFiles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CommunitySubmissionId = table.Column<Guid>(type: "uuid", nullable: false),
                    MediaAssetId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SubmissionFiles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SubmissionFiles_CommunitySubmissions_CommunitySubmissionId",
                        column: x => x.CommunitySubmissionId,
                        principalTable: "CommunitySubmissions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SubmissionFiles_MediaAssets_MediaAssetId",
                        column: x => x.MediaAssetId,
                        principalTable: "MediaAssets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Videos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    EmbedProvider = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    EmbedUrlOrKey = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    ThumbnailMediaAssetId = table.Column<Guid>(type: "uuid", nullable: true),
                    SourceStatus = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    PublicationStatus = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Videos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Videos_MediaAssets_ThumbnailMediaAssetId",
                        column: x => x.ThumbnailMediaAssetId,
                        principalTable: "MediaAssets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "VillageEvents",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Description = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: false),
                    Category = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    StartsAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    EndsAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    Location = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    PlaceId = table.Column<Guid>(type: "uuid", nullable: true),
                    OrganizerName = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    CoverMediaAssetId = table.Column<Guid>(type: "uuid", nullable: true),
                    PublicationStatus = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VillageEvents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VillageEvents_MediaAssets_CoverMediaAssetId",
                        column: x => x.CoverMediaAssetId,
                        principalTable: "MediaAssets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_VillageEvents_Places_PlaceId",
                        column: x => x.PlaceId,
                        principalTable: "Places",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ClassifiedListings_ModerationStatus_ListingStatus",
                table: "ClassifiedListings",
                columns: new[] { "ModerationStatus", "ListingStatus" });

            migrationBuilder.CreateIndex(
                name: "IX_CommunitySubmissions_Status",
                table: "CommunitySubmissions",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_HistoricalEvents_DisplayOrder",
                table: "HistoricalEvents",
                column: "DisplayOrder");

            migrationBuilder.CreateIndex(
                name: "IX_ListingImages_ClassifiedListingId",
                table: "ListingImages",
                column: "ClassifiedListingId");

            migrationBuilder.CreateIndex(
                name: "IX_ListingImages_MediaAssetId",
                table: "ListingImages",
                column: "MediaAssetId");

            migrationBuilder.CreateIndex(
                name: "IX_LocalInfoEntries_AttachedToEntryId",
                table: "LocalInfoEntries",
                column: "AttachedToEntryId");

            migrationBuilder.CreateIndex(
                name: "IX_LocalInfoEntries_PhotoMediaAssetId",
                table: "LocalInfoEntries",
                column: "PhotoMediaAssetId");

            migrationBuilder.CreateIndex(
                name: "IX_People_CoverMediaAssetId",
                table: "People",
                column: "CoverMediaAssetId");

            migrationBuilder.CreateIndex(
                name: "IX_People_Slug",
                table: "People",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Photos_Category",
                table: "Photos",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_Photos_MediaAssetId",
                table: "Photos",
                column: "MediaAssetId");

            migrationBuilder.CreateIndex(
                name: "IX_Places_CoverMediaAssetId",
                table: "Places",
                column: "CoverMediaAssetId");

            migrationBuilder.CreateIndex(
                name: "IX_Places_Slug",
                table: "Places",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SubmissionFiles_CommunitySubmissionId",
                table: "SubmissionFiles",
                column: "CommunitySubmissionId");

            migrationBuilder.CreateIndex(
                name: "IX_SubmissionFiles_MediaAssetId",
                table: "SubmissionFiles",
                column: "MediaAssetId");

            migrationBuilder.CreateIndex(
                name: "IX_Videos_ThumbnailMediaAssetId",
                table: "Videos",
                column: "ThumbnailMediaAssetId");

            migrationBuilder.CreateIndex(
                name: "IX_VillageEvents_CoverMediaAssetId",
                table: "VillageEvents",
                column: "CoverMediaAssetId");

            migrationBuilder.CreateIndex(
                name: "IX_VillageEvents_PlaceId",
                table: "VillageEvents",
                column: "PlaceId");

            migrationBuilder.CreateIndex(
                name: "IX_VillageEvents_StartsAt",
                table: "VillageEvents",
                column: "StartsAt");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "HistoricalEvents");

            migrationBuilder.DropTable(
                name: "ListingImages");

            migrationBuilder.DropTable(
                name: "LocalInfoEntries");

            migrationBuilder.DropTable(
                name: "People");

            migrationBuilder.DropTable(
                name: "Photos");

            migrationBuilder.DropTable(
                name: "SubmissionFiles");

            migrationBuilder.DropTable(
                name: "Videos");

            migrationBuilder.DropTable(
                name: "VillageEvents");

            migrationBuilder.DropTable(
                name: "ClassifiedListings");

            migrationBuilder.DropTable(
                name: "CommunitySubmissions");

            migrationBuilder.DropTable(
                name: "Places");

            migrationBuilder.DropTable(
                name: "MediaAssets");
        }
    }
}
