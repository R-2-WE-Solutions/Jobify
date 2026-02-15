namespace Jobify.Api.DTOs;

public class CreateOpportunityDto
{
    public string Title { get; set; } = "";
    public string CompanyName { get; set; } = "";
    public string? Location { get; set; }
    public bool IsRemote { get; set; }

    public string Type { get; set; } = "Internship";   // Internship/Job/Scholarship/Workshop

    public string Level { get; set; } = "Entry";
    // Entry / Junior / Senior / Intern


    public decimal? MinPay { get; set; }
    public decimal? MaxPay { get; set; }

    public string? Description { get; set; }
    public DateTime? DeadlineUtc { get; set; }

    // skills names sent from frontend, example: ["React", "SQL"]
    public List<string> Skills { get; set; } = new();

    public string WorkMode { get; set; } = "OnSite";

    public string? LocationName { get; set; }
    public string? FullAddress { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }

    public List<string> Responsibilities { get; set; } = new();
    public List<string> PreferredSkills { get; set; } = new();
    public List<string> Benefits { get; set; } = new();

    public int AssessmentTimeLimitSeconds { get; set; }
    public int AssessmentMcqCount { get; set; }
    public int AssessmentChallengeCount { get; set; }


    public object? Assessment { get; set; }



}
