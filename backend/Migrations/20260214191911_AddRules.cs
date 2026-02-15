using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Jobify.Migrations
{
    /// <inheritdoc />
    public partial class AddRules : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AssessmentChallengeCount",
                table: "Opportunities",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "AssessmentMcqCount",
                table: "Opportunities",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "AssessmentTimeLimitSeconds",
                table: "Opportunities",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ChallengeCountSnapshot",
                table: "ApplicationAssessments",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "McqCountSnapshot",
                table: "ApplicationAssessments",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AssessmentChallengeCount",
                table: "Opportunities");

            migrationBuilder.DropColumn(
                name: "AssessmentMcqCount",
                table: "Opportunities");

            migrationBuilder.DropColumn(
                name: "AssessmentTimeLimitSeconds",
                table: "Opportunities");

            migrationBuilder.DropColumn(
                name: "ChallengeCountSnapshot",
                table: "ApplicationAssessments");

            migrationBuilder.DropColumn(
                name: "McqCountSnapshot",
                table: "ApplicationAssessments");
        }
    }
}
