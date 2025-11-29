from fastapi import APIRouter, UploadFile, File, Form
from .schemas import ScheduleRequest, ScheduleResponse
from .generator import generate_schedule_from_headings, generate_schedule
from src.schedule.utils import (
    extract_pdf_headings,
    extract_full_text,
    compute_topic_difficulty,
    store_headings_in_pinecone,
)

router = APIRouter(prefix="/schedule", tags=["Schedule"])


@router.post("/", response_model=ScheduleResponse)
def create_schedule(req: ScheduleRequest):
    schedule = generate_schedule(
        topics=req.topics,
        daily_hours=req.daily_hours,
        days=req.days,
    )
    return schedule


@router.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...), total_hours: float = Form(...)):
    if not file.filename.endswith(".pdf"):
        return {"error": "Please upload a PDF file"}

    pdf_bytes = await file.read()

    # 1. Extract headings
    headings = extract_pdf_headings(pdf_bytes)

    # 2. Extract full text and compute difficulty
    full_text = extract_full_text(pdf_bytes)
    difficulty_scores = compute_topic_difficulty(headings, full_text)

    # 3. Store in Pinecone
    ids = store_headings_in_pinecone(headings)

    # 4. Generate study schedule using difficulty
    schedule = generate_schedule_from_headings(
        headings=headings,
        total_hours=total_hours,
        difficulty_scores=difficulty_scores,  # adjust signature accordingly
    )

    return {
        "message": "PDF processed successfully!",
        "headings_extracted": headings,
        "pinecone_ids": ids,
        "generated_schedule": schedule,
    }
