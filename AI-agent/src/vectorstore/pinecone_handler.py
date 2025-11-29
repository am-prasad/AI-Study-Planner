from .pinecone_client import index
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")

def embed(text):
    return model.encode(text).tolist()

def store_sections(sections: list):
    vectors = []

    for i, sec in enumerate(sections):
        vectors.append({
            "id": f"sec-{i}",
            "values": embed(sec),
            "metadata": {"text": sec}
        })

    index.upsert(vectors=vectors)
    return True

def search(query: str, top_k: int = 5):
    query_vec = embed(query)

    results = index.query(
        vector=query_vec,
        top_k=top_k,
        include_metadata=True
    )

    return [m["metadata"]["text"] for m in results["matches"]]
