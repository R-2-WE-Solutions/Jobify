using Jobify.Api.Data;
using Jobify.Api.Models;
using Jobify.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System.Security.Claims;
using System.Text.RegularExpressions;

namespace Jobify.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly UserManager<IdentityUser> _userManager;
    private readonly IConfiguration _config;
    private readonly UniversityProofOcrService _ocrService;

    public ProfileController(
        AppDbContext context,
        UserManager<IdentityUser> userManager,
        IConfiguration config,
        UniversityProofOcrService ocrService)
    {
        _context = context;
        _userManager = userManager;
        _config = config;
        _ocrService = ocrService;
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
        return contentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase)
            || contentType == "application/pdf"
            || ext.Equals(".pdf", StringComparison.OrdinalIgnoreCase)
            || ext.Equals(".png", StringComparison.OrdinalIgnoreCase)
            || ext.Equals(".jpg", StringComparison.OrdinalIgnoreCase)
            || ext.Equals(".jpeg", StringComparison.OrdinalIgnoreCase);
    }

    private async Task<StudentProfile> GetOrCreateStudentProfile(string userId)
    {
        var studentProfile = await _context.StudentProfiles
            .FirstOrDefaultAsync(s => s.UserId == userId);

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

        await using var stream = new FileStream(fullPath, FileMode.Create);
        await file.CopyToAsync(stream);

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

        var user = ur.Value.user;
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
                email = user.Email,
                profile = new
                {
                    userId = studentProfile.UserId,
                    fullName = studentProfile.FullName,
                    university = studentProfile.University,
                    major = studentProfile.Major,
                    bio = studentProfile.Bio,
                    portfolioUrl = studentProfile.PortfolioUrl,
                    location = studentProfile.Location,
                    phoneNumber = studentProfile.PhoneNumber,
                    educationText = studentProfile.EducationText,
                    experienceText = studentProfile.ExperienceText,
                    projectsText = studentProfile.ProjectsText,
                    interestsText = studentProfile.InterestsText,
                    certificationsText = studentProfile.CertificationsText,
                    awardsText = studentProfile.AwardsText,
                    createdAt = studentProfile.CreatedAt,
                    updatedAtUtc = studentProfile.UpdatedAtUtc,
                    hasResume = !string.IsNullOrEmpty(studentProfile.ResumeFileName),
                    hasUniversityProof = !string.IsNullOrEmpty(studentProfile.UniversityProofFileName),
                    resumeUploadedAtUtc = studentProfile.ResumeUploadedAtUtc,
                    universityProofUploadedAtUtc = studentProfile.UniversityProofUploadedAtUtc
                }
            });
        }

        if (roles.Contains("Recruiter"))
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
                email = user.Email,
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
                    verifiedAt = recruiterProfile.VerifiedAtUtc,
                    roleTitle = recruiterProfile.RoleTitle,
                    hiringFocusJson = recruiterProfile.HiringFocusJson,
                    assessedSkillsJson = recruiterProfile.AssessedSkillsJson,
                    preferredWorkMode = recruiterProfile.PreferredWorkMode,
                    location = recruiterProfile.Location,
                    logoFileName = recruiterProfile.LogoFileName
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
            studentProfile.Location = request.Location;
            studentProfile.PhoneNumber = request.PhoneNumber;
            studentProfile.EducationText = request.EducationText;
            studentProfile.ExperienceText = request.ExperienceText;
            studentProfile.ProjectsText = request.ProjectsText;
            studentProfile.InterestsText = request.InterestsText;
            studentProfile.CertificationsText = request.CertificationsText;
            studentProfile.AwardsText = request.AwardsText;
            studentProfile.UpdatedAtUtc = DateTime.UtcNow;

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
                    location = studentProfile.Location,
                    phoneNumber = studentProfile.PhoneNumber,
                    educationText = studentProfile.EducationText,
                    experienceText = studentProfile.ExperienceText,
                    projectsText = studentProfile.ProjectsText,
                    interestsText = studentProfile.InterestsText,
                    certificationsText = studentProfile.CertificationsText,
                    awardsText = studentProfile.AwardsText,
                    updatedAtUtc = studentProfile.UpdatedAtUtc,
                    hasResume = !string.IsNullOrEmpty(studentProfile.ResumeFileName),
                    hasUniversityProof = !string.IsNullOrEmpty(studentProfile.UniversityProofFileName),
                    resumeUploadedAtUtc = studentProfile.ResumeUploadedAtUtc,
                    universityProofUploadedAtUtc = studentProfile.UniversityProofUploadedAtUtc
                }
            });
        }

        if (roles.Contains("Recruiter"))
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

            if (!string.IsNullOrWhiteSpace(request.CompanyName))
            {
                recruiterProfile.CompanyName = request.CompanyName;
                var opportunities = await _context.Opportunities
                    .Where(o => o.RecruiterUserId == userId).ToListAsync();
                foreach (var opp in opportunities)
                    opp.CompanyName = request.CompanyName;
            }

            recruiterProfile.EmailDomain = request.EmailDomain;
            recruiterProfile.WebsiteUrl = request.WebsiteUrl;
            recruiterProfile.LinkedinUrl = request.LinkedinUrl;
            recruiterProfile.InstagramUrl = request.InstagramUrl;
            recruiterProfile.Notes = request.Notes;
            recruiterProfile.RoleTitle = request.RoleTitle;
            recruiterProfile.HiringFocusJson = request.HiringFocusJson;
            recruiterProfile.AssessedSkillsJson = request.AssessedSkillsJson;
            recruiterProfile.PreferredWorkMode = request.PreferredWorkMode;
            recruiterProfile.Location = request.Location;

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
                    notes = recruiterProfile.Notes,
                    roleTitle = recruiterProfile.RoleTitle,
                    hiringFocusJson = recruiterProfile.HiringFocusJson,
                    assessedSkillsJson = recruiterProfile.AssessedSkillsJson,
                    preferredWorkMode = recruiterProfile.PreferredWorkMode,
                    location = recruiterProfile.Location,
                    logoFileName = recruiterProfile.LogoFileName
                }
            });
        }

        return BadRequest("User has no valid role");
    }

    [HttpPost("student/resume")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadStudentResume([FromForm] IFormFile file)
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId))
            return Unauthorized("User not authenticated");

        var ur = await GetUserAndRolesAsync(userId);
        if (ur == null)
            return NotFound("User not found");

        var roles = ur.Value.roles;
        if (!roles.Contains("Student"))
            return StatusCode(StatusCodes.Status403Forbidden, "Only students can upload resume.");

        if (file == null || file.Length == 0)
            return BadRequest("No file uploaded.");

        if (file.Length > 10 * 1024 * 1024)
            return BadRequest("File too large. Max 10MB.");

        var ext = SafeExt(file.FileName);
        if (!IsAllowedResumeType(file.ContentType ?? "", ext))
            return BadRequest("Resume must be PDF, DOC, or DOCX.");

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
            return StatusCode(StatusCodes.Status403Forbidden, "Only students can download resume.");

        var studentProfile = await _context.StudentProfiles
            .FirstOrDefaultAsync(s => s.UserId == userId);

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
            return StatusCode(StatusCodes.Status403Forbidden, "Only students can delete resume.");

        var studentProfile = await _context.StudentProfiles
            .FirstOrDefaultAsync(s => s.UserId == userId);

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
    public async Task<IActionResult> UploadUniversityProof([FromForm] IFormFile uploadedFile)
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId))
            return Unauthorized("User not authenticated");

        var ur = await GetUserAndRolesAsync(userId);
        if (ur == null)
            return NotFound("User not found");

        var roles = ur.Value.roles;
        if (!roles.Contains("Student"))
            return StatusCode(StatusCodes.Status403Forbidden, "Only students can upload university proof.");

        if (uploadedFile == null || uploadedFile.Length == 0)
            return BadRequest("No file uploaded.");

        if (uploadedFile.Length > 10 * 1024 * 1024)
            return BadRequest("File too large. Max 10MB.");

        var originalName = uploadedFile.FileName ?? "university_proof";
        var ext = SafeExt(originalName);
        var contentType = uploadedFile.ContentType ?? "";

        if (!IsAllowedProofType(contentType, ext))
            return BadRequest("University proof must be an image (png/jpg/jpeg) or PDF.");

        var studentProfile = await GetOrCreateStudentProfile(userId);

        var folder = BuildStudentUserFolder(userId);
        var storedName = await SaveFileAsync(uploadedFile, folder, "university_proof");
        var fullPath = Path.Combine(folder, storedName);

        try
        {
            var text = _ocrService.ExtractText(fullPath);
            var normalizedText = NormalizeText(text);
            var extractedUniversityName = ExtractUniversityName(text);

            var institutionKeywords = new[]
            {
                "university",
                "college",
                "institute",
                "school",
                "faculty",
                "campus",
                "aub",
                "american university of beirut",
                "beirut"
            };

            var idKeywords = new[]
            {
                "student",
                "student id",
                "id",
                "ug",
                "undergraduate",
                "graduate",
                "spring",
                "fall",
                "summer",
                "arts",
                "sciences"
            };

            var enrollmentKeywords = new[]
            {
                "registration",
                "enrollment",
                "currently registered",
                "registrar",
                "office of the registrar",
                "admissions",
                "semester",
                "term",
                "major",
                "department",
                "academic",
                "faculty"
            };

            var transcriptKeywords = new[]
            {
                "transcript",
                "courses",
                "credit hours",
                "gpa",
                "semester",
                "term",
                "academic record",
                "grade"
            };

            var institutionScore = institutionKeywords.Count(k => normalizedText.Contains(k));
            var idScore = idKeywords.Count(k => normalizedText.Contains(k));
            var enrollmentScore = enrollmentKeywords.Count(k => normalizedText.Contains(k));
            var transcriptScore = transcriptKeywords.Count(k => normalizedText.Contains(k));

            var nameMatched = false;
            if (!string.IsNullOrWhiteSpace(studentProfile.FullName))
            {
                nameMatched = NameLooksPresent(text, studentProfile.FullName);
            }

            if (!nameMatched)
            {
                if (System.IO.File.Exists(fullPath))
                    System.IO.File.Delete(fullPath);

                return BadRequest("The name on the university proof does not match the name in your profile.");
            }

            var looksLikeUniversityName = !string.IsNullOrWhiteSpace(extractedUniversityName);
            var hasStudentNumber = Regex.IsMatch(normalizedText, @"\b\d{7,10}\b");

            var directUniversityMatch =
                normalizedText.Contains("american university of beirut")
                || normalizedText.Contains("aub");

            var isStudentId =
                (institutionScore >= 1 || directUniversityMatch || looksLikeUniversityName)
                && (
                    idScore >= 2
                    || (normalizedText.Contains("student") && hasStudentNumber)
                    || (normalizedText.Contains("student") && looksLikeUniversityName)
                    || (normalizedText.Contains("student") && directUniversityMatch)
                );

            var isEnrollmentProof =
                (institutionScore >= 1 || directUniversityMatch || looksLikeUniversityName)
                && enrollmentScore >= 2;

            var isTranscript =
                (institutionScore >= 1 || directUniversityMatch || looksLikeUniversityName)
                && transcriptScore >= 2;

            var isAcceptedUniversityProof =
                isStudentId || isEnrollmentProof || isTranscript;

            if (!isAcceptedUniversityProof)
            {
                if (System.IO.File.Exists(fullPath))
                    System.IO.File.Delete(fullPath);

                return BadRequest("Uploaded document does not appear to be valid university proof.");
            }

            if (!string.IsNullOrEmpty(studentProfile.UniversityProofFileName))
            {
                var oldPath = Path.Combine(folder, studentProfile.UniversityProofFileName);
                if (System.IO.File.Exists(oldPath))
                    System.IO.File.Delete(oldPath);
            }

            studentProfile.UniversityProofFileName = storedName;
            studentProfile.UniversityProofOriginalFileName = originalName;
            studentProfile.UniversityProofContentType = contentType;
            studentProfile.UniversityProofUploadedAtUtc = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                role = "Student",
                profile = new
                {
                    hasUniversityProof = true,
                    universityProofUploadedAtUtc = studentProfile.UniversityProofUploadedAtUtc
                },
                debug = new
                {
                    extractedText = text,
                    normalizedText,
                    extractedUniversityName,
                    institutionScore,
                    idScore,
                    enrollmentScore,
                    transcriptScore,
                    hasStudentNumber,
                    looksLikeUniversityName,
                    directUniversityMatch,
                    nameMatched,
                    isStudentId,
                    isEnrollmentProof,
                    isTranscript
                }
            });
        }
        catch (Exception ex)
        {
            if (System.IO.File.Exists(fullPath))
                System.IO.File.Delete(fullPath);

            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                message = "An error occurred while processing the university proof.",
                error = ex.Message
            });
        }
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
            return StatusCode(StatusCodes.Status403Forbidden, "Only students can download university proof.");

        var studentProfile = await _context.StudentProfiles
            .FirstOrDefaultAsync(s => s.UserId == userId);

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
            return StatusCode(StatusCodes.Status403Forbidden, "Only students can delete university proof.");

        var studentProfile = await _context.StudentProfiles
            .FirstOrDefaultAsync(s => s.UserId == userId);

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

    [HttpGet("student/skills")]
    public async Task<IActionResult> GetSkills()
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var skills = await _context.StudentSkills
            .Where(s => s.StudentUserId == userId)
            .Join(
                _context.Skills,
                ss => ss.SkillId,
                sk => sk.Id,
                (ss, sk) => new
                {
                    id = ss.Id,
                    name = sk.Name,
                    isVerified = ss.IsVerified,
                    source = ss.Source,
                    createdAt = ss.CreatedAt
                })
            .ToListAsync();

        return Ok(skills);
    }

    [HttpPost("student/skills")]
    public async Task<IActionResult> AddSkill([FromBody] AddSkillRequest request)
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        if (string.IsNullOrWhiteSpace(request.Name))
            return BadRequest("Skill name required.");

        var normalizedName = request.Name.Trim();

        var skill = await _context.Skills
            .FirstOrDefaultAsync(s => s.Name.ToLower() == normalizedName.ToLower());

        if (skill == null)
        {
            skill = new Skill
            {
                Name = normalizedName
            };

            _context.Skills.Add(skill);
            await _context.SaveChangesAsync();
        }

        var existing = await _context.StudentSkills
            .FirstOrDefaultAsync(ss => ss.StudentUserId == userId && ss.SkillId == skill.Id);

        if (existing != null)
            return Conflict("Skill already added.");

        var studentSkill = new StudentSkill
        {
            StudentUserId = userId,
            SkillId = skill.Id,
            Source = "Manual",
            IsVerified = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.StudentSkills.Add(studentSkill);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            id = studentSkill.Id,
            name = skill.Name,
            isVerified = false,
            source = "Manual"
        });
    }

    [HttpDelete("student/skills/{id}")]
    public async Task<IActionResult> DeleteSkill(int id)
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var skill = await _context.StudentSkills
            .FirstOrDefaultAsync(s => s.Id == id && s.StudentUserId == userId);

        if (skill == null)
            return NotFound();

        _context.StudentSkills.Remove(skill);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Skill removed." });
    }

    [HttpGet("student/education")]
    public async Task<IActionResult> GetEducation()
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var items = await _context.StudentEducations
            .Where(e => e.StudentUserId == userId)
            .OrderByDescending(e => e.CreatedAt)
            .Select(e => new
            {
                e.Id,
                e.University,
                e.Degree,
                e.Major,
                e.Gpa,
                e.GraduationYear,
                e.CreatedAt
            })
            .ToListAsync();

        return Ok(items);
    }

    [HttpPost("student/education")]
    public async Task<IActionResult> AddEducation([FromBody] EducationRequest request)
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var item = new StudentEducation
        {
            StudentUserId = userId,
            University = request.University,
            Degree = request.Degree,
            Major = request.Major,
            Gpa = request.Gpa,
            GraduationYear = request.GraduationYear,
            CreatedAt = DateTime.UtcNow
        };

        _context.StudentEducations.Add(item);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            item.Id,
            item.University,
            item.Degree,
            item.Major,
            item.Gpa,
            item.GraduationYear,
            item.CreatedAt
        });
    }

    [HttpPut("student/education/{id}")]
    public async Task<IActionResult> UpdateEducation(int id, [FromBody] EducationRequest request)
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var item = await _context.StudentEducations
            .FirstOrDefaultAsync(e => e.Id == id && e.StudentUserId == userId);

        if (item == null)
            return NotFound();

        item.University = request.University;
        item.Degree = request.Degree;
        item.Major = request.Major;
        item.Gpa = request.Gpa;
        item.GraduationYear = request.GraduationYear;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            item.Id,
            item.University,
            item.Degree,
            item.Major,
            item.Gpa,
            item.GraduationYear
        });
    }

    [HttpDelete("student/education/{id}")]
    public async Task<IActionResult> DeleteEducation(int id)
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var item = await _context.StudentEducations
            .FirstOrDefaultAsync(e => e.Id == id && e.StudentUserId == userId);

        if (item == null)
            return NotFound();

        _context.StudentEducations.Remove(item);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Education removed." });
    }

    [HttpGet("student/experience")]
    public async Task<IActionResult> GetExperience()
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var items = await _context.StudentExperiences
            .Where(e => e.StudentUserId == userId)
            .OrderByDescending(e => e.CreatedAt)
            .Select(e => new
            {
                e.Id,
                e.Role,
                e.Company,
                e.Duration,
                e.Description,
                e.CreatedAt
            })
            .ToListAsync();

        return Ok(items);
    }

    [HttpPost("student/experience")]
    public async Task<IActionResult> AddExperience([FromBody] ExperienceRequest request)
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var item = new StudentExperience
        {
            StudentUserId = userId,
            Role = request.Role,
            Company = request.Company,
            Duration = request.Duration,
            Description = request.Description,
            CreatedAt = DateTime.UtcNow
        };

        _context.StudentExperiences.Add(item);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            item.Id,
            item.Role,
            item.Company,
            item.Duration,
            item.Description,
            item.CreatedAt
        });
    }

    [HttpPut("student/experience/{id}")]
    public async Task<IActionResult> UpdateExperience(int id, [FromBody] ExperienceRequest request)
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var item = await _context.StudentExperiences
            .FirstOrDefaultAsync(e => e.Id == id && e.StudentUserId == userId);

        if (item == null)
            return NotFound();

        item.Role = request.Role;
        item.Company = request.Company;
        item.Duration = request.Duration;
        item.Description = request.Description;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            item.Id,
            item.Role,
            item.Company,
            item.Duration,
            item.Description
        });
    }

    [HttpDelete("student/experience/{id}")]
    public async Task<IActionResult> DeleteExperience(int id)
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var item = await _context.StudentExperiences
            .FirstOrDefaultAsync(e => e.Id == id && e.StudentUserId == userId);

        if (item == null)
            return NotFound();

        _context.StudentExperiences.Remove(item);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Experience removed." });
    }

    [HttpGet("student/projects")]
    public async Task<IActionResult> GetProjects()
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var items = await _context.StudentProjects
            .Where(p => p.StudentUserId == userId)
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new
            {
                p.Id,
                p.Title,
                p.Description,
                p.TechStack,
                p.Links,
                p.CreatedAt
            })
            .ToListAsync();

        return Ok(items);
    }

    [HttpPost("student/projects")]
    public async Task<IActionResult> AddProject([FromBody] ProjectRequest request)
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var item = new StudentProject
        {
            StudentUserId = userId,
            Title = request.Title,
            Description = request.Description,
            TechStack = string.Join(",", request.TechStack ?? new List<string>()),
            Links = request.Links,
            CreatedAt = DateTime.UtcNow
        };

        _context.StudentProjects.Add(item);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            item.Id,
            item.Title,
            item.Description,
            item.TechStack,
            item.Links,
            item.CreatedAt
        });
    }

    [HttpPut("student/projects/{id}")]
    public async Task<IActionResult> UpdateProject(int id, [FromBody] ProjectRequest request)
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var item = await _context.StudentProjects
            .FirstOrDefaultAsync(p => p.Id == id && p.StudentUserId == userId);

        if (item == null)
            return NotFound();

        item.Title = request.Title;
        item.Description = request.Description;
        item.TechStack = string.Join(",", request.TechStack ?? new List<string>());
        item.Links = request.Links;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            item.Id,
            item.Title,
            item.Description,
            item.TechStack,
            item.Links
        });
    }

    [HttpDelete("student/projects/{id}")]
    public async Task<IActionResult> DeleteProject(int id)
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var item = await _context.StudentProjects
            .FirstOrDefaultAsync(p => p.Id == id && p.StudentUserId == userId);

        if (item == null)
            return NotFound();

        _context.StudentProjects.Remove(item);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Project removed." });
    }

    [HttpGet("student/interests")]
    public async Task<IActionResult> GetInterests()
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var items = await _context.StudentInterests
            .Where(i => i.StudentUserId == userId)
            .OrderBy(i => i.Interest)
            .Select(i => new
            {
                i.Id,
                i.Interest,
                i.CreatedAt
            })
            .ToListAsync();

        return Ok(items);
    }

    [HttpPost("student/interests")]
    public async Task<IActionResult> AddInterest([FromBody] InterestRequest request)
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        if (string.IsNullOrWhiteSpace(request.Interest))
            return BadRequest("Interest name required.");

        var normalizedInterest = request.Interest.Trim();

        var existing = await _context.StudentInterests
            .FirstOrDefaultAsync(i =>
                i.StudentUserId == userId &&
                i.Interest.ToLower() == normalizedInterest.ToLower());

        if (existing != null)
            return Conflict("Interest already added.");

        var item = new StudentInterest
        {
            StudentUserId = userId,
            Interest = normalizedInterest,
            CreatedAt = DateTime.UtcNow
        };

        _context.StudentInterests.Add(item);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            item.Id,
            item.Interest,
            item.CreatedAt
        });
    }

    [HttpDelete("student/interests/{id}")]
    public async Task<IActionResult> DeleteInterest(int id)
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var item = await _context.StudentInterests
            .FirstOrDefaultAsync(i => i.Id == id && i.StudentUserId == userId);

        if (item == null)
            return NotFound();

        _context.StudentInterests.Remove(item);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Interest removed." });
    }

    private static string NormalizeText(string input)
    {
        if (string.IsNullOrWhiteSpace(input))
            return string.Empty;

        input = input.ToLowerInvariant();
        input = Regex.Replace(input, @"[^\w\s]", " ");
        input = Regex.Replace(input, @"\s+", " ").Trim();

        return input;
    }

    private static bool NameLooksPresent(string ocrText, string fullName)
    {
        if (string.IsNullOrWhiteSpace(ocrText) || string.IsNullOrWhiteSpace(fullName))
            return false;

        var text = NormalizeText(ocrText);

        var firstName = NormalizeText(fullName)
            .Split(' ', StringSplitOptions.RemoveEmptyEntries)
            .FirstOrDefault();

        if (string.IsNullOrWhiteSpace(firstName) || firstName.Length < 3)
            return false;

        return text.Contains(firstName);
    }

    private static string? ExtractUniversityName(string ocrText)
    {
        if (string.IsNullOrWhiteSpace(ocrText))
            return null;

        var lines = ocrText
            .Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries)
            .Select(x => x.Trim())
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .ToList();

        var patterns = new[]
        {
            @"\b[A-Z][A-Za-z&,\-\s]+University[A-Za-z&,\-\s]*\b",
            @"\b[A-Z][A-Za-z&,\-\s]+College[A-Za-z&,\-\s]*\b",
            @"\b[A-Z][A-Za-z&,\-\s]+Institute[A-Za-z&,\-\s]*\b",
            @"\b[A-Z][A-Za-z&,\-\s]+School[A-Za-z&,\-\s]*\b"
        };

        foreach (var line in lines)
        {
            foreach (var pattern in patterns)
            {
                var match = Regex.Match(line, pattern);
                if (match.Success)
                    return match.Value.Trim();
            }
        }

        return null;
    }

    [HttpPost("recruiter/logo")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadRecruiterLogo(IFormFile file)
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();
        var ur = await GetUserAndRolesAsync(userId);
        if (ur == null || !ur.Value.roles.Contains("Recruiter")) return Forbid();
        if (file == null || file.Length == 0) return BadRequest("No file uploaded.");
        if (file.Length > 5 * 1024 * 1024) return BadRequest("File too large. Max 5MB.");
        var ext = Path.GetExtension(file.FileName).ToLower();
        var allowed = new[] { ".png", ".jpg", ".jpeg", ".webp" };
        if (!allowed.Contains(ext)) return BadRequest("Only PNG, JPG, JPEG, WEBP allowed.");
        var folder = Path.Combine("Uploads", "Recruiters", userId);
        Directory.CreateDirectory(folder);
        var profile = await _context.RecruiterProfiles.FirstOrDefaultAsync(r => r.UserId == userId);
        if (profile == null) return NotFound();
        if (!string.IsNullOrEmpty(profile.LogoFileName))
        {
            var oldPath = Path.Combine(folder, profile.LogoFileName);
            if (System.IO.File.Exists(oldPath)) System.IO.File.Delete(oldPath);
        }
        var storedName = $"logo_{Guid.NewGuid():N}{ext}";
        var fullPath = Path.Combine(folder, storedName);
        using (var stream = new FileStream(fullPath, FileMode.Create))
            await file.CopyToAsync(stream);
        profile.LogoFileName = storedName;
        await _context.SaveChangesAsync();
        return Ok(new { logoFileName = storedName });
    }

    [HttpGet("recruiter/logo")]
    [AllowAnonymous]
    public async Task<IActionResult> GetRecruiterLogo([FromQuery] string userId)
    {
        if (string.IsNullOrEmpty(userId)) return BadRequest();
        var profile = await _context.RecruiterProfiles.AsNoTracking()
            .FirstOrDefaultAsync(r => r.UserId == userId);
        if (profile == null || string.IsNullOrEmpty(profile.LogoFileName)) return NotFound();
        var path = Path.Combine("Uploads", "Recruiters", userId, profile.LogoFileName);
        if (!System.IO.File.Exists(path)) return NotFound();
        var ext = Path.GetExtension(profile.LogoFileName).ToLower();
        var mime = ext switch { ".png" => "image/png", ".webp" => "image/webp", _ => "image/jpeg" };
        Response.Headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
        Response.Headers["Pragma"] = "no-cache";
        return PhysicalFile(Path.GetFullPath(path), mime);
    }

    [HttpGet("company/{companyName}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetCompanyProfile(string companyName)
    {
        var profile = await _context.RecruiterProfiles.AsNoTracking()
            .FirstOrDefaultAsync(r => r.CompanyName == companyName);
        if (profile == null) return NotFound();
        return Ok(new {
            companyName = profile.CompanyName,
            notes = profile.Notes,
            websiteUrl = profile.WebsiteUrl,
            linkedinUrl = profile.LinkedinUrl,
            instagramUrl = profile.InstagramUrl,
            userId = profile.UserId,
            logoFileName = profile.LogoFileName
        });
    }

    [HttpGet("company/by-opportunity/{opportunityId:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetCompanyProfileByOpportunity(int opportunityId)
    {
        var opp = await _context.Opportunities.AsNoTracking()
            .FirstOrDefaultAsync(o => o.Id == opportunityId);
        if (opp == null) return NotFound();
        var profile = await _context.RecruiterProfiles.AsNoTracking()
            .FirstOrDefaultAsync(r => r.UserId == opp.RecruiterUserId);
        if (profile == null) return NotFound();
        return Ok(new {
            companyName = profile.CompanyName,
            notes = profile.Notes,
            websiteUrl = profile.WebsiteUrl,
            linkedinUrl = profile.LinkedinUrl,
            instagramUrl = profile.InstagramUrl,
            userId = profile.UserId,
            logoFileName = profile.LogoFileName
        });
    }
}

public class UpdateProfileRequest
{
    public string? CompanyName { get; set; }
    public string? EmailDomain { get; set; }
    public string? WebsiteUrl { get; set; }
    public string? LinkedinUrl { get; set; }
    public string? InstagramUrl { get; set; }
    public string? Notes { get; set; }
    public string? RoleTitle { get; set; }
    public string? HiringFocusJson { get; set; }
    public string? AssessedSkillsJson { get; set; }
    public string? PreferredWorkMode { get; set; }
    public string? Location { get; set; }
    public string? FullName { get; set; }
    public string? Bio { get; set; }
    public string? PhoneNumber { get; set; }
    public string? PortfolioUrl { get; set; }
    public string? University { get; set; }
    public string? Major { get; set; }
    public string? GraduationYear { get; set; }
    public string? EducationText { get; set; }
    public string? ExperienceText { get; set; }
    public string? ProjectsText { get; set; }
    public string? InterestsText { get; set; }
    public string? CertificationsText { get; set; }
    public string? AwardsText { get; set; }
}

public class UploadResumeRequest
{
    public IFormFile File { get; set; } = default!;
}

public class AddSkillRequest
{
    public string Name { get; set; } = string.Empty;
}

public class EducationRequest
{
    public string University { get; set; } = string.Empty;
    public string Degree { get; set; } = string.Empty;
    public string Major { get; set; } = string.Empty;
    public string? Gpa { get; set; }
    public string GraduationYear { get; set; } = string.Empty;
}

public class ExperienceRequest
{
    public string Role { get; set; } = string.Empty;
    public string Company { get; set; } = string.Empty;
    public string Duration { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public class ProjectRequest
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<string>? TechStack { get; set; }
    public string? Links { get; set; }
}

public class InterestRequest
{
    public string Interest { get; set; } = string.Empty;
}

public class UploadUniversityProofRequest
{
    public IFormFile File { get; set; } = default!;
}