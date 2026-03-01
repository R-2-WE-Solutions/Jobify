namespace Jobify.Api.DTOs;

public class UploadCvRequest
{
    public IFormFile File {get; set;} = default!;
}