import re
from typing import List


class TextCleaner:
    """
    Performs all text normalization steps:
    - Removes special characters
    - Normalizes whitespace
    - Fixes bullet points
    - Removes page numbers
    - Removes multiple blank lines
    - Converts text into clean paragraphs
    """

    def __init__(self):
        pass

    def clean(self, text: str) -> str:
        """
        Main cleaning function.
        """
        if not text or len(text.strip()) == 0:
            return ""

        text = self._remove_page_numbers(text)
        text = self._fix_bullets(text)
        text = self._remove_weird_symbols(text)
        text = self._normalize_spaces(text)
        text = self._remove_multiple_newlines(text)

        return text.strip()

    # ----------------------------------------------------
    # Cleaning utilities
    # ----------------------------------------------------

    def _remove_page_numbers(self, text: str) -> str:
        """
        Removes standalone page numbers like:
        'Page 1', '1', '-1-', '1 / 10'
        """
        patterns = [
            r"\bPage\s*\d+\b",
            r"^\s*\d+\s*$",
            r"^\s*-\d+-\s*$",
            r"^\s*\d+\s*/\s*\d+\s*$"
        ]

        for pattern in patterns:
            text = re.sub(pattern, "", text, flags=re.MULTILINE)

        return text

    def _fix_bullets(self, text: str) -> str:
        """
        Standardizes bullet points:
        •, -, –, *, →  become '-'
        """
        bullet_symbols = r"[•\*\-\–\●\▪\→]"
        return re.sub(bullet_symbols, "-", text)

    def _remove_weird_symbols(self, text: str) -> str:
        """
        Removes non-text symbols but keeps useful characters.
        """
        text = re.sub(r"[^\w\s\.\,\-\:\;\(\)\[\]\/]", " ", text)
        return text

    def _normalize_spaces(self, text: str) -> str:
        """
        Fixes spacing issues like:
        - double spaces
        - missing spaces after punctuation
        """
        text = re.sub(r"\s{2,}", " ", text)
        text = re.sub(r"\.(?=[A-Za-z])", ". ", text)
        return text

    def _remove_multiple_newlines(self, text: str) -> str:
        """
        Converts long blank spaces to a single newline.
        """
        return re.sub(r"\n{2,}", "\n", text)
