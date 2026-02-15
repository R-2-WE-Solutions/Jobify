public class ProctorEvent
{
    public int Id { get; set; }
    public int ApplicationAssessmentId { get; set; }
    public ApplicationAssessment Assessment { get; set; } = null!;

    public string Type { get; set; } = "";       // "TAB_BLUR", "COPY", "PASTE", "DEVTOOLS", ...
    public string? Details { get; set; }         // JSON/text
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
