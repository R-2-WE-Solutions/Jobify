namespace Jobify.Api.Models;

//link oppoortunities to the skkills they require
public class OpportunitySkill
{
    public int Id { get; set; } // pk
    public int OpportunityId { get; set; } //which opportunity? (fk) opprtunities.id
    public int SkillId { get; set; } //required skills (fk) skills.id
}
