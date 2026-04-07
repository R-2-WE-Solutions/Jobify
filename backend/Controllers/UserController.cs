using Jobify.Api.Data;
using Jobify.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Jobify.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly UserManager<IdentityUser> _userManager;
    private readonly AppDbContext _context;

    public UsersController(AppDbContext context, UserManager<IdentityUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    // GET: /api/users
    [Authorize(Roles = "Admin")]
    [HttpGet]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _userManager.Users
            .OrderBy(u => u.Email)
            .ToListAsync();

        var result = new List<UserDto>();

        foreach (var u in users)
        {
            var roles = await _userManager.GetRolesAsync(u);

            result.Add(new UserDto(
                Id: u.Id,
                Email: u.Email ?? "",
                UserName: u.UserName ?? "",
                Roles: roles.ToList()
            ));
        }

        return Ok(result);
    }

    // GET : /api/users/by-role/{role}
    [Authorize(Roles = "Admin")]
    [HttpGet("by-role/{role}")]
    public async Task<IActionResult> GetUsersByRole(string role)
    {
        var context = HttpContext.RequestServices.GetRequiredService<AppDbContext>();

        if (role.ToLower() == "student")
        {
            var students = await (
                from u in context.Users
                join ur in context.UserRoles on u.Id equals ur.UserId
                join r in context.Roles on ur.RoleId equals r.Id
                join p in context.StudentProfiles on u.Id equals p.UserId
                where r.Name != null && r.Name.ToLower() == role.ToLower()
                select new StudentAdminDto
                {
                    Id = p.UserId,
                    Email = u.Email,
                    FullName = p.FullName,
                    CreatedAt = p.CreatedAt,
                    UpdatedAtUtc = p.UpdatedAtUtc
                }
            ).ToListAsync();

            return Ok(students);
        }
        else if (role.ToLower() == "recruiter")
        {
            var recruiters = await (
                from u in context.Users
                join ur in context.UserRoles on u.Id equals ur.UserId
                join r in context.Roles on ur.RoleId equals r.Id
                join p in context.RecruiterProfiles on u.Id equals p.UserId
                where r.Name != null && r.Name.ToLower() == role.ToLower()
                select new RecruiterAdminDto
                {
                    Id = p.UserId,
                    Email = u.Email,
                    CompanyName = p.CompanyName,
                    CreatedAt = p.CreatedAtUtc,
                    UpdatedAtUtc = p.VerifiedAtUtc ?? p.CreatedAtUtc,
                    VerificationStatus = p.VerificationStatus.ToString()
                }
            ).ToListAsync();

            return Ok(recruiters);
        }

        return BadRequest("Invalid Role!");
    }

    // GET: /api/users/{id}
    [Authorize(Roles = "Admin")]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetUserById(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return NotFound("User not found.");

        var roles = await _userManager.GetRolesAsync(user);

        return Ok(new UserDto(
            Id: user.Id,
            Email: user.Email ?? "",
            UserName: user.UserName ?? "",
            Roles: roles.ToList()
        ));
    }

    // DELETE: /api/users/{id}
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
            return NotFound("User not found.");

        var recruiterProfile = await HttpContext.RequestServices
            .GetRequiredService<AppDbContext>()
            .RecruiterProfiles
            .FirstOrDefaultAsync(r => r.UserId == id);

        if (recruiterProfile != null)
        {
            HttpContext.RequestServices
                .GetRequiredService<AppDbContext>()
                .RecruiterProfiles
                .Remove(recruiterProfile);

            await HttpContext.RequestServices
                .GetRequiredService<AppDbContext>()
                .SaveChangesAsync();
        }

        var result = await _userManager.DeleteAsync(user);
        if (!result.Succeeded)
            return BadRequest(result.Errors.Select(e => e.Description));

        return Ok(new { message = "User deleted successfully." });
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("admin/students/{id}/verify")]
    public async Task<IActionResult> VerifyStudent(string id)
    {
        var profile = await _context.StudentProfiles.FirstOrDefaultAsync(s => s.UserId == id);
        if (profile == null) return NotFound();

        profile.isVerified = true;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Student verified" });
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("admin/students/{id}")]
    public async Task<IActionResult> DeleteStudent(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return NotFound();

        await _userManager.DeleteAsync(user);

        return Ok(new { message = "User deleted" });
    }

    // Notify Student
    [Authorize(Roles = "Admin")]
    [HttpPost("admin/students/{id}/notify")]
    public async Task<IActionResult> NotifyStudent(string id, [FromBody] NotifyRequest request)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
            return NotFound("User not found.");

        if (string.IsNullOrWhiteSpace(request.Message))
            return BadRequest("Message is required.");

        var notification = new Notification
        {
            UserId = id,
            Title = string.IsNullOrWhiteSpace(request.Title) ? "Notification" : request.Title,
            Message = request.Message,
            Type = "warning",
            IsRead = false,
            IsArchived = false,
            CreatedAtUtc = DateTime.UtcNow
        };

        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Notification sent successfully." });
    }

    // Notify Recruiter
    [Authorize(Roles = "Admin")]
    [HttpPost("admin/recruiters/{id}/notify")]
    public async Task<IActionResult> NotifyRecruiter(string id, [FromBody] NotifyRequest request)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
            return NotFound("User not found.");

        if (string.IsNullOrWhiteSpace(request.Message))
            return BadRequest("Message is required.");

        var notification = new Notification
        {
            UserId = id,
            Title = string.IsNullOrWhiteSpace(request.Title) ? "Notification" : request.Title,
            Message = request.Message,
            Type = "warning",
            IsRead = false,
            IsArchived = false,
            CreatedAtUtc = DateTime.UtcNow
        };

        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Recruiter notified successfully." });
    }

    // Get Admin Dashboard
    [Authorize(Roles = "Admin")]
    [HttpGet("admin/dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        // Dates
        var now = DateTime.UtcNow;
        var yesterday = now.AddDays(-1);
        var currentMonthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var previousMonthStart = currentMonthStart.AddMonths(-1);

        // Totals
        var totalStudents = await _context.StudentProfiles.CountAsync();
        var totalRecruiters = await _context.RecruiterProfiles.CountAsync();

        var totalCompanies = await _context.RecruiterProfiles
            .Select(r => r.CompanyName)
            .Distinct()
            .CountAsync();

        var totalApplications = await _context.Applications.CountAsync();

        // Trends (this month vs previous month)
        var studentsThisMonth = await _context.StudentProfiles
            .CountAsync(s => s.CreatedAt >= currentMonthStart);
        var studentsLastMonth = await _context.StudentProfiles
            .CountAsync(s => s.CreatedAt >= previousMonthStart && s.CreatedAt < currentMonthStart);

        var recruitersThisMonth = await _context.RecruiterProfiles
            .CountAsync(r => r.CreatedAtUtc >= currentMonthStart);
        var recruitersLastMonth = await _context.RecruiterProfiles
            .CountAsync(r => r.CreatedAtUtc >= previousMonthStart && r.CreatedAtUtc < currentMonthStart);

        var applicationsThisMonth = await _context.Applications
            .CountAsync(a => a.CreatedAtUtc >= currentMonthStart);
        var applicationsLastMonth = await _context.Applications
            .CountAsync(a => a.CreatedAtUtc >= previousMonthStart && a.CreatedAtUtc < currentMonthStart);

        var companyFirstCreatedDates = await _context.RecruiterProfiles
            .Where(r => r.CompanyName != null && r.CompanyName != "")
            .GroupBy(r => r.CompanyName.Trim().ToLower())
            .Select(g => g.Min(x => x.CreatedAtUtc))
            .ToListAsync();

        var companiesThisMonth = companyFirstCreatedDates.Count(d => d >= currentMonthStart);
        var companiesLastMonth = companyFirstCreatedDates.Count(d => d >= previousMonthStart && d < currentMonthStart);

        // Recruiter Status
        var pendingVerification = await _context.RecruiterProfiles
            .CountAsync(r => r.VerificationStatus == RecruiterVerificationStatus.EmailPending);

        var pendingApproval = await _context.RecruiterProfiles
            .CountAsync(r => r.VerificationStatus == RecruiterVerificationStatus.Pending);

        var verifiedRecruiters = await _context.RecruiterProfiles
            .CountAsync(r => r.VerificationStatus == RecruiterVerificationStatus.Verified);

        var rejectedRecruiters = await _context.RecruiterProfiles
            .CountAsync(r => r.VerificationStatus == RecruiterVerificationStatus.Rejected);

        // Platform Health
        var activeUsers = await _context.Users.CountAsync();

        var newSignups = 0;

        var pendingActions = pendingApproval + pendingVerification;

        // Recent Activity
        var recentStudents = await _context.StudentProfiles
            .OrderByDescending(s => s.CreatedAt)
            .Take(10)
            .Select(s => new
            {
                type = "New Student",
                name = s.FullName ?? s.Email,
                email = s.Email,
                company = (string?)null,
                job = (string?)null,
                date = s.CreatedAt
            })
            .ToListAsync();

        var recentRecruiters = await _context.RecruiterProfiles
            .OrderByDescending(r => r.CreatedAtUtc)
            .Take(10)
            .Select(r => new
            {
                type = "New Recruiter",
                name = r.CompanyName,
                email = r.Email,
                company = r.CompanyName,
                job = (string?)null,
                date = r.CreatedAtUtc
            })
            .ToListAsync();

        var recentApplications = await _context.Applications
            .OrderByDescending(a => a.CreatedAtUtc)
            .Take(10)
            .Select(a => new
            {
                type = "New Application",
                name = "Application #" + a.Id,
                email = (string?)null,
                company = (string?)null,
                job = (string?)null,
                date = a.CreatedAtUtc
            })
            .ToListAsync();

        var recentOpportunities = await _context.Opportunities
            .OrderByDescending(o => o.CreatedAtUtc)
            .Take(10)
            .Select(o => new
            {
                type = "New Opportunity",
                name = o.Title,
                email = (string?)null,
                company = o.CompanyName,
                job = o.Title,
                date = o.CreatedAtUtc
            })
            .ToListAsync();

        var recentActivity = recentStudents
            .Concat(recentRecruiters)
            .Concat(recentApplications)
            .Concat(recentOpportunities)
            .OrderByDescending(x => x.date)
            .Take(10)
            .Select(x => new
            {
                x.type,
                x.name,
                x.email,
                x.company,
                x.job,
                time = x.date.ToString("g")
            })
            .ToList();

        return Ok(new
        {
            totalStudents,
            totalRecruiters,
            totalCompanies,
            totalApplications,

            pendingVerification,
            pendingApproval,
            verifiedRecruiters,
            rejectedRecruiters,

            activeUsers,
            newSignups,
            pendingActions,

            recentActivity,

            studentsTrendPercent = CalculatePercentageChange(studentsThisMonth, studentsLastMonth),
            recruitersTrendPercent = CalculatePercentageChange(recruitersThisMonth, recruitersLastMonth),
            companiesTrendPercent = CalculatePercentageChange(companiesThisMonth, companiesLastMonth),
            applicationsTrendPercent = CalculatePercentageChange(applicationsThisMonth, applicationsLastMonth),

        });
    }


    // Get Companies
    [Authorize(Roles = "Admin")]
    [HttpGet("companies")]
    public async Task<IActionResult> GetCompanies()
    {
        var profiles = await _context.RecruiterProfiles.ToListAsync();

        var companies = profiles
            .GroupBy(p => p.CompanyName.Trim().ToLower())
            .Select(group =>
            {
                var first = group.First();

                return new
                {
                    Id = group.Key,
                    Name = first.CompanyName,

                    Email = _context.Users
                        .Where(u => u.Id == first.UserId)
                        .Select(u => u.Email)
                        .FirstOrDefault() ?? first.Email,

                    Website = first.WebsiteUrl,
                    Linkedin = first.LinkedinUrl,
                    Instagram = first.InstagramUrl,

                    RecruiterCount = group.Count(),

                    Status = group.Any(p => p.VerificationStatus == RecruiterVerificationStatus.Verified)
                        ? "Verified"
                        : group.Any(p => p.VerificationStatus == RecruiterVerificationStatus.Pending)
                            ? "Pending"
                            : "Unverified",

                    Recruiters = group.Select(p => new
                    {
                        Id = p.UserId,
                        Email = _context.Users
                            .Where(u => u.Id == p.UserId)
                            .Select(u => u.Email)
                            .FirstOrDefault() ?? p.Email,
                        JoinedAt = p.CreatedAtUtc,
                        Status = p.VerificationStatus.ToString()
                    })
                };
            })
            .ToList();

        return Ok(companies);
    }

    // Admin: Get System Overview Stats
    [Authorize(Roles = "Admin")]
    [HttpGet("admin/system-overview")]
    public async Task<IActionResult> GetSystemOverview()
    {
        var since24h = DateTime.UtcNow.AddHours(-24);

        var pendingVerification = await _context.RecruiterProfiles
            .CountAsync(r => r.VerificationStatus == RecruiterVerificationStatus.EmailPending);

        var pendingApproval = await _context.RecruiterProfiles
            .CountAsync(r => r.VerificationStatus == RecruiterVerificationStatus.Pending);

        var verifiedRecruiters = await _context.RecruiterProfiles
            .CountAsync(r => r.VerificationStatus == RecruiterVerificationStatus.Verified);

        var rejectedRecruiters = await _context.RecruiterProfiles
            .CountAsync(r => r.VerificationStatus == RecruiterVerificationStatus.Rejected);

        var activeUsers = await _userManager.Users.CountAsync();

        var newStudentSignups = await _context.StudentProfiles
            .CountAsync(s => s.CreatedAt >= since24h);

        var newRecruiterSignups = await _context.RecruiterProfiles
            .CountAsync(r => r.CreatedAtUtc >= since24h);

        var unresolvedReports = await _context.OpportunityReports
            .CountAsync(r => !r.IsResolved);

        var newSignups = newStudentSignups + newRecruiterSignups;
        var pendingActions = pendingVerification + pendingApproval + unresolvedReports;

        return Ok(new
        {
            pendingVerification,
            pendingApproval,
            verifiedRecruiters,
            rejectedRecruiters,
            activeUsers,
            newSignups,
            pendingActions
        });
    }


    // DTO returned to frontend to keep API response clean and safe
    public record UserDto(string Id, string Email, string UserName, List<string> Roles);

    public class StudentAdminDto
    {
        public string? Id { get; set; }
        public string? Email { get; set; }
        public string? FullName { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAtUtc { get; set; }
    }

    public class RecruiterAdminDto
    {
        public string? Id { get; set; }
        public string? Email { get; set; }
        public string? CompanyName { get; set; }
        public string? VerificationStatus { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAtUtc { get; set; }
    }

    public class NotifyRequest
    {
        public string? Title { get; set; }
        public string Message { get; set; } = string.Empty;
    };


    // Helper Method
    private static double CalculatePercentageChange(int currentPeriodCount, int previousPeriodCount)
    {
        if (previousPeriodCount == 0)
            return currentPeriodCount > 0 ? 100.0 : 0.0;

        return ((currentPeriodCount - previousPeriodCount) / (double)previousPeriodCount) * 100.0;
    }

}