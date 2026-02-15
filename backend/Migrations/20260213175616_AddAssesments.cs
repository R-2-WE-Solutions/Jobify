using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Jobify.Migrations
{
    /// <inheritdoc />
    public partial class AddAssesments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AssessmentJson",
                table: "Applications",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ApplicationAssessments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ApplicationId = table.Column<int>(type: "int", nullable: false),
                    AnswersJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Score = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    StartedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    SubmittedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TimeLimitSeconds = table.Column<int>(type: "int", nullable: false),
                    ExpiresAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    RandomSeed = table.Column<int>(type: "int", nullable: false),
                    QuestionOrderJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    WebcamConsent = table.Column<bool>(type: "bit", nullable: false),
                    TabSwitchCount = table.Column<int>(type: "int", nullable: false),
                    CopyPasteCount = table.Column<int>(type: "int", nullable: false),
                    SuspiciousCount = table.Column<int>(type: "int", nullable: false),
                    Flagged = table.Column<bool>(type: "bit", nullable: false),
                    FlagReason = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApplicationAssessments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ApplicationAssessments_Applications_ApplicationId",
                        column: x => x.ApplicationId,
                        principalTable: "Applications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProctorEvents",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ApplicationAssessmentId = table.Column<int>(type: "int", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Details = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProctorEvents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProctorEvents_ApplicationAssessments_ApplicationAssessmentId",
                        column: x => x.ApplicationAssessmentId,
                        principalTable: "ApplicationAssessments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationAssessments_ApplicationId",
                table: "ApplicationAssessments",
                column: "ApplicationId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProctorEvents_ApplicationAssessmentId",
                table: "ProctorEvents",
                column: "ApplicationAssessmentId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProctorEvents");

            migrationBuilder.DropTable(
                name: "ApplicationAssessments");

            migrationBuilder.DropColumn(
                name: "AssessmentJson",
                table: "Applications");
        }
    }
}
