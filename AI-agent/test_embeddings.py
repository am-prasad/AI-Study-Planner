from src.preprocessing.embedding_service import EmbeddingService

service = EmbeddingService()

service.upsert_chunk("1", "Photosynthesis is the process by which plants make food.")
print(service.search("How do plants make food?"))
