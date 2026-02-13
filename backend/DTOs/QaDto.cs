public class QaDto
{
    public int Id { get; set; }
    public string Question { get; set; } = "";
    public string? Answer { get; set; }
    public DateTime AskedAtUtc { get; set; }
}
