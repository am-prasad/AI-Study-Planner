import os
from dotenv import load_dotenv
from pinecone import Pinecone, ServerlessSpec
from sentence_transformers import SentenceTransformer

# Load environment variables
load_dotenv()

class EmbeddingService:
    def __init__(self):
        # Load keys from .env
        self.api_key = os.getenv("PINECONE_API_KEY")
        self.index_name = os.getenv("PINECONE_INDEX_NAME", "syllabus-index")
        self.environment = os.getenv("PINECONE_ENVIRONMENT", "us-east-1")

        if not self.api_key:
            raise ValueError("❌ PINECONE_API_KEY is missing in .env")

        # Initialize embedding model
        self.embedding_model = SentenceTransformer("sentence-transformers/all-mpnet-base-v2")

        # Initialize Pinecone client
        self.pc = Pinecone(api_key=self.api_key)

        # Create index if not exists
        self._setup_index()

        # Connect to the index
        self.index = self.pc.Index(self.index_name)

    # ----------- Create Index If Missing ---------------
    def _setup_index(self):

        existing_indexes = [i["name"] for i in self.pc.list_indexes()]

        # If index already exists → skip creation
        if self.index_name in existing_indexes:
            print(f"✅ Using existing Pinecone index: {self.index_name}")
            return

        # Define index
        print(f"🛠 Creating Pinecone index: {self.index_name} ...")

        self.pc.create_index(
            name=self.index_name,
            dimension=768,   # SentenceTransformer mpnet-base-v2 → 768 dim
            metric="cosine",
            spec=ServerlessSpec(
                cloud="aws",
                region="us-east-1"
            )
        )

        print("✅ Index created successfully!")

    # ----------- Create Embeddings ---------------
    def embed_text(self, text: str):
        if not text.strip():
            return None

        embedding = self.embedding_model.encode(text).tolist()
        return embedding

    # ----------- Insert into Pinecone ------------
    def upsert_chunk(self, chunk_id: str, text: str):
        vector = self.embed_text(text)

        if vector is None:
            print("⚠️ Empty text chunk skipped")
            return

        self.index.upsert([
            {"id": chunk_id, "values": vector, "metadata": {"text": text}}
        ])

        print(f"📌 Upserted chunk → {chunk_id}")

    # ----------- Semantic Search -----------------
    def search(self, query: str, top_k=5):
        query_vector = self.embed_text(query)

        results = self.index.query(
            vector=query_vector,
            top_k=top_k,
            include_metadata=True
        )

        return results
