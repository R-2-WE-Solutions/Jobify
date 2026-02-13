using System.ComponentModel.DataAnnotations;

namespace Jobify.Api.Models;

//stores the student profile page details
public class StudentProfile
{
    [Key]
    public string UserId { get; set; } //pk for the studentprofile, fk for Users.Id- links profile to user

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
    public string? ResumeFileName { get; set; }           // stored name on server
    public string? ResumeOriginalFileName { get; set; }   // name user uploaded
    public string? ResumeContentType { get; set; }
    public DateTime? ResumeUploadedAtUtc { get; set; }

    public string? UniversityProofFileName { get; set; }
    public string? UniversityProofOriginalFileName { get; set; }
    public string? UniversityProofContentType { get; set; }
    public DateTime? UniversityProofUploadedAtUtc { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
