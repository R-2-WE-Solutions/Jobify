// SkillService
//
// Purpose:
// - Save ML-extracted skill strings into DB
// - Works for BOTH:
//   (1) Students (CV)  -> StudentSkills
//   (2) Opportunities  -> OpportunitySkills
//

using Jobify.Api.Data;
using Jobify.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Jobify.Api.Services.SkillServices
{
    public class SkillService
    {
        private readonly AppDbContext _db;

        public SkillService(AppDbContext db)
        {
            _db = db;
        }

        // =========================
        // Student profile guard
        // =========================
        public async Task<bool> StudentProfileExistsAsync(string studentUserId)
        {
            if (string.IsNullOrWhiteSpace(studentUserId))
                return false;

            return await _db.StudentProfiles.AnyAsync(p => p.UserId == studentUserId);
        }

        private async Task EnsureStudentProfileExistsAsync(string studentUserId)
        {
            if (!await StudentProfileExistsAsync(studentUserId))
                throw new InvalidOperationException(
                    $"StudentProfile does not exist for userId={studentUserId}. Create StudentProfile first."
                );
        }

        // =========================
        // Skill helper
        // =========================
        private async Task<int> GetOrCreateSkillIdAsync(string skillName)
        {
            var name = (skillName ?? "").Trim();
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Skill name cannot be empty.");

            // Case-insensitive lookup
            var existing = await _db.Skills
                .FirstOrDefaultAsync(s => s.Name.ToLower() == name.ToLower());

            if (existing != null)
                return existing.Id;

            var skill = new Skill { Name = name };
            _db.Skills.Add(skill);

            // ✅ We MUST save here to get skill.Id since you don't have navigation properties
            // This will only save Skill if we ensure we have no pending StudentSkills in the context yet.
            await _db.SaveChangesAsync();

            return skill.Id;
        }

        // =========================
        // Student skills
        // =========================
        public async Task SaveStudentSkillsAsync(string studentUserId, List<string> skills)
        {
            if (string.IsNullOrWhiteSpace(studentUserId))
                throw new ArgumentException("studentUserId is required.");

            skills ??= new List<string>();

            // ✅ FK: StudentSkills.StudentUserId -> StudentProfiles.UserId
            await EnsureStudentProfileExistsAsync(studentUserId);

            // Remove old extracted skills
            var oldExtracted = await _db.StudentSkills
                .Where(ss => ss.StudentUserId == studentUserId && ss.Source == "Extracted")
                .ToListAsync();

            if (oldExtracted.Count > 0)
            {
                _db.StudentSkills.RemoveRange(oldExtracted);
                await _db.SaveChangesAsync(); // safe: deletes only
            }

            // Insert new extracted skills
            foreach (var skillName in skills)
            {
                var name = (skillName ?? "").Trim();
                if (string.IsNullOrWhiteSpace(name))
                    continue;

                // ✅ Get SkillId (creates skill if missing)
                var skillId = await GetOrCreateSkillIdAsync(name);

                // ✅ Now insert StudentSkill (FK-safe because profile exists)
                _db.StudentSkills.Add(new StudentSkill
                {
                    StudentUserId = studentUserId,
                    SkillId = skillId,
                    Source = "Extracted",
                    IsVerified = false,
                    VerifiedBy = null,
                    CreatedAt = DateTime.UtcNow
                });

                // We can save each time (simplest and safe)
                await _db.SaveChangesAsync();
            }
        }

        // =========================
        // Opportunity skills
        // =========================
        public async Task SaveOpportunitySkillsAsync(int opportunityId, List<string> skills)
        {
            if (opportunityId <= 0)
                throw new ArgumentException("opportunityId must be > 0.");

            skills ??= new List<string>();

            var oldLinks = await _db.OpportunitySkills
                .Where(os => os.OpportunityId == opportunityId)
                .ToListAsync();

            if (oldLinks.Count > 0)
            {
                _db.OpportunitySkills.RemoveRange(oldLinks);
                await _db.SaveChangesAsync();
            }

            foreach (var skillName in skills)
            {
                var name = (skillName ?? "").Trim();
                if (string.IsNullOrWhiteSpace(name))
                    continue;

                var skillId = await GetOrCreateSkillIdAsync(name);

                _db.OpportunitySkills.Add(new OpportunitySkill
                {
                    OpportunityId = opportunityId,
                    SkillId = skillId
                });

                await _db.SaveChangesAsync();
            }
        }
    }
}