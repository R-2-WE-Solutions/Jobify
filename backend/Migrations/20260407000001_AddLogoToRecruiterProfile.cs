using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Jobify.Api.Migrations
{
    public partial class AddLogoToRecruiterProfile : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "LogoFileName",
                table: "RecruiterProfiles",
                type: "nvarchar(300)",
                maxLength: 300,
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LogoFileName",
                table: "RecruiterProfiles");
        }
    }
}
