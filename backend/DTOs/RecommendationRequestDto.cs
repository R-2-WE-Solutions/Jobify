using System.Collections.Generic;

namespace Jobify.Api.DTOs
{
    public class RecommendationRequestDto
    {
        // Option A: send skills directly from frontend (simpler to start)
        public List<SkillInputDto> Skills { get; set; } = new();

        // Option B (later): use logged-in user skills from DB (optional)
        public string? UserId { get; set; }
    }

    public class SkillInputDto
    {
        public string Name { get; set; } = "";
        public double Weight { get; set; } = 1;
    }
}