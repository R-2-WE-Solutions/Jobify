using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Jobify.Api.Controllers;

//later we will add authorization once we add other things 
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly UserManager<IdentityUser> _userManager;

    public UsersController(UserManager<IdentityUser> userManager)
    {
        _userManager = userManager;
    }

    // ✅ GET: /api/users
    // Returns a list of users with basic identity info + roles.
    //
    // Notes:
    // - Useful for admin dashboards, debugging, and internal tooling.
    // - Currently not protected; recommended to secure with [Authorize] or role-based policy.
    //
    // Security recommendation (later):
    // [Authorize(Roles = "Admin")]
    [HttpGet]
    public async Task<IActionResult> GetUsers()
    {
        // Fetch users from Identity store (ordered by email for consistent output)
        var users = await _userManager.Users
            .OrderBy(u => u.Email)
            .ToListAsync();

        // Map IdentityUser -> UserDto to avoid exposing sensitive/internal Identity fields
        var result = new List<UserDto>();

        foreach (var u in users)
        {
            // Retrieve roles for each user (Identity stores roles separately)
            var roles = await _userManager.GetRolesAsync(u);

            result.Add(new UserDto(
                Id: u.Id,
                Email: u.Email ?? "",
                UserName: u.UserName ?? "",
                Roles: roles.ToList()
            ));
        }

        return Ok(result);
    }

    // ✅ GET: /api/users/{id}
    // Returns one user's basic identity info + roles by userId.
    //
    // Notes:
    // - Suitable for user detail pages / admin views.
    // - Currently not protected; recommended to secure and/or restrict access.
    //
    // Security recommendation (later): 
    // [Authorize(Roles = "Admin")]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetUserById(string id)
    {
        // Lookup user by Identity primary key
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return NotFound("User not found.");

        // Fetch roles assigned to this user
        var roles = await _userManager.GetRolesAsync(user);

        // Return a safe DTO (no password hashes or internal fields)
        return Ok(new UserDto(
            Id: user.Id,
            Email: user.Email ?? "",
            UserName: user.UserName ?? "",
            Roles: roles.ToList()
        ));
    }

    // DTO returned to frontend to keep API response clean and safe
    public record UserDto(string Id, string Email, string UserName, List<string> Roles);
}
