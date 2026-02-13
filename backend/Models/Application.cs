using System;
using System.ComponentModel.DataAnnotations;

namespace Jobify.Api.Models;

public enum ApplicationStatus
{
    Draft = 0,
    InAssessment = 1,
    Submitted = 2,
    Withdrawn = 3
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
}
