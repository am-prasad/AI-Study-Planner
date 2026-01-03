from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
from .generator import generate_schedule_from_headings
from src.schedule.utils import (
    extract_pdf_headings,
    extract_full_text,
    compute_topic_difficulty,
)

router = APIRouter(prefix="/schedule", tags=["Schedule"])

@router.post("/generate-timetable")
async def generate_timetable(
    subject_name: str = Form(...),
    difficulty: int = Form(...),
    total_hours: float = Form(...),
    available_hours_per_week: float = Form(...),
    file: Optional[UploadFile] = File(None)
):
    try:
        if file:
            pdf_bytes = await file.read()
            headings = extract_pdf_headings(pdf_bytes)
            full_text = extract_full_text(pdf_bytes)
            difficulty_scores = compute_topic_difficulty(headings, full_text)
            
            schedule = generate_schedule_from_headings(
                headings=headings,
                total_hours=total_hours,
                difficulty_scores=difficulty_scores,
            )
        else:
            # Simple fallback if no PDF is uploaded
            schedule = [{"topic": f"Basics of {subject_name}", "hours": total_hours}]

        return {
            "success": True,
            "chapters": [
                {
                    "name": item["topic"],
                    "estimated_hours": item.get("hours", 5),
                    "priority": "high" if difficulty > 3 else "medium",
                    "topics": []
                } for item in schedule
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))