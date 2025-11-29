import fitz  # PyMuPDF

class PDFService:

    @staticmethod
    def extract_headings(pdf_path):
        doc = fitz.open(pdf_path)
        headings = []

        for page in doc:
            blocks = page.get_text("dict")["blocks"]
            for block in blocks:
                if "lines" in block:
                    for line in block["lines"]:
                        for span in line["spans"]:
                            if span["size"] > 12:  # simple heading detection
                                headings.append(span["text"])

        # remove duplicates
        return list(dict.fromkeys(headings))
