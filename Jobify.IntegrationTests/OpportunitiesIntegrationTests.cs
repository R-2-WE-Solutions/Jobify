using System.Net;
using System.Net.Http;
using Xunit;

namespace Jobify.IntegrationTests;

public class OpportunitiesIntegrationTests
{
    private HttpClient CreateClient()
    {
        var factory = new CustomWebApplicationFactory();
        return factory.CreateClient();
    }

    private static void SetStudent(HttpClient client)
    {
        client.DefaultRequestHeaders.Remove("X-Test-Role");
        client.DefaultRequestHeaders.Remove("X-Test-UserId");
        client.DefaultRequestHeaders.Remove("X-Test-Email");

        client.DefaultRequestHeaders.Add("X-Test-Role", "Student");
        client.DefaultRequestHeaders.Add("X-Test-UserId", "student-1");
        client.DefaultRequestHeaders.Add("X-Test-Email", "student1@test.com");
    }

    private static void SetRecruiter(HttpClient client, string userId = "recruiter-1")
    {
        client.DefaultRequestHeaders.Remove("X-Test-Role");
        client.DefaultRequestHeaders.Remove("X-Test-UserId");
        client.DefaultRequestHeaders.Remove("X-Test-Email");

        client.DefaultRequestHeaders.Add("X-Test-Role", "Recruiter");
        client.DefaultRequestHeaders.Add("X-Test-UserId", userId);
        client.DefaultRequestHeaders.Add("X-Test-Email", "recruiter@test.com");
    }

    [Fact]
    public async Task Get_Opportunities_Returns_OK()
    {
        using var client = CreateClient();
        SetStudent(client);

        var response = await client.GetAsync("/api/Opportunities");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Get_Opportunities_Returns_Open_Seeded_Data_Only()
    {
        using var client = CreateClient();
        SetStudent(client);

        var response = await client.GetAsync("/api/Opportunities");
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadAsStringAsync();

        Assert.Contains("Backend Intern", json);
        Assert.Contains("Frontend Intern", json);
        Assert.Contains("Data Intern", json);
        Assert.DoesNotContain("Closed Role", json);
    }

    [Fact]
    public async Task Get_Opportunity_By_Id_Returns_OK()
    {
        using var client = CreateClient();
        SetStudent(client);

        var response = await client.GetAsync("/api/Opportunities/1");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var json = await response.Content.ReadAsStringAsync();
        Assert.Contains("Backend Intern", json);
        Assert.Contains("Jobify", json);
    }

    [Fact]
    public async Task Get_Opportunity_By_Id_Returns_NotFound()
    {
        using var client = CreateClient();
        SetStudent(client);

        var response = await client.GetAsync("/api/Opportunities/999");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Get_Opportunities_By_Company_Returns_Only_Open_Jobify_Roles()
    {
        using var client = CreateClient();
        SetStudent(client);

        var response = await client.GetAsync("/api/Opportunities/company/Jobify");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var json = await response.Content.ReadAsStringAsync();
        Assert.Contains("Backend Intern", json);
        Assert.Contains("Data Intern", json);
        Assert.DoesNotContain("Frontend Intern", json);
        Assert.DoesNotContain("Closed Role", json);
    }

    [Fact]
    public async Task Apply_Now_Creates_Draft_Application()
    {
        using var client = CreateClient();
        SetStudent(client);

        var response = await client.PostAsync("/api/Opportunities/4/apply", null);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var json = await response.Content.ReadAsStringAsync();
        Assert.Contains("Draft", json);
    }

    [Fact]
    public async Task Apply_Twice_Returns_Existing_Application()
    {
        using var client = CreateClient();
        SetStudent(client);

        var first = await client.PostAsync("/api/Opportunities/4/apply", null);
        var second = await client.PostAsync("/api/Opportunities/4/apply", null);

        Assert.Equal(HttpStatusCode.OK, first.StatusCode);
        Assert.Equal(HttpStatusCode.OK, second.StatusCode);

        var firstJson = await first.Content.ReadAsStringAsync();
        var secondJson = await second.Content.ReadAsStringAsync();

        Assert.Contains("Draft", firstJson);
        Assert.Contains("Draft", secondJson);
    }

    [Fact]
    public async Task Save_Opportunity_Returns_OK()
    {
        using var client = CreateClient();
        SetStudent(client);

        var response = await client.PostAsync("/api/Opportunities/1/save", null);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Save_Opportunity_Twice_Returns_BadRequest()
    {
        using var client = CreateClient();
        SetStudent(client);

        await client.PostAsync("/api/Opportunities/1/save", null);
        var response = await client.PostAsync("/api/Opportunities/1/save", null);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Unsave_Opportunity_Returns_OK()
    {
        using var client = CreateClient();
        SetStudent(client);

        await client.PostAsync("/api/Opportunities/1/save", null);
        var response = await client.DeleteAsync("/api/Opportunities/1/save");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Get_Saved_Opportunities_Returns_Saved_Items()
    {
        using var client = CreateClient();
        SetStudent(client);

        await client.PostAsync("/api/Opportunities/1/save", null);
        var response = await client.GetAsync("/api/Opportunities/saved");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var json = await response.Content.ReadAsStringAsync();
        Assert.Contains("Backend Intern", json);
    }

    [Fact]
    public async Task Get_Saved_Ids_Returns_Opportunity_Id()
    {
        using var client = CreateClient();
        SetStudent(client);

        await client.PostAsync("/api/Opportunities/1/save", null);
        var response = await client.GetAsync("/api/Opportunities/saved/ids");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var json = await response.Content.ReadAsStringAsync();
        Assert.Contains("1", json);
    }

    [Fact]
    public async Task Recruiter_Cannot_Save_Opportunity()
    {
        using var client = CreateClient();
        SetRecruiter(client);

        var response = await client.PostAsync("/api/Opportunities/1/save", null);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Student_Cannot_Close_Opportunity()
    {
        using var client = CreateClient();
        SetStudent(client);

        var request = new HttpRequestMessage(HttpMethod.Patch, "/api/Opportunities/1/close");
        var response = await client.SendAsync(request);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Recruiter_Can_Close_Opportunity()
    {
        using var client = CreateClient();
        SetRecruiter(client, "recruiter-1");

        var request = new HttpRequestMessage(HttpMethod.Patch, "/api/Opportunities/1/close");
        var response = await client.SendAsync(request);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task Recruiter_Can_Reopen_Opportunity()
    {
        using var client = CreateClient();
        SetRecruiter(client, "recruiter-1");

        await client.SendAsync(new HttpRequestMessage(HttpMethod.Patch, "/api/Opportunities/1/close"));

        var reopenRequest = new HttpRequestMessage(HttpMethod.Patch, "/api/Opportunities/1/reopen");
        var response = await client.SendAsync(reopenRequest);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task Get_My_Listings_Returns_Recruiter_Listings()
    {
        using var client = CreateClient();
        SetRecruiter(client, "recruiter-1");

        var response = await client.GetAsync("/api/Opportunities/my");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var json = await response.Content.ReadAsStringAsync();
        Assert.Contains("Backend Intern", json);
        Assert.Contains("Closed Role", json);
        Assert.Contains("Data Intern", json);
        Assert.DoesNotContain("Frontend Intern", json);
    }
}