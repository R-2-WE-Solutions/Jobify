using Jobify.Api.Data;
using Jobify.Api.Models;
using Jobify.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Jobify.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SkillExtractionController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly MlExtractionService _mlService;

        public SkillExtractionController(AppDbContext db, MlExtractionService mlService)
        {
            _db = db;
            _mlService = mlService;
        }

        [Authorize]
        [HttpPost("extract-and-save")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> ExtractAndSaveSkills(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized("No user id found in token.");

            var extractedSkills = await _mlService.ExtractSkillsFromCvAsync(file);

            if (extractedSkills.Count == 0)
                return Ok(new { message = "No skills extracted.", count = 0 });

            var existingStudentSkills = await _db.StudentSkills
                .Where(ss => ss.StudentUserId == userId)
                .ToListAsync();

            _db.StudentSkills.RemoveRange(existingStudentSkills);

            foreach (var mlSkill in extractedSkills)
            {
                var normalizedName = mlSkill.skill.Trim().ToLower();

                var existingSkill = await _db.Skills
                    .FirstOrDefaultAsync(s => s.Name.ToLower() == normalizedName);

                Skill skillEntity;

                if (existingSkill == null)
                {
                    skillEntity = new Skill
                    {
                        Name = mlSkill.skill.Trim()
                    };

                    _db.Skills.Add(skillEntity);
                    await _db.SaveChangesAsync();
                }
                else
                {
                    skillEntity = existingSkill;
                }

                var studentSkill = new StudentSkill
                {
                    StudentUserId = userId,
                    SkillId = skillEntity.Id,
                    score = mlSkill.score
                };

                _db.StudentSkills.Add(studentSkill);
            }

            await _db.SaveChangesAsync();

            return Ok(new
            {
                message = "Skills extracted and saved successfully.",
                count = extractedSkills.Count,
                skills = extractedSkills
            });
        }
    }
}