using Jobify.Api.Data;
using Jobify.Api.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace Jobify.IntegrationTests;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    private readonly InMemoryDatabaseRoot _dbRoot = new();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureTestServices(services =>
        {
            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = TestAuthHandler.SchemeName;
                options.DefaultChallengeScheme = TestAuthHandler.SchemeName;
            })
            .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>(
                TestAuthHandler.SchemeName,
                _ => { });

            services.RemoveAll(typeof(DbContextOptions<AppDbContext>));

            services.AddDbContext<AppDbContext>(options =>
            {
                options.UseInMemoryDatabase("JobifyIntegrationTestsDb", _dbRoot);
                options.ConfigureWarnings(w =>
                    w.Ignore(CoreEventId.ManyServiceProvidersCreatedWarning));
            });

            var sp = services.BuildServiceProvider();

            using var scope = sp.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            db.Database.EnsureDeleted();
            db.Database.EnsureCreated();

            SeedData(db);
        });
    }

    private static void SeedData(AppDbContext db)
    {
        if (db.Users.Any() || db.Opportunities.Any() || db.Applications.Any())
            return;

        // =========================
        // Users
        // =========================
        var recruiter1 = new IdentityUser
        {
            Id = "recruiter-1",
            UserName = "recruiter1@jobify.com",
            Email = "recruiter1@jobify.com",
            EmailConfirmed = true
        };

        var recruiter2 = new IdentityUser
        {
            Id = "recruiter-2",
            UserName = "recruiter2@jobify.com",
            Email = "recruiter2@jobify.com",
            EmailConfirmed = true
        };

        var student1 = new IdentityUser
        {
            Id = "student-1",
            UserName = "student1@jobify.com",
            Email = "student1@jobify.com",
            EmailConfirmed = true
        };

        var student2 = new IdentityUser
        {
            Id = "student-2",
            UserName = "student2@jobify.com",
            Email = "student2@jobify.com",
            EmailConfirmed = true
        };

        db.Users.AddRange(recruiter1, recruiter2, student1, student2);

        // =========================
        // Recruiter Profiles
        // =========================
        db.RecruiterProfiles.AddRange(
            new RecruiterProfile
            {
                UserId = "recruiter-1",
                Email = "recruiter1@jobify.com",
                CompanyName = "Jobify",
                EmailDomain = "jobify.com",
                VerificationStatus = RecruiterVerificationStatus.Verified
            },
            new RecruiterProfile
            {
                UserId = "recruiter-2",
                Email = "recruiter2@jobify.com",
                CompanyName = "OtherCo",
                EmailDomain = "otherco.com",
                VerificationStatus = RecruiterVerificationStatus.Verified
            }
        );

        // =========================
        // Student Profiles
        // =========================
        db.StudentProfiles.AddRange(
            new StudentProfile
            {
                UserId = "student-1",
                Email = "student1@jobify.com",
                FullName = "Student One",
                University = "AUB",
                Major = "Computer Science",
                Location = "Beirut",
                Bio = "CS student testing Jobify.",
                ResumeFileName = "resume1.pdf"
            },
            new StudentProfile
            {
                UserId = "student-2",
                Email = "student2@jobify.com",
                FullName = "Student Two",
                University = "LAU",
                Major = "Computer Science",
                Location = "Beirut",
                Bio = "Another student."
            }
        );

        // =========================
        // Skills
        // =========================
        var skill1 = new Skill { Id = 1, Name = "C#" };
        var skill2 = new Skill { Id = 2, Name = "React" };
        var skill3 = new Skill { Id = 3, Name = "SQL" };

        db.Skills.AddRange(skill1, skill2, skill3);

        db.StudentSkills.AddRange(
            new StudentSkill
            {
                StudentUserId = "student-1",
                SkillId = 1,
                Source = "Manual",
                IsVerified = true
            },
            new StudentSkill
            {
                StudentUserId = "student-1",
                SkillId = 2,
                Source = "Manual",
                IsVerified = true
            }
        );

        // =========================
        // Assessment JSON
        // =========================
        var assessmentJson = """
        {
          "timeLimitSeconds": 1800,
          "questions": [
            {
              "id": "mcq-1",
              "type": "mcq",
              "prompt": "What is 2 + 2?",
              "options": ["3", "4", "5", "6"],
              "correctIndex": 1
            }
          ]
        }
        """;

        // =========================
        // Opportunities
        // =========================
        db.Opportunities.AddRange(
            new Opportunity
            {
                Id = 1,
                Title = "Backend Intern",
                CompanyName = "Jobify",
                RecruiterUserId = "recruiter-1",
                Type = OpportunityType.Job,
                Level = ExperienceLevel.Entry,
                WorkMode = WorkMode.OnSite,
                IsRemote = false,
                CreatedAtUtc = DateTime.UtcNow,
                IsClosed = false,
                AssessmentJson = assessmentJson
            },
            new Opportunity
            {
                Id = 2,
                Title = "Frontend Intern",
                CompanyName = "OtherCo",
                RecruiterUserId = "recruiter-2",
                Type = OpportunityType.Job,
                Level = ExperienceLevel.Entry,
                WorkMode = WorkMode.Remote,
                IsRemote = true,
                CreatedAtUtc = DateTime.UtcNow,
                IsClosed = false
            },
            new Opportunity
            {
                Id = 3,
                Title = "Closed Role",
                CompanyName = "Jobify",
                RecruiterUserId = "recruiter-1",
                Type = OpportunityType.Job,
                Level = ExperienceLevel.Entry,
                WorkMode = WorkMode.OnSite,
                IsRemote = false,
                CreatedAtUtc = DateTime.UtcNow,
                IsClosed = true
            },
            new Opportunity
            {
                Id = 4,
                Title = "Data Intern",
                CompanyName = "Jobify",
                RecruiterUserId = "recruiter-1",
                Type = OpportunityType.Job,
                Level = ExperienceLevel.Entry,
                WorkMode = WorkMode.Hybrid,
                IsRemote = false,
                CreatedAtUtc = DateTime.UtcNow,
                IsClosed = false
            }
        );

        db.OpportunitySkills.AddRange(
            new OpportunitySkill { OpportunityId = 1, SkillId = 1 },
            new OpportunitySkill { OpportunityId = 1, SkillId = 3 },
            new OpportunitySkill { OpportunityId = 2, SkillId = 2 }
        );

        // =========================
        // Applications
        // =========================


        db.Applications.AddRange(
            new Application
            {
                Id = 1,
                OpportunityId = 1,
                UserId = "student-1",
                StudentUserId = "student-1",
                Status = ApplicationStatus.Submitted,
                Note = "Initial application",
                CreatedAtUtc = DateTime.UtcNow.AddDays(-2),
                UpdatedAtUtc = DateTime.UtcNow.AddDays(-2)
            },
            new Application
            {
                Id = 2,
                OpportunityId = 2,
                UserId = "student-2",
                StudentUserId = "student-2",
                Status = ApplicationStatus.Submitted,
                CreatedAtUtc = DateTime.UtcNow.AddDays(-1),
                UpdatedAtUtc = DateTime.UtcNow.AddDays(-1)
            },
            new Application
            {
                Id = 3,
                OpportunityId = 1,
                UserId = "student-2",
                StudentUserId = "student-2",
                Status = ApplicationStatus.Shortlisted,
                Note = "Ready for interview",
                CreatedAtUtc = DateTime.UtcNow.AddHours(-12),
                UpdatedAtUtc = DateTime.UtcNow.AddHours(-12)
            }
        );


        // =========================
        // Notifications
        // =========================
        db.Notifications.AddRange(
            new Notification
            {
                Id = 1,
                UserId = "student-1",
                Title = "Application Update",
                Message = "Your application is now in review.",
                Type = "Application",
                IsRead = false,
                IsArchived = false,
                CreatedAtUtc = DateTime.UtcNow.AddHours(-3)
            },
            new Notification
            {
                Id = 2,
                UserId = "student-1",
                Title = "Interview Scheduled",
                Message = "Your interview has been scheduled.",
                Type = "Interview",
                IsRead = false,
                IsArchived = false,
                CreatedAtUtc = DateTime.UtcNow.AddHours(-2)
            },
            new Notification
            {
                Id = 3,
                UserId = "student-1",
                Title = "Old Archived Notification",
                Message = "This one is archived.",
                Type = "System",
                IsRead = true,
                IsArchived = true,
                CreatedAtUtc = DateTime.UtcNow.AddDays(-1)
            },
            new Notification
            {
                Id = 4,
                UserId = "student-2",
                Title = "Other User Notification",
                Message = "Belongs to another user.",
                Type = "System",
                IsRead = false,
                IsArchived = false,
                CreatedAtUtc = DateTime.UtcNow.AddHours(-1)
            }
        );

        db.SaveChanges();
    }
}