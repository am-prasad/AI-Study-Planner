# am-prasad/ai-study-planner/AI-agent/src/schedule/generator.py

from datetime import datetime, timedelta
from typing import List, Dict, Any
from .schemas import Topic

class ScheduleGenerator:
    """
    Creates a study schedule from topics with date and difficulty awareness.
    """

    @staticmethod
    def create_schedule(
        topics: List[Any],
        daily_hours: float,
        days: int,
    ) -> List[Dict[str, Any]]:
        schedule: List[Dict[str, Any]] = []
        day_count = 1

        for topic in topics:
            if day_count > days:
                break
            
            # Handle both Pydantic models and raw dicts
            name = topic.name if hasattr(topic, 'name') else topic.get('name')
            hours = getattr(topic, 'hours_required', None) or topic.get('hours_required') or daily_hours

            schedule.append({
                "day": day_count,
                "topic": name,
                "hours": hours,
            })
            day_count += 1
        return schedule

def generate_schedule_from_headings(
    headings: List[str],
    total_hours: float,
    difficulty_scores: Dict[str, float],
    start_date_str: str = None
) -> List[Dict[str, Any]]:
    """
    Creates a study plan where hours are allotted by difficulty and dates are sequential.
    """
    if start_date_str:
        try:
            current_date = datetime.strptime(start_date_str, "%Y-%m-%d")
        except ValueError:
            current_date = datetime.now()
    else:
        current_date = datetime.now()

    enriched = []
    for h in headings:
        diff = difficulty_scores.get(h, 1.0)
        enriched.append({"title": h, "difficulty": max(diff, 1.0)})

    total_diff = sum(h["difficulty"] for h in enriched) or 1
    schedule = []

    for h in enriched:
        # Allot hours based on difficulty portion
        portion = h["difficulty"] / total_diff
        allocated_hours = round(total_hours * portion, 2)
        
        schedule.append({
            "date": current_date.strftime("%Y-%m-%d"),
            "topic": h["title"],
            "hours": allocated_hours,
            "difficulty": round(h["difficulty"], 1)
        })
        # Move to the next day for the next topic
        current_date += timedelta(days=1)

    return schedule