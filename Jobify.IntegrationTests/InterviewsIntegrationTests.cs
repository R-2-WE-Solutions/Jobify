using System.Net;
using System.Text;
using Xunit;

namespace Jobify.IntegrationTests;

public class InterviewsIntegrationTests
{
    private static StringContent Json(string body)
        => new(body, Encoding.UTF8, "application/json");

    private static void SetStudent(HttpClient client, string userId = "student-2")
    {
        client.DefaultRequestHeaders.Remove("X-Test-Role");
        client.DefaultRequestHeaders.Remove("X-Test-UserId");
        client.DefaultRequestHeaders.Remove("X-Test-Email");

        client.DefaultRequestHeaders.Add("X-Test-Role", "Student");
        client.DefaultRequestHeaders.Add("X-Test-UserId", userId);
        client.DefaultRequestHeaders.Add("X-Test-Email", $"{userId}@test.com");
    }

    private static void SetRecruiter(HttpClient client, string userId = "recruiter-1")
    {
        client.DefaultRequestHeaders.Remove("X-Test-Role");
        client.DefaultRequestHeaders.Remove("X-Test-UserId");
        client.DefaultRequestHeaders.Remove("X-Test-Email");

        client.DefaultRequestHeaders.Add("X-Test-Role", "Recruiter");
        client.DefaultRequestHeaders.Add("X-Test-UserId", userId);
        client.DefaultRequestHeaders.Add("X-Test-Email", $"{userId}@test.com");
    }

    [Fact]
    public async Task Recruiter_Can_Create_Interview()
    {
        using var factory = new CustomWebApplicationFactory();
        using var client = factory.CreateClient();
        SetRecruiter(client, "recruiter-1");

        var response = await client.PostAsync(
            "/api/Interviews",
            Json("""
            {
              "applicationId": 3,
              "scheduledAtUtc": "2030-01-01T10:00:00Z",
              "meetingLink": "https://meet.test/interview-1",
              "location": "Online",
              "notes": "Bring your resume"
            }
            """));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var json = await response.Content.ReadAsStringAsync();
        Assert.Contains("Interview scheduled successfully", json);
    }

