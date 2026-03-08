using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Jobify.Migrations
{
    public partial class ManualFixStudentProfileColumns : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
IF COL_LENGTH('StudentProfiles', 'Location') IS NULL
BEGIN
    ALTER TABLE [StudentProfiles] ADD [Location] nvarchar(max) NULL;
END
");

            migrationBuilder.Sql(@"
IF COL_LENGTH('StudentProfiles', 'PhoneNumber') IS NULL
BEGIN
    ALTER TABLE [StudentProfiles] ADD [PhoneNumber] nvarchar(max) NULL;
END
");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
IF COL_LENGTH('StudentProfiles', 'Location') IS NOT NULL
BEGIN
    ALTER TABLE [StudentProfiles] DROP COLUMN [Location];
END
");

            migrationBuilder.Sql(@"
IF COL_LENGTH('StudentProfiles', 'PhoneNumber') IS NOT NULL
BEGIN
    ALTER TABLE [StudentProfiles] DROP COLUMN [PhoneNumber];
END
");
        }
    }
}