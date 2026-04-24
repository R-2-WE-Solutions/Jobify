using System.Security.Claims;
using Jobify.Api.Data;
using Jobify.Api.Services.Dashboard;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Jobify.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;
        private readonly AppDbContext _context;

        public DashboardController(IDashboardService dashboardService, AppDbContext context)
        {
            _dashboardService = dashboardService;
            _context = context;
        }

        [Authorize]
        [HttpGet("candidate")]
        public async Task<IActionResult> GetCandidateDashboard()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized(new { message = "User ID not found in token." });

            var dashboard = await _dashboardService.GetCandidateDashboardAsync(userId);

            if (dashboard == null)
                return NotFound(new { message = "Candidate profile not found." });

            return Ok(dashboard);
        }

        [AllowAnonymous]
        [HttpGet("public-stats")]
        public async Task<IActionResult> GetPublicStats()
        {
            var candidates = await _context.Users
                .Join(_context.UserRoles, u => u.Id, ur => ur.UserId, (u, ur) => new { u, ur })
                .Join(_context.Roles, x => x.ur.RoleId, r => r.Id, (x, r) => new { x.u, r })
                .CountAsync(x => x.r.Name == "Student");

            var opportunities = await _context.Opportunities
                .CountAsync(o => !o.IsClosed);

            var organizations = await _context.RecruiterProfiles.CountAsync();

            return Ok(new { candidates, opportunities, organizations });
        }
    }
}