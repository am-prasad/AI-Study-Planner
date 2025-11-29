from fastapi import APIRouter
from pydantic import BaseModel
from src.logic.study_planner import StudyPlanner

router = APIRouter()
planner = StudyPlanner()

class PlannerRequest(BaseModel):
    subjects: list[str]
    exam_date: str
    hours_per_day: int = 3

@router.post("/generate-schedule")
def generate_schedule(data: PlannerRequest):
    schedule = planner.generate(
        subjects=data.subjects,
        exam_date=data.exam_date,
        hours_per_day=data.hours_per_day
    )
    return {"schedule": schedule}
