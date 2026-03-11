using Tesseract;

namespace Jobify.Api.Services
{
    public class UniversityProofOcrService
    {
        private readonly IWebHostEnvironment _env;

        public UniversityProofOcrService(IWebHostEnvironment env)
        {
            _env = env;
        }

        public string ExtractText(string imagePath)
        {
            var tessdataPath = Path.Combine(_env.ContentRootPath, "tessdata");

            using var engine = new TesseractEngine(tessdataPath, "eng", EngineMode.Default);
            using var img = Pix.LoadFromFile(imagePath);
            using var page = engine.Process(img);

            return page.GetText();
        }
    }
}