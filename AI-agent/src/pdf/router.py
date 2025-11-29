from fastapi import APIRouter, UploadFile, File
from .pdf_service import PDFService
from src.preprocessing.embedding_service import EmbeddingService
from src.schedule.generator import ScheduleGenerator
from src.config import PINECONE_INDEX

router = APIRouter()

@router.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    temp_path = f"temp/{file.filename}"
    with open(temp_path, "wb") as buffer:
        buffer.write(await file.read())

    # Step 1: Extract headings
    headings = PDFService.extract_headings(temp_path)

    # Step 2: Embed headings
    embeddings = EmbeddingService.embed_text(headings)

    # Step 3: Store in Pinecone
    vectors = []
    for i, h in enumerate(headings):
        vectors.append({
            "id": f"{file.filename}-{i}",
            "values": embeddings[i],
            "metadata": {
                "pdf": file.filename,
                "heading": h
            }
        })

    PINECONE_INDEX.upsert(vectors)

    # Step 4: Convert headings to topic format
    topics = [
        {"name": h, "hours_required": 2}
        for h in headings
    ]

    # Step 5: Generate schedule
    schedule = ScheduleGenerator.create_schedule(
        topics=topics,
        daily_hours=3,
        days=7
    )

    return {
        "pdf": file.filename,
        "headings_stored": len(headings),
        "headings": headings,
        "schedule": schedule
    }
