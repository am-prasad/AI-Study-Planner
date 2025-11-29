import pdfplumber
import os
from typing import List


class PDFReader:
    """
    A simple utility class to extract text from PDF files.

    Features:
    - Reads multi-page PDFs
    - Handles broken/non-standard PDFs using fallback extraction
    - Removes empty lines automatically
    """

    def __init__(self):
        pass

    def read_pdf(self, file_path: str) -> str:
        """
        Reads a PDF and returns extracted text.

        :param file_path: Path to the PDF file
        :return: Extracted text as a single string
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"PDF not found: {file_path}")

        try:
            with pdfplumber.open(file_path) as pdf:
                all_text = []

                for page in pdf.pages:
                    text = page.extract_text()
                    if text:
                        cleaned = self._clean_text(text)
                        all_text.append(cleaned)

                return "\n".join(all_text)

        except Exception as e:
            print(f"[PDFReader] pdfplumber failed. Error: {e}")
            print("[PDFReader] Trying fallback extractor...")

            return self._fallback_extract(file_path)

    def _clean_text(self, text: str) -> str:
        """
        Removes unnecessary empty lines.
        """
        lines = [line.strip() for line in text.split("\n") if line.strip()]
        return "\n".join(lines)

    def _fallback_extract(self, file_path: str) -> str:
        """
        Fallback extractor using PyPDF2 when pdfplumber fails.
        """
        try:
            import PyPDF2

            reader = PyPDF2.PdfReader(file_path)
            text = ""

            for page in reader.pages:
                text += page.extract_text() or ""

            return text

        except Exception as e:
            raise RuntimeError(
                f"Failed to extract text from PDF using both primary and fallback methods: {e}"
            )
