import re, os, pypandoc, pdfplumber

# clean extracted text from docx and pdfs
def clean_cv_text(text):
    # Convert all text to lowercase
    text = text.lower()  

    # Replace multiple consecutive newlines with a single newline
    text = re.sub(r'\n+', '\n', text)  
    
    # Keep line breaks, only normalize spaces/tabs
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{2,}", "\n", text) 

    # Remove page number artifacts commonly found in CV footers
    text = re.sub(r'page \d+ of \d+', '', text)  

    # Remove bullet characters and long dashes
    text = re.sub(r'[•●▪■–—]', ' ', text)  

    # Remove leading and trailing whitespace before sending text to the ML model
    return text.strip()  



# transform input from docx to text
def docx_to_text(filepath):
    try:
        # if pandoc isn't installed/visible, this will raise
        _ = pypandoc.get_pandoc_path()
        return pypandoc.convert_file(filepath, to="plain")
    except OSError as e:
        # pandoc not installed / not in PATH
        raise RuntimeError(
            "Pandoc executable not found. Install pandoc or run pypandoc.download_pandoc()."
        ) from e
    except RuntimeError as e:
        # pandoc ran but failed (bad file, exit code, etc.)
        raise RuntimeError(f"Pandoc conversion failed for: {filepath}. Error: {e}") from e

# transform input from pdf to text
def pdf_to_text(filepath):
    text = ""

    with pdfplumber.open(filepath) as pdf:
        for page in pdf.pages:
            text += page.extract_text() or ""

    return text

# exctract text from input (docx/pdf/txt)
def extract_text(filepath):
    type = os.path.splitext(filepath)[1].lower()

    if type=='.docx':
        return clean_cv_text(docx_to_text(filepath))
    
    elif type=='.pdf':
        return clean_cv_text(pdf_to_text(filepath))
    
    elif type=='.txt':
        with open(filepath, "r", encoding="utf-8") as f:
            return clean_cv_text(f.read())
    
    else:
        raise ValueError(f"Unsupported '{type}' file type.")
    
