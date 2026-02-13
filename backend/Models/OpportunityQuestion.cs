using Jobify.Api.Models;
using System.ComponentModel.DataAnnotations;

public class OpportunityQuestion
{
    public int Id { get; set; }
    public int OpportunityId { get; set; }
    public Opportunity Opportunity { get; set; } = null!;

    [Required]
    public string Question { get; set; } = string.Empty;

    public string? Answer { get; set; }

    public DateTime AskedAtUtc { get; set; } = DateTime.UtcNow;
}
