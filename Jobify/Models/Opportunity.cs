namespace Jobify.Api.Models;

//stores opoortunities stored in the dashboard
public class Opportunity
{
    public int Id { get; set; } //pk no fk in sprint 1 yet
    public string Title { get; set; } = ""; //opp title
    public string? Description { get; set; } //full description of the opp
    public string? Location { get; set; } //city coutnru remote hybrid...
    public string Type { get; set; } = "Internship"; //default value is the intenrship.... job, workshop....
    public DateTime? Deadline { get; set; } //deadline of the app
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsOpen { get; set; } = true; //still accepting apps or not?
}
