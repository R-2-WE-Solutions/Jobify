using System.Net.Http.Headers;
using System.Text.Json;
using Jobify.Api.DTOs;

namespace Jobify.Api.Services
{
    public class MlExtractionService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;

        public MlExtractionService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;
        }

        public async Task<List<MlSkillDto>> ExtractSkillsFromCvAsync(IFormFile cvFile)
        {
            var baseUrl = _configuration["MlApi:BaseUrl"];
            if (string.IsNullOrEmpty(baseUrl))
                throw new Exception("ML API base URL is missing.");

            using var content = new MultipartFormDataContent();

            using var stream = cvFile.OpenReadStream();
            using var fileContent = new StreamContent(stream);
            fileContent.Headers.ContentType = new MediaTypeHeaderValue(
                cvFile.ContentType ?? "application/octet-stream"
            );

            content.Add(fileContent, "file", cvFile.FileName);

            var response = await _httpClient.PostAsync($"{baseUrl}/extract/cv-file", content);

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                throw new Exception($"ML API error: {error}");
            }

            var json = await response.Content.ReadAsStringAsync();

            var result = JsonSerializer.Deserialize<MlExtractResponseDto>(
                json,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
            );

            return result?.skills ?? new List<MlSkillDto>();
        }
    }
}