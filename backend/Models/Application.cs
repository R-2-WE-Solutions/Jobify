using System;
using System.ComponentModel.DataAnnotations;

namespace Jobify.Api.Models;

public enum ApplicationStatus
{
    Pending = 0,
    InReview = 1,
    AssessmentSent = 2,
    AssessmentSubmitted = 3,
    Accepted = 4,
    Rejected = 5
}

public class Application
{
    public int Id { get; set; }

    [Required]
    public int OpportunityId { get; set; }
    public Opportunity Opportunity { get; set; } = null!;

    [Required]
    public string UserId { get; set; } = string.Empty;

    public ApplicationStatus Status { get; set; } = ApplicationStatus.Draft;

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public ApplicationAssessment? Assessment { get; set; }

    public string? AssessmentJson { get; set; }
}

using System.ComponentModel.DataAnnotations;

namespace Jobify.Api.Models
{
    public enum ApplicationStatus
    {
        Pending = 0,
        InReview = 1,
        AssessmentSent = 2,
        AssessmentSubmitted = 3,
        Accepted = 4,
        Rejected = 5
    }

    public class Application
    {
        public int Id { get; set; }

        [Required]
        public string StudentUserId { get; set; } = null!;

        [Required]
        public int OpportunityId { get; set; }

        public ApplicationStatus Status { get; set; } = ApplicationStatus.Pending;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Recruiter note
        public string? Note { get; set; }
    }
}