# am-prasad/ai-study-planner/AI-agent/src/schedule/router.py

import os
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional, List, Dict
from src.schedule.generator import generate_schedule_from_headings, generate_dynamic_schedule
from src.schedule.utils import (
    extract_pdf_headings,
    extract_full_text,
    compute_topic_difficulty,
)
from pydantic import BaseModel
import base64 # Import base64 for decoding PDF content

router = APIRouter(prefix="/schedule", tags=["Schedule"])

class TimetableGenerationRequest(BaseModel):
    userId: str
    rawData: Optional[str] = None # Can be text
    pdfContent: Optional[str] = None # New field for base64 encoded PDF content
    availability: str
    startDate: str
    studyTime: str

class TimetableTask(BaseModel):
    id: str
    description: str
    hours: float
    completed: bool

class RealignTimetableRequest(BaseModel):
    userId: str
    currentTimetable: Dict[str, List[TimetableTask]]
    missedTaskId: Optional[str] = None # Or other context for re-alignment
    availability: str
    studyTime: str

@router.post("/generate")
async def generate_timetable(
    request: TimetableGenerationRequest
):
    """
    Generates a study timetable based on user input, including optional PDF syllabus.
    """
    try:
        headings = []
        full_text = ""
        pdf_content = None

        if request.pdfContent: # If base64 encoded PDF content is provided
            pdf_content = base64.b64decode(request.pdfContent)
            headings = extract_pdf_headings(pdf_content)
            full_text = extract_full_text(pdf_content)
        elif request.rawData: # If rawData is text
            headings = [line.strip() for line in request.rawData.split('\n') if line.strip()]
            full_text = request.rawData

        if not headings and not full_text: # If neither text nor PDF provided usable content
            raise HTTPException(status_code=422, detail="No usable content for timetable generation. Please provide text or a valid PDF.")

        generated_schedule = generate_dynamic_schedule(
            content=full_text, 
            headings=headings,
            availability=request.availability,
            startDate=request.startDate,
            studyTime=request.studyTime,
            userId=request.userId
        )

        return {
            "success": True,
            "userId": request.userId,
            "timetable": generated_schedule
        }

    except Exception as e:
        print(f"Error generating timetable: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@router.post("/realign")
async def realign_timetable(
    request: RealignTimetableRequest
):
    """
    Re-aligns the study timetable based on missed tasks or updated availability.
    """
    try:
        # In a real scenario, this would involve complex AI logic to re-schedule.
        # For now, we'll use a simple placeholder.
        realigned_schedule = realign_schedule(
            current_timetable=request.currentTimetable,
            missed_task_id=request.missedTaskId,
            availability=request.availability,
            study_time=request.studyTime,
            userId=request.userId
        )

        return {
            "success": True,
            "userId": request.userId,
            "timetable": realigned_schedule
        }
    except Exception as e:
        print(f"Error realigning timetable: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

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