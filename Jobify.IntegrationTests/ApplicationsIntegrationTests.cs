using System.Net;
using System.Net.Http;
using System.Text;
using Xunit;

namespace Jobify.IntegrationTests;

public class ApplicationsIntegrationTests
{
    private HttpClient CreateClient()
    {
        var factory = new CustomWebApplicationFactory();
        return factory.CreateClient();
    }

    private static StringContent Json(string body)
        => new(body, Encoding.UTF8, "application/json");

    private static void SetStudent(HttpClient client, string userId = "student-1")
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

    private static void SetAdmin(HttpClient client, string userId = "admin-1")
    {
        client.DefaultRequestHeaders.Remove("X-Test-Role");
        client.DefaultRequestHeaders.Remove("X-Test-UserId");
        client.DefaultRequestHeaders.Remove("X-Test-Email");

        client.DefaultRequestHeaders.Add("X-Test-Role", "Admin");
        client.DefaultRequestHeaders.Add("X-Test-UserId", userId);
        client.DefaultRequestHeaders.Add("X-Test-Email", $"{userId}@test.com");
    }

    // =============================
    // STUDENT FLOW
    // =============================

    [Fact]
    public async Task Get_My_Applications_Returns_List()
    {
        using var client = CreateClient();
        SetStudent(client, "student-1");

        var response = await client.GetAsync("/api/Application/me");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var json = await response.Content.ReadAsStringAsync();
        Assert.Contains("Backend Intern", json);
        Assert.Contains("Submitted", json);
    }

    [Fact]
    public async Task Get_My_Application_Returns_OK()
    {
        using var client = CreateClient();
        SetStudent(client, "student-1");

        var response = await client.GetAsync("/api/Application/1");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var json = await response.Content.ReadAsStringAsync();
        Assert.Contains("\"applicationId\":1", json);
        Assert.Contains("\"opportunityId\":1", json);
        Assert.Contains("Submitted", json);
    }

