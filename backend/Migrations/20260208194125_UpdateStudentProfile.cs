using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Jobify.Migrations
{
    /// <inheritdoc />
    public partial class UpdateStudentProfile : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ResumeContentType",
                table: "StudentProfiles",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ResumeFileName",
                table: "StudentProfiles",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ResumeOriginalFileName",
                table: "StudentProfiles",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ResumeUploadedAtUtc",
                table: "StudentProfiles",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UniversityProofContentType",
                table: "StudentProfiles",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UniversityProofFileName",
                table: "StudentProfiles",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UniversityProofOriginalFileName",
                table: "StudentProfiles",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UniversityProofUploadedAtUtc",
                table: "StudentProfiles",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ResumeContentType",
                table: "StudentProfiles");

            migrationBuilder.DropColumn(
                name: "ResumeFileName",
                table: "StudentProfiles");

            migrationBuilder.DropColumn(
                name: "ResumeOriginalFileName",
                table: "StudentProfiles");

            migrationBuilder.DropColumn(
                name: "ResumeUploadedAtUtc",
                table: "StudentProfiles");

            migrationBuilder.DropColumn(
                name: "UniversityProofContentType",
                table: "StudentProfiles");

            migrationBuilder.DropColumn(
                name: "UniversityProofFileName",
                table: "StudentProfiles");

            migrationBuilder.DropColumn(
                name: "UniversityProofOriginalFileName",
                table: "StudentProfiles");

            migrationBuilder.DropColumn(
                name: "UniversityProofUploadedAtUtc",
                table: "StudentProfiles");
        }
    }
}
