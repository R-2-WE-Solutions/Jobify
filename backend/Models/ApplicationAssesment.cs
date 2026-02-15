using Jobify.Api.Models;

public class ApplicationAssessment
{
    public int Id { get; set; }
    public int ApplicationId { get; set; }
    public Application Application { get; set; } = null!;

    public string AnswersJson { get; set; } = "{}";     // MCQ answers + code drafts
    public decimal? Score { get; set; }

    public DateTime StartedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? SubmittedAtUtc { get; set; }

    // backend time limit
    public int TimeLimitSeconds { get; set; }           // copy from assessment at start
    public DateTime ExpiresAtUtc { get; set; }          // StartedAt + TimeLimitSeconds

    // randomization
    public int RandomSeed { get; set; }                 // store seed
    public string QuestionOrderJson { get; set; } = "[]"; // array of questionIds in order

    // proctoring
    public bool WebcamConsent { get; set; }
    public int TabSwitchCount { get; set; }
    public int CopyPasteCount { get; set; }
    public int SuspiciousCount { get; set; }
    public bool Flagged { get; set; }
    public string? FlagReason { get; set; }

    public int McqCountSnapshot { get; set; }
    public int ChallengeCountSnapshot { get; set; }

}
