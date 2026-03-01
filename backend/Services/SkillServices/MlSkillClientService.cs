using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Http;

namespace Jobify.Api.Services.SkillServices
{
    public class MlSkillClient
    {
        private readonly HttpClient _httpClient;

        public MlSkillClient(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        // ============================
        // Extract skills from CV text
        // ============================
        public async Task<List<string>> ExtractCvSkillsAsync(string cvText)
        {
            var response = await _httpClient.PostAsJsonAsync(
                "/extract/cv",
                new { text = cvText }
            );

            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<SkillResponse>();
            return result?.Skills ?? new List<string>();
        }

        // ============================
        // Extract skills from CV file
        // ============================
        public async Task<List<string>> ExtractCvSkillsFromFileAsync(IFormFile file)
        {
            using var form = new MultipartFormDataContent();

            using var stream = file.OpenReadStream();
            using var fileContent = new StreamContent(stream);

            fileContent.Headers.ContentType =
                new MediaTypeHeaderValue(file.ContentType);

            // must match FastAPI parameter name
            form.Add(fileContent, "file", file.FileName);

            var response = await _httpClient.PostAsync(
                "/extract/cv-file",
                form
            );

            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<SkillResponse>();
            return result?.Skills ?? new List<string>();
        }

        // ============================
        // Extract opportunity skills
        // ============================
        public async Task<List<string>> ExtractOpportunitySkillsAsync(
            string description,
            string? requirements)
        {
            var response = await _httpClient.PostAsJsonAsync(
                "/extract/opportunity",
                new { description, requirements }
            );

            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<SkillResponse>();
            return result?.Skills ?? new List<string>();
        }

        private class SkillResponse
        {
            public List<string> Skills { get; set; } = new();
        }
    }
}