    [Fact]
    public async Task Get_My_Application_For_Other_Student_Returns_NotFound()
    {
        using var client = CreateClient();
        SetStudent(client, "student-2");

        var response = await client.GetAsync("/api/Application/1");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Get_Application_Summary_Returns_OK()
    {
        using var client = CreateClient();
        SetStudent(client, "student-1");

        var response = await client.GetAsync("/api/Application/1/summary");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var json = await response.Content.ReadAsStringAsync();
        Assert.Contains("Jobify", json);
        Assert.Contains("Backend Intern", json);
    }

    [Fact]
    public async Task Withdraw_Application_Returns_OK()
    {
        using var client = CreateClient();
        SetStudent(client, "student-1");

        var response = await client.PostAsync("/api/Application/1/withdraw", null);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var json = await response.Content.ReadAsStringAsync();
        Assert.Contains("Withdrawn", json);
    }

    [Fact]
    public async Task Withdraw_Application_Twice_Returns_BadRequest()
    {
        using var client = CreateClient();
        SetStudent(client, "student-1");

        await client.PostAsync("/api/Application/1/withdraw", null);
        var response = await client.PostAsync("/api/Application/1/withdraw", null);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    // Assesment flow

    [Fact]
    public async Task Start_Assessment_Returns_OK()
    {
        using var client = CreateClient();
        SetStudent(client, "student-1");

        var response = await client.PostAsync(
            "/api/Application/1/assessment/start",
            Json("""{"webcamConsent":true}"""));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var json = await response.Content.ReadAsStringAsync();
        Assert.Contains("attemptId", json);
    }

    [Fact]
    public async Task Save_Assessment_Returns_NoContent()
    {
        using var client = CreateClient();
        SetStudent(client, "student-1");

        await client.PostAsync(
            "/api/Application/1/assessment/start",
            Json("""{"webcamConsent":true}"""));

        var response = await client.PutAsync(
            "/api/Application/1/assessment",
            Json("""{"answers":{"mcq-1":1}}"""));

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task Submit_Assessment_Returns_OK_And_Score()
    {
        using var client = CreateClient();
        SetStudent(client, "student-1");

        await client.PostAsync(
            "/api/Application/1/assessment/start",
            Json("""{"webcamConsent":true}"""));

        await client.PutAsync(
            "/api/Application/1/assessment",
            Json("""{"answers":{"mcq-1":1}}"""));

        var response = await client.PostAsync("/api/Application/1/assessment/submit", null);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var json = await response.Content.ReadAsStringAsync();
        Assert.Contains("Submitted", json);
        Assert.Contains("finalScore", json);
    }

    [Fact]
    public async Task Reset_Assessment_Returns_OK()
    {
        using var client = CreateClient();
        SetStudent(client, "student-1");

        await client.PostAsync(
            "/api/Application/1/assessment/start",
            Json("""{"webcamConsent":true}"""));

        var response = await client.PostAsync("/api/Application/1/assessment/reset", null);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var json = await response.Content.ReadAsStringAsync();
        Assert.Contains("reset", json);
    }

    // Recruiter flow

    [Fact]
    public async Task Recruiter_Can_Get_Applications_For_Opportunity()
    {
        using var client = CreateClient();
        SetRecruiter(client, "recruiter-1");

        var response = await client.GetAsync("/api/Application/recruiter/opportunity/1");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var json = await response.Content.ReadAsStringAsync();
        Assert.Contains("Student One", json);
        Assert.Contains("Submitted", json);
    }

    [Fact]
    public async Task Recruiter_Cannot_Get_Other_Recruiter_Applications()
    {
        using var client = CreateClient();
        SetRecruiter(client, "recruiter-2");

        var response = await client.GetAsync("/api/Application/recruiter/opportunity/1");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Recruiter_Can_Update_Status()
    {
        using var client = CreateClient();
        SetRecruiter(client, "recruiter-1");

        var response = await client.PatchAsync(
            "/api/Application/1/status",
            Json("""{"status":"InReview","note":"Looks promising","sendEmail":false}"""));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var json = await response.Content.ReadAsStringAsync();
        Assert.Contains("InReview", json);
    }

    [Fact]
    public async Task Recruiter_Can_Update_Application_From_Recruiter_Endpoint()
    {
        using var client = CreateClient();
        SetRecruiter(client, "recruiter-1");

        var response = await client.PatchAsync(
            "/api/Application/1/recruiter",
            Json("""{"status":"InReview","note":"Reviewed by recruiter"}"""));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var json = await response.Content.ReadAsStringAsync();
        Assert.Contains("InReview", json);
        Assert.Contains("Reviewed by recruiter", json);
    }

    [Fact]
    public async Task Recruiter_Can_Get_Application_With_Profile()
    {
        using var client = CreateClient();
        SetRecruiter(client, "recruiter-1");

        var response = await client.GetAsync("/api/Application/recruiter/1");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var json = await response.Content.ReadAsStringAsync();
        Assert.Contains("Student One", json);
        Assert.Contains("student1@jobify.com", json);
        Assert.Contains("Backend Intern", json);
    }

    [Fact]
    public async Task Recruiter_Can_Get_Company_Applications()
    {
        using var client = CreateClient();
        SetRecruiter(client, "recruiter-1");

        var response = await client.GetAsync("/api/Application/recruiter/applications");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var json = await response.Content.ReadAsStringAsync();
        Assert.Contains("Backend Intern", json);
        Assert.DoesNotContain("Frontend Intern", json);
    }

    // Admin flow

    [Fact]
    public async Task Admin_Can_Get_Applications_By_Student()
    {
        using var client = CreateClient();
        SetAdmin(client, "admin-1");

        var response = await client.GetAsync("/api/Application/by-student/student-1");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var json = await response.Content.ReadAsStringAsync();
        Assert.Contains("Backend Intern", json);
        Assert.Contains("Jobify", json);
    }
}
