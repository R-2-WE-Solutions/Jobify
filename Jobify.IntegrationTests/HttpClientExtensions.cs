using System.Net.Http;

namespace Jobify.IntegrationTests;

public static class HttpClientExtensions
{
    public static Task<HttpResponseMessage> PatchAsync(
        this HttpClient client,
        string requestUri,
        HttpContent? content)
    {
        var request = new HttpRequestMessage(HttpMethod.Patch, requestUri)
        {
            Content = content
        };

        return client.SendAsync(request);
    }
}