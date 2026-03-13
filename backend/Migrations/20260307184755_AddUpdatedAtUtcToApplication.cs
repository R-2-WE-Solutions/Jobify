using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Jobify.Migrations
{
    /// <inheritdoc />
    public partial class AddUpdatedAtUtcToApplication : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Note",
                table: "Applications",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StudentUserId",
                table: "Applications",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAtUtc",
                table: "Applications",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "WithdrawndAt",
                table: "Applications",
                type: "datetime2",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "StudentEducations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StudentUserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    University = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Degree = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Major = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Gpa = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    GraduationYear = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StudentEducations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StudentEducations_StudentProfiles_StudentUserId",
                        column: x => x.StudentUserId,
                        principalTable: "StudentProfiles",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "StudentExperiences",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StudentUserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Role = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Company = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Duration = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StudentExperiences", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StudentExperiences_StudentProfiles_StudentUserId",
                        column: x => x.StudentUserId,
                        principalTable: "StudentProfiles",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "StudentInterests",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StudentUserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Interest = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StudentInterests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StudentInterests_StudentProfiles_StudentUserId",
                        column: x => x.StudentUserId,
                        principalTable: "StudentProfiles",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "StudentProjects",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StudentUserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TechStack = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Links = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StudentProjects", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StudentProjects_StudentProfiles_StudentUserId",
                        column: x => x.StudentUserId,
                        principalTable: "StudentProfiles",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Applications_StudentUserId_OpportunityId",
                table: "Applications",
                columns: new[] { "StudentUserId", "OpportunityId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_StudentEducations_StudentUserId",
                table: "StudentEducations",
                column: "StudentUserId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentExperiences_StudentUserId",
                table: "StudentExperiences",
                column: "StudentUserId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentInterests_StudentUserId",
                table: "StudentInterests",
                column: "StudentUserId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentProjects_StudentUserId",
                table: "StudentProjects",
                column: "StudentUserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "StudentEducations");

            migrationBuilder.DropTable(
                name: "StudentExperiences");

            migrationBuilder.DropTable(
                name: "StudentInterests");

            migrationBuilder.DropTable(
                name: "StudentProjects");

            migrationBuilder.DropIndex(
                name: "IX_Applications_StudentUserId_OpportunityId",
                table: "Applications");

            migrationBuilder.DropColumn(
                name: "Note",
                table: "Applications");

            migrationBuilder.DropColumn(
                name: "StudentUserId",
                table: "Applications");

            migrationBuilder.DropColumn(
                name: "UpdatedAtUtc",
                table: "Applications");

            migrationBuilder.DropColumn(
                name: "WithdrawndAt",
                table: "Applications");
        }
    }
}
