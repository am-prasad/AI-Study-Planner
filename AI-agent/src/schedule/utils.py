import fitz  # PyMuPDF
from pinecone import Pinecone

from src.config import PINECONE_API_KEY, PINECONE_INDEX, PINECONE_NAMESPACE
import re
from io import BytesIO
import pdfplumber
import spacy
from sklearn.feature_extraction.text import TfidfVectorizer

# ---------------------
# 🔹 Initialize Services
# ---------------------
pc = Pinecone(api_key=PINECONE_API_KEY)
index = pc.Index(PINECONE_INDEX)

nlp = spacy.load("en_core_web_sm")


# ------------------------------------------------
# 🔹 Distribute total study hours across N days
# ------------------------------------------------
def distribute_hours(total_hours: float, daily_hours: float, days: int):
    schedule = []
    day = 1
    remaining = total_hours

    while remaining > 0 and day <= days:
        allocated = min(daily_hours, remaining)
        schedule.append((day, allocated))
        remaining -= allocated
        day += 1

    return schedule


# ------------------------------------------------
# 🔹 Extract headings from PDF using font size/bold
# ------------------------------------------------
def extract_pdf_headings(pdf_bytes):
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    headings = []

    for page in doc:
        blocks = page.get_text("dict")["blocks"]
        for b in blocks:
            if "lines" in b:
                for line in b["lines"]:
                    for span in line["spans"]:
                        text = span["text"].strip()

                        # simple heuristic: large or bold text = heading
                        is_large = span["size"] > 12
                        is_bold = span["font"].lower().startswith("bold")

                        if (is_large or is_bold) and len(text) > 3:
                            headings.append(text)

    return list(set(headings))  # remove duplicates

from sklearn.feature_extraction.text import TfidfVectorizer

def extract_keywords_from_pdf_text(text, top_n=30):
    """
    Extract top N keywords based on TF-IDF.
    """
    vectorizer = TfidfVectorizer(
        stop_words="english",
        max_features=top_n,
        ngram_range=(1, 2)
    )
    tfidf_matrix = vectorizer.fit_transform([text])
    keywords = vectorizer.get_feature_names_out()
    return list(keywords)

def extract_full_text(pdf_bytes):
    text = ""
    with pdfplumber.open(BytesIO(pdf_bytes)) as pdf:
        for page in pdf.pages:
            text += page.extract_text() or ""
    return text

def extract_technical_terms(full_text, top_k=40):
    """
    NLP-based technical term extraction using noun phrases + TF-IDF
    """
    doc = nlp(full_text)

    noun_phrases = [chunk.text.lower() for chunk in doc.noun_chunks]

    cleaned = [t for t in noun_phrases if len(t) > 3 and not t.isdigit()]

    vectorizer = TfidfVectorizer(stop_words="english")
    try:
        tfidf = vectorizer.fit_transform(cleaned)
    except ValueError:
        return []  # avoids crash if pdf text is too small

    feature_names = vectorizer.get_feature_names_out()
    scores = tfidf.toarray().sum(axis=0)

    term_scores = sorted(
        zip(feature_names, scores),
        key=lambda x: x[1],
        reverse=True
    )

    technical_terms = [term for term, score in term_scores[:top_k]]
    return technical_terms


# --------------------------
# STEP 3: Difficulty Scoring
# --------------------------
def compute_topic_difficulty(headings, full_text):
    tech_terms = extract_technical_terms(full_text)

    difficulty_scores = {}

    for heading in headings:
        h = heading.lower()

        term_count = sum(1 for t in tech_terms if t in h)

        words = re.findall(r"\w+", h)
        avg_length = sum(len(w) for w in words) / (len(words) + 1)

        score = (term_count * 3) + (avg_length * 0.8)

        difficulty_scores[heading] = round(score, 3)

    return difficulty_scores

# ------------------------------------------------
# 🔹 Embed text using OpenAI
# ------------------------------------------------
import random

def embed_text(text: str):
    # 768-dimensional fake vector to match Pinecone index
    dim = 768
    value = float(len(text)) % 10  # keeps numbers small
    return [value] * dim



# ------------------------------------------------
# 🔹 Store headings in Pinecone
# ------------------------------------------------
def store_headings_in_pinecone(headings: list[str]):
    ids: list[str] = []
    vectors: list[dict] = []

    for i, h in enumerate(headings):
        vec = embed_text(h)  # e.g. list[float] or np.array

        # Skip None or empty embeddings
        if vec is None or len(vec) == 0:
            continue

        # Skip all-zero vectors to avoid Pinecone 400 error
        if not any(v != 0.0 for v in vec):
            continue

        vec_id = f"heading-{i}"
        ids.append(vec_id)

        vectors.append(
            {
                "id": vec_id,
                "values": vec,
                "metadata": {"heading": h},
            }
        )

    if vectors:
        index.upsert(
            vectors=vectors,
            namespace=PINECONE_NAMESPACE,
        )

    return ids
