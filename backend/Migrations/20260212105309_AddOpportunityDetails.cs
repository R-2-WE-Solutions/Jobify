using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Jobify.Migrations
{
    /// <inheritdoc />
    public partial class AddOpportunityDetails : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AssessmentJson",
                table: "Opportunities",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BenefitsJson",
                table: "Opportunities",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FullAddress",
                table: "Opportunities",
                type: "nvarchar(250)",
                maxLength: 250,
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Latitude",
                table: "Opportunities",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LocationName",
                table: "Opportunities",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Longitude",
                table: "Opportunities",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PreferredSkillsJson",
                table: "Opportunities",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ResponsibilitiesJson",
                table: "Opportunities",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "WorkMode",
                table: "Opportunities",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AssessmentJson",
                table: "Opportunities");

            migrationBuilder.DropColumn(
                name: "BenefitsJson",
                table: "Opportunities");

            migrationBuilder.DropColumn(
                name: "FullAddress",
                table: "Opportunities");

            migrationBuilder.DropColumn(
                name: "Latitude",
                table: "Opportunities");

            migrationBuilder.DropColumn(
                name: "LocationName",
                table: "Opportunities");

            migrationBuilder.DropColumn(
                name: "Longitude",
                table: "Opportunities");

            migrationBuilder.DropColumn(
                name: "PreferredSkillsJson",
                table: "Opportunities");

            migrationBuilder.DropColumn(
                name: "ResponsibilitiesJson",
                table: "Opportunities");

            migrationBuilder.DropColumn(
                name: "WorkMode",
                table: "Opportunities");
        }
    }
}
