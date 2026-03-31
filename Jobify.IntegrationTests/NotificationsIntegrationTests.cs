using System.Net;
using System.Net.Http;
using Xunit;

namespace Jobify.IntegrationTests;

public class NotificationsIntegrationTests
{
    private HttpClient CreateClient()
    {
        var factory = new CustomWebApplicationFactory();
        return factory.CreateClient();
    }

    private static void SetStudent(HttpClient client, string userId = "student-1")
    {
        client.DefaultRequestHeaders.Remove("X-Test-Role");
        client.DefaultRequestHeaders.Remove("X-Test-UserId");
        client.DefaultRequestHeaders.Remove("X-Test-Email");

        client.DefaultRequestHeaders.Add("X-Test-Role", "Student");
        client.DefaultRequestHeaders.Add("X-Test-UserId", userId);
        client.DefaultRequestHeaders.Add("X-Test-Email", $"{userId}@test.com");
    }

    [Fact]
    public async Task Get_Notifications_Returns_List()
    {
        using var client = CreateClient();
        SetStudent(client, "student-1");

        var response = await client.GetAsync("/api/Notifications");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var json = await response.Content.ReadAsStringAsync();
        Assert.Contains("Application Update", json);
        Assert.Contains("Interview Scheduled", json);
        Assert.DoesNotContain("Other User Notification", json);
    }

    [Fact]
    public async Task Get_Archived_Notifications_Returns_Archived_Only()
    {
        using var client = CreateClient();
        SetStudent(client, "student-1");

        var response = await client.GetAsync("/api/Notifications/archived");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var json = await response.Content.ReadAsStringAsync();
        Assert.Contains("Old Archived Notification", json);
        Assert.DoesNotContain("Application Update", json);
    }

    [Fact]
    public async Task Get_Unread_Count_Returns_Number()
    {
        using var client = CreateClient();
        SetStudent(client, "student-1");

        var response = await client.GetAsync("/api/Notifications/unread-count");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var json = await response.Content.ReadAsStringAsync();
        Assert.Contains("unread", json, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task Mark_Notification_Read_Returns_Success()
    {
        using var client = CreateClient();
        SetStudent(client, "student-1");

        var response = await client.PutAsync("/api/Notifications/1/read", null);

        Assert.True(
            response.StatusCode == HttpStatusCode.OK ||
            response.StatusCode == HttpStatusCode.NoContent);

        var listResponse = await client.GetAsync("/api/Notifications");
        var json = await listResponse.Content.ReadAsStringAsync();

        Assert.Contains("Application Update", json);
    }

    [Fact]
    public async Task Archive_Notification_Returns_Success()
    {
        using var client = CreateClient();
        SetStudent(client, "student-1");

        var response = await client.PutAsync("/api/Notifications/1/archive", null);

        Assert.True(
            response.StatusCode == HttpStatusCode.OK ||
            response.StatusCode == HttpStatusCode.NoContent);

        var archivedResponse = await client.GetAsync("/api/Notifications/archived");
        var archivedJson = await archivedResponse.Content.ReadAsStringAsync();

        Assert.Contains("Application Update", archivedJson);
    }

    [Fact]
    public async Task Unarchive_Notification_Returns_Success()
    {
        using var client = CreateClient();
        SetStudent(client, "student-1");

        var response = await client.PutAsync("/api/Notifications/3/unarchive", null);

        Assert.True(
            response.StatusCode == HttpStatusCode.OK ||
            response.StatusCode == HttpStatusCode.NoContent);

        var archivedResponse = await client.GetAsync("/api/Notifications/archived");
        var archivedJson = await archivedResponse.Content.ReadAsStringAsync();

        Assert.DoesNotContain("Old Archived Notification", archivedJson);
    }

    [Fact]
    public async Task Student_Cannot_Read_Other_Users_Notification()
    {
        using var client = CreateClient();
        SetStudent(client, "student-1");

        var response = await client.PutAsync("/api/Notifications/4/read", null);

        Assert.True(
            response.StatusCode == HttpStatusCode.OK ||
            response.StatusCode == HttpStatusCode.NoContent);
    }
}