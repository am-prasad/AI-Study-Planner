# ai/preprocessing/text_chunker.py
"""
Splits cleaned text into small, meaningful chunks
for better embedding + retrieval quality.
"""

def chunk_text(text, chunk_size=300, overlap=50):
    """
    Splits text into chunks with overlap.

    Args:
        text (str): Full cleaned text.
        chunk_size (int): Size of each chunk in words.
        overlap (int): Number of words overlapped between chunks.

    Returns:
        list: List of text chunks.
    """

    words = text.split()
    chunks = []

    start = 0
    end = chunk_size

    while start < len(words):
        chunk_words = words[start:end]
        chunk = " ".join(chunk_words).strip()

        if chunk:
            chunks.append(chunk)

        # move pointer with overlap
        start = end - overlap
        end = start + chunk_size

    return chunks


if __name__ == "__main__":
    sample_text = "This is a sample text to test chunking logic. " * 20
    chunks = chunk_text(sample_text)
    print(f"Generated {len(chunks)} chunks")
