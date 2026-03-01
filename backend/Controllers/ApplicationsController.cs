using Jobify.Api.Data;
using Jobify.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Jobify.Api.Controllers
{
    [ApiController]
    [Route("api/applications")]
    public class ApplicationsController : ControllerBase
    {
        private readonly AppDbContext _db;

        public ApplicationsController(AppDbContext db)
        {
            _db = db;
        }

        // Student applies to opportunity
        [Authorize(Roles = "Student")]
        [HttpPost]
        public async Task<IActionResult> Apply([FromBody] ApplyDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

            // Make sure opportunity exists
            var oppExists = await _db.Opportunities.AnyAsync(o => o.Id == dto.OpportunityId);
            if (!oppExists) return NotFound("Opportunity not found");

            // Prevent duplicate apply
            var already = await _db.Applications.AnyAsync(a =>
                a.StudentUserId == userId && a.OpportunityId == dto.OpportunityId);

            if (already) return BadRequest("You already applied to this opportunity");

            var app = new Application
            {
                StudentUserId = userId,
                OpportunityId = dto.OpportunityId,
                Status = ApplicationStatus.Pending,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _db.Applications.Add(app);
            await _db.SaveChangesAsync();

            return Ok(new
            {
                app.Id,
                app.OpportunityId,
                Status = app.Status.ToString(),
                app.CreatedAt,
                app.UpdatedAt
            });
        }

        // Student views their applications page
        [Authorize(Roles = "Student")]
        [HttpGet("me")]
        public async Task<IActionResult> MyApplications()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

            var apps = await _db.Applications
                .Where(a => a.StudentUserId == userId)
                .OrderByDescending(a => a.UpdatedAt)
                .Select(a => new
                {
                    a.Id,
                    a.OpportunityId,
                    Status = a.Status.ToString(),
                    a.Note,
                    a.CreatedAt,
                    a.UpdatedAt
                })
                .ToListAsync();

            return Ok(apps);
        }

        // Recruiter/Admin updates status
        [Authorize(Roles = "Recruiter,Admin")]
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusDto dto)
        {
            var app = await _db.Applications.FirstOrDefaultAsync(a => a.Id == id);
            if (app == null) return NotFound("Application not found");

            if (!Enum.TryParse<ApplicationStatus>(dto.Status, true, out var newStatus))
                return BadRequest("Invalid status");

            app.Status = newStatus;
            app.Note = dto.Note;
            app.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            return Ok(new
            {
                app.Id,
                Status = app.Status.ToString(),
                app.Note,
                app.UpdatedAt
            });
        }
    }

    public class ApplyDto
    {
        public int OpportunityId { get; set; }
    }

    public class UpdateStatusDto
    {
        public string Status { get; set; } = "Pending";
        public string? Note { get; set; }
    }
}