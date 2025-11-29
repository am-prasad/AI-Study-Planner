from pydantic import BaseModel
from typing import List

class Topic(BaseModel):
    name: str
    difficulty: int  # 1-5 scale
    hours_required: float

class ScheduleRequest(BaseModel):
    topics: List[Topic]
    daily_hours: float
    days: int

class ScheduledItem(BaseModel):
    day: int
    topic: str
    hours: float

class ScheduleResponse(BaseModel):
    schedule: List[ScheduledItem]
