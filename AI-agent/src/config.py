import os
from dotenv import load_dotenv

load_dotenv()

# 🔥 OpenAI API Key


# 🔥 Pinecone API Key + Index Name
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_INDEX = os.getenv("PINECONE_INDEX_NAME")  # example: "study-planner-index"

# Default namespace for embeddings
PINECONE_NAMESPACE = "pdf-headings"
