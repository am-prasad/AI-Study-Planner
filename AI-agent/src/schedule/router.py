# am-prasad/ai-study-planner/AI-agent/src/schedule/router.py

import os
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
from src.schedule.generator import generate_schedule_from_headings
from src.schedule.utils import (
    extract_pdf_headings,
    extract_full_text,
    compute_topic_difficulty,
)

router = APIRouter(prefix="/schedule", tags=["Schedule"])

@router.post("/upload-pdf")
async def upload_pdf(
    file: UploadFile = File(...),
    total_hours: float = Form(...),
    start_date: Optional[str] = Form(None)
):
    """
    Processes PDF in memory to generate a difficulty-aware study plan.
    """
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Please upload a PDF file.")

    try:
        # Read file content directly into memory
        pdf_content = await file.read()

        # 1. Extract headings and full text from bytes
        headings = extract_pdf_headings(pdf_content)
        full_text = extract_full_text(pdf_content)

        if not headings:
            raise HTTPException(status_code=422, detail="No headings could be extracted from this PDF.")

        # 2. Compute difficulty based on NLP analysis
        difficulty_scores = compute_topic_difficulty(headings, full_text)

        # 3. Generate schedule with sequential dates and weighted hours
        schedule = generate_schedule_from_headings(
            headings=headings,
            total_hours=total_hours,
            difficulty_scores=difficulty_scores,
            start_date_str=start_date
        )

        return {
            "success": True,
            "filename": file.filename,
            "generated_schedule": schedule
        }

    except Exception as e:
        print(f"Error processing PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
    finally:
        await file.close()