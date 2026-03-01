using System.Collections.Generic;

namespace Jobify.Api.DTOs
{
    public class RecommendedOpportunityDto
    {
        public int OpportunityId { get; set; }
        public string Title { get; set; } = "";
        public double Score { get; set; }
        public List<string> MatchedSkills { get; set; } = new();
    }
}