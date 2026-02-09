using Jobify.Api.Data;
using Jobify.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System.Security.Claims;

namespace Jobify.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly UserManager<IdentityUser> _userManager;
    private readonly IConfiguration _config;

    public ProfileController(AppDbContext context, UserManager<IdentityUser> userManager, IConfiguration config)
    {
        _context = context;
        _userManager = userManager;
        _config = config;
    }
    private string? GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier);

    private async Task<(IdentityUser user, IList<string> roles)?> GetUserAndRolesAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return null;

        var roles = await _userManager.GetRolesAsync(user);
        return (user, roles);
    }

    private string GetStudentUploadsRoot()
        => _config["FileStorage:StudentUploadsRoot"] ?? "Uploads/Students";

    private string BuildStudentUserFolder(string userId)
        => Path.Combine(GetStudentUploadsRoot(), userId);

    private static string SafeExt(string fileName)
    {
        var ext = Path.GetExtension(fileName);
        if (string.IsNullOrWhiteSpace(ext)) return "";
        return ext.Length > 12 ? "" : ext;
    }

    private static bool IsAllowedResumeType(string contentType, string ext)
    {
        return contentType == "application/pdf"
            || contentType == "application/msword"
            || contentType == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            || ext.Equals(".pdf", StringComparison.OrdinalIgnoreCase)
            || ext.Equals(".doc", StringComparison.OrdinalIgnoreCase)
            || ext.Equals(".docx", StringComparison.OrdinalIgnoreCase);
    }

    private static bool IsAllowedProofType(string contentType, string ext)
    {
        return contentType.StartsWith("image/")
            || contentType == "application/pdf"
            || ext.Equals(".pdf", StringComparison.OrdinalIgnoreCase)
            || ext.Equals(".png", StringComparison.OrdinalIgnoreCase)
            || ext.Equals(".jpg", StringComparison.OrdinalIgnoreCase)
            || ext.Equals(".jpeg", StringComparison.OrdinalIgnoreCase);
    }

    private async Task<StudentProfile> GetOrCreateStudentProfile(string userId)
    {
        var studentProfile = await _context.StudentProfiles.FirstOrDefaultAsync(s => s.UserId == userId);

        if (studentProfile == null)
        {
            studentProfile = new StudentProfile
            {
                UserId = userId,
                CreatedAt = DateTime.UtcNow
            };
            _context.StudentProfiles.Add(studentProfile);
            await _context.SaveChangesAsync();
        }

        return studentProfile;
    }

    private async Task<string> SaveFileAsync(IFormFile file, string folder, string prefix)
    {
        Directory.CreateDirectory(folder);

        var ext = SafeExt(file.FileName);
        var storedName = $"{prefix}_{Guid.NewGuid():N}{ext}";
        var fullPath = Path.Combine(folder, storedName);

        using (var stream = new FileStream(fullPath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        return storedName;
    }
    [HttpGet]
    public async Task<IActionResult> GetProfile()
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId))
            return Unauthorized("User not authenticated");

        var ur = await GetUserAndRolesAsync(userId);
        if (ur == null)
            return NotFound("User not found");

        var roles = ur.Value.roles;

        if (roles.Contains("Student"))
        {
            var studentProfile = await _context.StudentProfiles
                .FirstOrDefaultAsync(sp => sp.UserId == userId);

            if (studentProfile == null)
            {
                studentProfile = new StudentProfile
                {
                    UserId = userId,
                    CreatedAt = DateTime.UtcNow
                };
                _context.StudentProfiles.Add(studentProfile);
                await _context.SaveChangesAsync();
            }

            return Ok(new
            {
                role = "Student",
                profile = new
                {
                    userId = studentProfile.UserId,
                    fullName = studentProfile.FullName,
                    university = studentProfile.University,
                    major = studentProfile.Major,
                    bio = studentProfile.Bio,
                    portfolioUrl = studentProfile.PortfolioUrl,
                    educationText = studentProfile.EducationText,
                    experienceText = studentProfile.ExperienceText,
                    projectsText = studentProfile.ProjectsText,
                    interestsText = studentProfile.InterestsText,
                    certificationsText = studentProfile.CertificationsText,
                    awardsText = studentProfile.AwardsText,
                    createdAt = studentProfile.CreatedAt,
                    updatedAt = studentProfile.UpdatedAt,
                    hasResume = !string.IsNullOrEmpty(studentProfile.ResumeFileName),
                    hasUniversityProof = !string.IsNullOrEmpty(studentProfile.UniversityProofFileName),
                    resumeUploadedAtUtc = studentProfile.ResumeUploadedAtUtc,
                    universityProofUploadedAtUtc = studentProfile.UniversityProofUploadedAtUtc
                }
            });
        }
        else if (roles.Contains("Recruiter"))
        {
            var recruiterProfile = await _context.RecruiterProfiles
                .FirstOrDefaultAsync(rp => rp.UserId == userId);

            if (recruiterProfile == null)
            {
                recruiterProfile = new RecruiterProfile
                {
                    UserId = userId,
                    CompanyName = "",
                    CreatedAtUtc = DateTime.UtcNow
                };
                _context.RecruiterProfiles.Add(recruiterProfile);
                await _context.SaveChangesAsync();
            }

            return Ok(new
            {
                role = "Recruiter",
                profile = new
                {
                    userId = recruiterProfile.UserId,
                    companyName = recruiterProfile.CompanyName,
                    emailDomain = recruiterProfile.EmailDomain,
                    websiteUrl = recruiterProfile.WebsiteUrl,
                    linkedinUrl = recruiterProfile.LinkedinUrl,
                    instagramUrl = recruiterProfile.InstagramUrl,
                    verificationStatus = recruiterProfile.VerificationStatus.ToString(),
                    notes = recruiterProfile.Notes,
                    createdAt = recruiterProfile.CreatedAtUtc,
                    emailConfirmedAt = recruiterProfile.EmailConfirmedAtUtc,
                    verifiedAt = recruiterProfile.VerifiedAtUtc
                }
            });
        }

        return BadRequest("User has no valid role");
    }
    [HttpPut]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId))
            return Unauthorized("User not authenticated");

        var ur = await GetUserAndRolesAsync(userId);
        if (ur == null)
            return NotFound("User not found");

        var roles = ur.Value.roles;

        if (roles.Contains("Student"))
        {
            var studentProfile = await _context.StudentProfiles
                .FirstOrDefaultAsync(sp => sp.UserId == userId);

            if (studentProfile == null)
            {
                studentProfile = new StudentProfile
                {
                    UserId = userId,
                    CreatedAt = DateTime.UtcNow
                };
                _context.StudentProfiles.Add(studentProfile);
            }

            studentProfile.FullName = request.FullName;
            studentProfile.University = request.University;
            studentProfile.Major = request.Major;
            studentProfile.Bio = request.Bio;
            studentProfile.PortfolioUrl = request.PortfolioUrl;
            studentProfile.EducationText = request.EducationText;
            studentProfile.ExperienceText = request.ExperienceText;
            studentProfile.ProjectsText = request.ProjectsText;
            studentProfile.InterestsText = request.InterestsText;
            studentProfile.CertificationsText = request.CertificationsText;
            studentProfile.AwardsText = request.AwardsText;
            studentProfile.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                role = "Student",
                profile = new
                {
                    userId = studentProfile.UserId,
                    fullName = studentProfile.FullName,
                    university = studentProfile.University,
                    major = studentProfile.Major,
                    bio = studentProfile.Bio,
                    portfolioUrl = studentProfile.PortfolioUrl,
                    educationText = studentProfile.EducationText,
                    experienceText = studentProfile.ExperienceText,
                    projectsText = studentProfile.ProjectsText,
                    interestsText = studentProfile.InterestsText,
                    certificationsText = studentProfile.CertificationsText,
                    awardsText = studentProfile.AwardsText,
                    updatedAt = studentProfile.UpdatedAt,

                    hasResume = !string.IsNullOrEmpty(studentProfile.ResumeFileName),
                    hasUniversityProof = !string.IsNullOrEmpty(studentProfile.UniversityProofFileName),
                    resumeUploadedAtUtc = studentProfile.ResumeUploadedAtUtc,
                    universityProofUploadedAtUtc = studentProfile.UniversityProofUploadedAtUtc
                }
            });
        }
        else if (roles.Contains("Recruiter"))
        {
            var recruiterProfile = await _context.RecruiterProfiles
                .FirstOrDefaultAsync(rp => rp.UserId == userId);

            if (recruiterProfile == null)
            {
                recruiterProfile = new RecruiterProfile
                {
                    UserId = userId,
                    CreatedAtUtc = DateTime.UtcNow
                };
                _context.RecruiterProfiles.Add(recruiterProfile);
            }

            if (!string.IsNullOrEmpty(request.CompanyName))
                recruiterProfile.CompanyName = request.CompanyName;

            recruiterProfile.EmailDomain = request.EmailDomain;
            recruiterProfile.WebsiteUrl = request.WebsiteUrl;
            recruiterProfile.LinkedinUrl = request.LinkedinUrl;
            recruiterProfile.InstagramUrl = request.InstagramUrl;
            recruiterProfile.Notes = request.Notes;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                role = "Recruiter",
                profile = new
                {
                    userId = recruiterProfile.UserId,
                    companyName = recruiterProfile.CompanyName,
                    emailDomain = recruiterProfile.EmailDomain,
                    websiteUrl = recruiterProfile.WebsiteUrl,
                    linkedinUrl = recruiterProfile.LinkedinUrl,
                    instagramUrl = recruiterProfile.InstagramUrl,
                    verificationStatus = recruiterProfile.VerificationStatus.ToString(),
                    notes = recruiterProfile.Notes
                }
            });
        }

        return BadRequest("User has no valid role");
    }

    [HttpPost("student/resume")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadStudentResume(IFormFile file)
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId))
            return Unauthorized("User not authenticated");

        var ur = await GetUserAndRolesAsync(userId);
        if (ur == null)
            return NotFound("User not found");

        var roles = ur.Value.roles;
        if (!roles.Contains("Student"))
            return Forbid("Only students can upload resume.");

        if (file == null || file.Length == 0)
            return BadRequest("No file uploaded.");

        if (file.Length > 10 * 1024 * 1024)
            return BadRequest("File too large. Max 10MB.");

        var ext = SafeExt(file.FileName);
        if (!IsAllowedResumeType(file.ContentType ?? "", ext))
            return BadRequest("Resume must be PDF/DOC/DOCX.");

        var studentProfile = await GetOrCreateStudentProfile(userId);

        var folder = BuildStudentUserFolder(userId);
        var storedName = await SaveFileAsync(file, folder, "resume");
        if (!string.IsNullOrEmpty(studentProfile.ResumeFileName))
        {
            var oldPath = Path.Combine(folder, studentProfile.ResumeFileName);
            if (System.IO.File.Exists(oldPath))
                System.IO.File.Delete(oldPath);
        }

        studentProfile.ResumeFileName = storedName;
        studentProfile.ResumeOriginalFileName = file.FileName;
        studentProfile.ResumeContentType = file.ContentType;
        studentProfile.ResumeUploadedAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            role = "Student",
            profile = new
            {
                hasResume = true,
                resumeUploadedAtUtc = studentProfile.ResumeUploadedAtUtc
            }
        });
    }

    [HttpGet("student/resume")]
    public async Task<IActionResult> DownloadStudentResume()
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId))
            return Unauthorized("User not authenticated");

        var ur = await GetUserAndRolesAsync(userId);
        if (ur == null)
            return NotFound("User not found");

        var roles = ur.Value.roles;
        if (!roles.Contains("Student"))
            return Forbid("Only students can download resume.");

        var studentProfile = await _context.StudentProfiles.FirstOrDefaultAsync(s => s.UserId == userId);
        if (studentProfile == null || string.IsNullOrEmpty(studentProfile.ResumeFileName))
            return NotFound("No resume uploaded.");

        var folder = BuildStudentUserFolder(userId);
        var fullPath = Path.Combine(folder, studentProfile.ResumeFileName);

        if (!System.IO.File.Exists(fullPath))
            return NotFound("Resume file missing on server.");

        var stream = new FileStream(fullPath, FileMode.Open, FileAccess.Read, FileShare.Read);
        var contentType = studentProfile.ResumeContentType ?? "application/octet-stream";
        var downloadName = studentProfile.ResumeOriginalFileName ?? "resume";

        return File(stream, contentType, downloadName);
    }

    [HttpDelete("student/resume")]
    public async Task<IActionResult> DeleteStudentResume()
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId))
            return Unauthorized("User not authenticated");

        var ur = await GetUserAndRolesAsync(userId);
        if (ur == null)
            return NotFound("User not found");

        var roles = ur.Value.roles;
        if (!roles.Contains("Student"))
            return Forbid("Only students can delete resume.");

        var studentProfile = await _context.StudentProfiles.FirstOrDefaultAsync(s => s.UserId == userId);
        if (studentProfile == null || string.IsNullOrEmpty(studentProfile.ResumeFileName))
            return NotFound("No resume uploaded.");

        var folder = BuildStudentUserFolder(userId);
        var fullPath = Path.Combine(folder, studentProfile.ResumeFileName);

        if (System.IO.File.Exists(fullPath))
            System.IO.File.Delete(fullPath);

        studentProfile.ResumeFileName = null;
        studentProfile.ResumeOriginalFileName = null;
        studentProfile.ResumeContentType = null;
        studentProfile.ResumeUploadedAtUtc = null;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Resume deleted successfully" });
    }

    [HttpPost("student/university-proof")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadUniversityProof(FormFile file)
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId))
            return Unauthorized("User not authenticated");

        var ur = await GetUserAndRolesAsync(userId);
        if (ur == null)
            return NotFound("User not found");

        var roles = ur.Value.roles;
        if (!roles.Contains("Student"))
            return Forbid("Only students can upload university proof.");

        if (file == null || file.Length == 0)
            return BadRequest("No file uploaded.");

        if (file.Length > 10 * 1024 * 1024)
            return BadRequest("File too large. Max 10MB.");

        var ext = SafeExt(file.FileName);
        if (!IsAllowedProofType(file.ContentType ?? "", ext))
            return BadRequest("University proof must be an image (png/jpg) or PDF.");

        var studentProfile = await GetOrCreateStudentProfile(userId);

        var folder = BuildStudentUserFolder(userId);
        var storedName = await SaveFileAsync(file, folder, "university_proof");

        if (!string.IsNullOrEmpty(studentProfile.UniversityProofFileName))
        {
            var oldPath = Path.Combine(folder, studentProfile.UniversityProofFileName);
            if (System.IO.File.Exists(oldPath))
                System.IO.File.Delete(oldPath);
        }

        studentProfile.UniversityProofFileName = storedName;
        studentProfile.UniversityProofOriginalFileName = file.FileName;
        studentProfile.UniversityProofContentType = file.ContentType;
        studentProfile.UniversityProofUploadedAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            role = "Student",
            profile = new
            {
                hasUniversityProof = true,
                universityProofUploadedAtUtc = studentProfile.UniversityProofUploadedAtUtc
            }
        });
    }

    [HttpGet("student/university-proof")]
    public async Task<IActionResult> DownloadUniversityProof()
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId))
            return Unauthorized("User not authenticated");

        var ur = await GetUserAndRolesAsync(userId);
        if (ur == null)
            return NotFound("User not found");

        var roles = ur.Value.roles;
        if (!roles.Contains("Student"))
            return Forbid("Only students can download university proof.");

        var studentProfile = await _context.StudentProfiles.FirstOrDefaultAsync(s => s.UserId == userId);
        if (studentProfile == null || string.IsNullOrEmpty(studentProfile.UniversityProofFileName))
            return NotFound("No university proof uploaded.");

        var folder = BuildStudentUserFolder(userId);
        var fullPath = Path.Combine(folder, studentProfile.UniversityProofFileName);

        if (!System.IO.File.Exists(fullPath))
            return NotFound("University proof file missing on server.");

        var stream = new FileStream(fullPath, FileMode.Open, FileAccess.Read, FileShare.Read);
        var contentType = studentProfile.UniversityProofContentType ?? "application/octet-stream";
        var downloadName = studentProfile.UniversityProofOriginalFileName ?? "university_proof";

        return File(stream, contentType, downloadName);
    }

    [HttpDelete("student/university-proof")]
    public async Task<IActionResult> DeleteUniversityProof()
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId))
            return Unauthorized("User not authenticated");

        var ur = await GetUserAndRolesAsync(userId);
        if (ur == null)
            return NotFound("User not found");

        var roles = ur.Value.roles;
        if (!roles.Contains("Student"))
            return Forbid("Only students can delete university proof.");

        var studentProfile = await _context.StudentProfiles.FirstOrDefaultAsync(s => s.UserId == userId);
        if (studentProfile == null || string.IsNullOrEmpty(studentProfile.UniversityProofFileName))
            return NotFound("No university proof uploaded.");

        var folder = BuildStudentUserFolder(userId);
        var fullPath = Path.Combine(folder, studentProfile.UniversityProofFileName);

        if (System.IO.File.Exists(fullPath))
            System.IO.File.Delete(fullPath);

        studentProfile.UniversityProofFileName = null;
        studentProfile.UniversityProofOriginalFileName = null;
        studentProfile.UniversityProofContentType = null;
        studentProfile.UniversityProofUploadedAtUtc = null;

        await _context.SaveChangesAsync();

        return Ok(new { message = "University proof deleted successfully" });
    }
}

// Request DTO for updating profile
public class UpdateProfileRequest
{
    public string? FullName { get; set; }
    public string? University { get; set; }
    public string? Major { get; set; }
    public string? Bio { get; set; }
    public string? PortfolioUrl { get; set; }
    public string? EducationText { get; set; }
    public string? ExperienceText { get; set; }
    public string? ProjectsText { get; set; }
    public string? InterestsText { get; set; }
    public string? CertificationsText { get; set; }
    public string? AwardsText { get; set; }

    public string? CompanyName { get; set; }
    public string? EmailDomain { get; set; }
    public string? WebsiteUrl { get; set; }
    public string? LinkedinUrl { get; set; }
    public string? InstagramUrl { get; set; }
    public string? Notes { get; set; }
}


public class UploadResumeRequest
{
    public IFormFile File { get; set; } = default!;
}