    [Fact]
    public async Task Recruiter_Cannot_Create_Interview_For_NonShortlisted_Application()
    {
        using var factory = new CustomWebApplicationFactory();
        using var client = factory.CreateClient();
        SetRecruiter(client, "recruiter-1");

        var response = await client.PostAsync(
            "/api/Interviews",
            Json("""
            {
              "applicationId": 1,
              "scheduledAtUtc": "2030-01-01T10:00:00Z",
              "meetingLink": "https://meet.test/interview-2",
              "location": "Online",
              "notes": "Should fail"
            }
            """));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Recruiter_Cannot_Create_Interview_For_Other_Recruiter_Application()
    {
        using var factory = new CustomWebApplicationFactory();
        using var client = factory.CreateClient();
        SetRecruiter(client, "recruiter-1");

        var response = await client.PostAsync(
            "/api/Interviews",
            Json("""
            {
              "applicationId": 2,
              "scheduledAtUtc": "2030-01-01T10:00:00Z",
              "meetingLink": "https://meet.test/interview-3",
              "location": "Online",
              "notes": "Should be forbidden"
            }
            """));

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Student_Can_Get_My_Interviews()
    {
        using var factory = new CustomWebApplicationFactory();
        using var recruiterClient = factory.CreateClient();
        SetRecruiter(recruiterClient, "recruiter-1");

        await recruiterClient.PostAsync(
            "/api/Interviews",
            Json("""
            {
              "applicationId": 3,
              "scheduledAtUtc": "2030-01-02T11:00:00Z",
              "meetingLink": "https://meet.test/interview-4",
              "location": "Online",
              "notes": "Student view test"
            }
            """));

        using var studentClient = factory.CreateClient();
        SetStudent(studentClient, "student-2");

        var response = await studentClient.GetAsync("/api/Interviews/my");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var json = await response.Content.ReadAsStringAsync();
        Assert.Contains("Backend Intern", json);
        Assert.Contains("Jobify", json);
    }

    [Fact]
    public async Task Recruiter_Can_Get_Recruiter_Interviews()
    {
        using var factory = new CustomWebApplicationFactory();
        using var recruiterClient = factory.CreateClient();
        SetRecruiter(recruiterClient, "recruiter-1");

        await recruiterClient.PostAsync(
            "/api/Interviews",
            Json("""
            {
              "applicationId": 3,
              "scheduledAtUtc": "2030-01-03T12:00:00Z",
              "meetingLink": "https://meet.test/interview-5",
              "location": "Online",
              "notes": "Recruiter list test"
            }
            """));

        var response = await recruiterClient.GetAsync("/api/Interviews/recruiter");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var json = await response.Content.ReadAsStringAsync();
        Assert.Contains("Backend Intern", json);
        Assert.Contains("Student Two", json);
    }

    [Fact]
    public async Task Recruiter_Can_Update_Interview()
    {
        using var factory = new CustomWebApplicationFactory();
        using var recruiterClient = factory.CreateClient();
        SetRecruiter(recruiterClient, "recruiter-1");

        await recruiterClient.PostAsync(
            "/api/Interviews",
            Json("""
            {
              "applicationId": 3,
              "scheduledAtUtc": "2030-01-04T09:00:00Z",
              "meetingLink": "https://meet.test/interview-6",
              "location": "Online",
              "notes": "Before update"
            }
            """));

        var listResponse = await recruiterClient.GetAsync("/api/Interviews/recruiter");
        var listJson = await listResponse.Content.ReadAsStringAsync();

        var idStart = listJson.IndexOf("\"id\":", StringComparison.OrdinalIgnoreCase);
        Assert.True(idStart >= 0);

        idStart += 5;
        var idEnd = listJson.IndexOfAny(new[] { ',', '}' }, idStart);
        var idText = listJson[idStart..idEnd];
        var interviewId = int.Parse(idText);

        var updateResponse = await recruiterClient.PutAsync(
            $"/api/Interviews/{interviewId}",
            Json("""
            {
              "scheduledAtUtc": "2030-01-05T15:00:00Z",
              "meetingLink": "https://meet.test/interview-6-updated",
              "location": "Office",
              "notes": "Updated interview"
            }
            """));

        Assert.True(
            updateResponse.StatusCode == HttpStatusCode.OK ||
            updateResponse.StatusCode == HttpStatusCode.NoContent);
    }

    [Fact]
    public async Task Recruiter_Can_Delete_Interview()
    {
        using var factory = new CustomWebApplicationFactory();
        using var recruiterClient = factory.CreateClient();
        SetRecruiter(recruiterClient, "recruiter-1");

        await recruiterClient.PostAsync(
            "/api/Interviews",
            Json("""
            {
              "applicationId": 3,
              "scheduledAtUtc": "2030-01-06T14:00:00Z",
              "meetingLink": "https://meet.test/interview-7",
              "location": "Online",
              "notes": "Delete test"
            }
            """));

        var listResponse = await recruiterClient.GetAsync("/api/Interviews/recruiter");
        var listJson = await listResponse.Content.ReadAsStringAsync();

        var idStart = listJson.IndexOf("\"id\":", StringComparison.OrdinalIgnoreCase);
        Assert.True(idStart >= 0);

        idStart += 5;
        var idEnd = listJson.IndexOfAny(new[] { ',', '}' }, idStart);
        var idText = listJson[idStart..idEnd];
        var interviewId = int.Parse(idText);

        var deleteResponse = await recruiterClient.DeleteAsync($"/api/Interviews/{interviewId}");

        Assert.Equal(HttpStatusCode.OK, deleteResponse.StatusCode);
    }

    [Fact]
    public async Task Student_Cannot_Delete_Interview()
    {
        using var factory = new CustomWebApplicationFactory();
        using var recruiterClient = factory.CreateClient();
        SetRecruiter(recruiterClient, "recruiter-1");

        await recruiterClient.PostAsync(
            "/api/Interviews",
            Json("""
            {
              "applicationId": 3,
              "scheduledAtUtc": "2030-01-07T13:00:00Z",
              "meetingLink": "https://meet.test/interview-8",
              "location": "Online",
              "notes": "Student cannot delete"
            }
            """));

        var listResponse = await recruiterClient.GetAsync("/api/Interviews/recruiter");
        var listJson = await listResponse.Content.ReadAsStringAsync();

        var idStart = listJson.IndexOf("\"id\":", StringComparison.OrdinalIgnoreCase);
        Assert.True(idStart >= 0);

        idStart += 5;
        var idEnd = listJson.IndexOfAny(new[] { ',', '}' }, idStart);
        var idText = listJson[idStart..idEnd];
        var interviewId = int.Parse(idText);

        using var studentClient = factory.CreateClient();
        SetStudent(studentClient, "student-2");

        var deleteResponse = await studentClient.DeleteAsync($"/api/Interviews/{interviewId}");

        Assert.Equal(HttpStatusCode.Forbidden, deleteResponse.StatusCode);
    }
}