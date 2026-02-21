using Jobify.Api.Data;
using Jobify.Api.DTOs;
using Jobify.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Jobify.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RecommendationController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly RecommendationService _service;

        public RecommendationController(AppDbContext db, RecommendationService service)
        {
            _db = db;
            _service = service;
        }

        [HttpPost("recommend")]
        public async Task<IActionResult> Recommend([FromBody] RecommendationRequestDto request)
        {
            // If frontend sends skills directly (best to start)
            var applicantSkills = request.Skills;

            // (Optional) If you want to load skills from DB using userId:
            // if (!string.IsNullOrEmpty(request.UserId))
            // {
            //     applicantSkills = await _db.StudentSkills
            //         .Where(ss => ss.StudentUserId == request.UserId)
            //         .Include(ss => ss.Skill)
            //         .Select(ss => new SkillInputDto
            //         {
            //             Name = ss.Skill.Name,
            //             Weight = 1
            //         })
            //         .ToListAsync();
            // }

            var opportunities = await _db.Opportunities
                .Include(o => o.OpportunitySkills)
                    .ThenInclude(os => os.Skill)
                .ToListAsync();

            var results = _service.Recommend(applicantSkills, opportunities);
            return Ok(results);
        }
    }
}