using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Jobify.Migrations
{
    /// <inheritdoc />
    public partial class AddHiringPrefsAndLogo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AssessedSkillsJson",
                table: "RecruiterProfiles",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HiringFocusJson",
                table: "RecruiterProfiles",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LogoFileName",
                table: "RecruiterProfiles",
                type: "nvarchar(300)",
                maxLength: 300,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PreferredWorkMode",
                table: "RecruiterProfiles",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RoleTitle",
                table: "RecruiterProfiles",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AssessedSkillsJson",
                table: "RecruiterProfiles");

            migrationBuilder.DropColumn(
                name: "HiringFocusJson",
                table: "RecruiterProfiles");

            migrationBuilder.DropColumn(
                name: "LogoFileName",
                table: "RecruiterProfiles");

            migrationBuilder.DropColumn(
                name: "PreferredWorkMode",
                table: "RecruiterProfiles");

            migrationBuilder.DropColumn(
                name: "RoleTitle",
                table: "RecruiterProfiles");
        }
    }
}
