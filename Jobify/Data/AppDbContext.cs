using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore; // ✅ ADDED
using Jobify.Api.Models;

namespace Jobify.Api.Data;

public class AppDbContext : IdentityDbContext<IdentityUser> // 🔴 CHANGED
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<StudentProfile> StudentProfiles => Set<StudentProfile>();
    public DbSet<Skill> Skills => Set<Skill>();
    public DbSet<StudentSkill> StudentSkills => Set<StudentSkill>();
    public DbSet<PortfolioDocument> PortfolioDocuments => Set<PortfolioDocument>();
    public DbSet<Opportunity> Opportunities => Set<Opportunity>();
    public DbSet<OpportunitySkill> OpportunitySkills => Set<OpportunitySkill>();
    public DbSet<PasswordResetToken> PasswordResetTokens => Set<PasswordResetToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder); // ✅ ADDED (IMPORTANT)

        // ❌ REMOVED (Identity already enforces unique email)
        // modelBuilder.Entity<User>().HasIndex(x => x.Email).IsUnique();

        // 🔴 CHANGED: User → IdentityUser
        modelBuilder.Entity<StudentProfile>()
            .HasOne<IdentityUser>()          
            .WithOne()
            .HasForeignKey<StudentProfile>(x => x.UserId);

        modelBuilder.Entity<StudentSkill>()
            .HasOne<StudentProfile>()
            .WithMany()
            .HasForeignKey(x => x.StudentUserId);

        modelBuilder.Entity<StudentSkill>()
            .HasOne<Skill>()
            .WithMany()
            .HasForeignKey(x => x.SkillId);

        modelBuilder.Entity<OpportunitySkill>()
            .HasOne<Opportunity>()
            .WithMany()
            .HasForeignKey(x => x.OpportunityId);

        modelBuilder.Entity<OpportunitySkill>()
            .HasOne<Skill>()
            .WithMany()
            .HasForeignKey(x => x.SkillId);
    }
}
