using Jobify.Api.Services.SkillServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Jobify.Api.DTOs;

namespace Jobify.Api.Controllers
{
    [ApiController]
    [Route("api/student")]
    public class StudentCvController : ControllerBase
    {
        private readonly MlSkillClient _mlSkillClient;
        private readonly SkillService _skillService;

        public StudentCvController(MlSkillClient mlSkillClient, SkillService skillService)
        {
            _mlSkillClient = mlSkillClient;
            _skillService = skillService;
        }

        [Authorize(Roles = "Student")]
        [HttpPost("cv/upload")]
        public async Task<IActionResult> UploadCvAndExtractSkills([FromForm] UploadCvRequest request)
        {
            if (request?.File == null || request.File.Length == 0)
                return BadRequest("File is required.");

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized("User not found.");

            // ensure the student profile exists before inserting StudentSkills (FK constraint)
            var hasProfile = await _skillService.StudentProfileExistsAsync(userId);
            if (!hasProfile)
                return BadRequest("Student profile not found. Create your profile first, then upload your CV.");

            // send file to python (python will extract text)
            var skills = await _mlSkillClient.ExtractCvSkillsFromFileAsync(request.File);

            // save to db
            await _skillService.SaveStudentSkillsAsync(userId, skills);

            return Ok(new { skills });
        }
    }
}
