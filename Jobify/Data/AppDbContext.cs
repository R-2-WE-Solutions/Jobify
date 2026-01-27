using Microsoft.EntityFrameworkCore;
using Jobify.Api.Models;

namespace Jobify.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<StudentProfile> StudentProfiles => Set<StudentProfile>();
    public DbSet<Skill> Skills => Set<Skill>();
    public DbSet<StudentSkill> StudentSkills => Set<StudentSkill>();
    public DbSet<PortfolioDocument> PortfolioDocuments => Set<PortfolioDocument>();
    public DbSet<Opportunity> Opportunities => Set<Opportunity>();
    public DbSet<OpportunitySkill> OpportunitySkills => Set<OpportunitySkill>();
    public DbSet<PasswordResetToken> PasswordResetTokens => Set<PasswordResetToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>().HasIndex(x => x.Email).IsUnique();

        modelBuilder.Entity<StudentProfile>()
            .HasOne<User>()
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
