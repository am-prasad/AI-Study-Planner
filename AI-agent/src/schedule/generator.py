# am-prasad/ai-study-planner/AI-agent/src/schedule/generator.py

from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
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

def generate_dynamic_schedule(
    content: str,
    headings: List[str],
    availability: str,
    startDate: str,
    studyTime: str,
    userId: str
) -> Dict[str, Any]:
    """
    Placeholder for AI logic to generate a dynamic study schedule considering all user inputs.
    This function would contain the sophisticated AI logic to parse content, availability,
    and study goals to produce an optimized timetable.
    """
    # For demonstration, a simple mock schedule is returned.
    # In a real application, the AI would process:
    # - 'content' (from text input or parsed PDF)
    # - 'headings' (extracted topics)
    # - 'availability' (e.g., "Mon-Fri 9AM-5PM, Weekends flexible")
    # - 'startDate' (e.g., "2026-01-01")
    # - 'studyTime' (e.g., "3 hours/day", "15 hours/week")
    # to create a detailed, optimized timetable.

    print(f"Generating dynamic schedule for user {userId} starting {startDate}...")
    print(f"Content: {content[:100]}...")
    print(f"Availability: {availability}, Study Time: {studyTime}")

    # This is a very basic placeholder. Your AI would do the actual complex scheduling.
    mock_schedule = {
        "Day 1": [
            {"id": "task-intro", "description": f"Study Introduction to {headings[0] if headings else 'Subject 1'}", "hours": 2, "completed": False}
        ],
        "Day 2": [
            {"id": "task-deep-dive", "description": f"Deep Dive into {headings[1] if len(headings) > 1 else 'Subject 2'}", "hours": 3, "completed": False}
        ],
        "Day 3": [
            {"id": "task-review-start", "description": f"Review {headings[0] if headings else 'Subject 1'} and start {headings[2] if len(headings) > 2 else 'Subject 3'}", "hours": 2, "completed": False}
        ],
    }
    return mock_schedule

def realign_schedule(
    current_timetable: Dict[str, List[Dict[str, Any]]],
    missed_task_id: Optional[str],
    availability: str,
    study_time: str,
    userId: str
) -> Dict[str, List[Dict[str, Any]]]:
    """
    Placeholder for AI logic to realign the study schedule.
    This function would re-evaluate the timetable based on missed tasks and user inputs.
    """
    print(f"Realigning schedule for user {userId} due to missed task {missed_task_id}...")
    print(f"Current Timetable: {current_timetable}")
    print(f"Availability: {availability}, Study Time: {study_time}")

    # Deep copy the current timetable to avoid modifying it directly
    realigned_timetable = {day: [task.copy() for task in tasks] for day, tasks in current_timetable.items()}
    
    if missed_task_id:
        found_and_realigned = False
        for day, tasks in realigned_timetable.items():
            for i, task in enumerate(tasks):
                if task.get('id') == missed_task_id and task.get('completed') == False:
                    # Simple re-alignment: move the missed task to a new 'future' day
                    # In a real AI, this would involve smart rescheduling based on availability
                    new_day_key = f"day{len(realigned_timetable) + 1}"
                    realigned_timetable.setdefault(new_day_key, []).append({
                        "id": f"{missed_task_id}-realigned",
                        "description": f"Realigned: {task.get('description', '' )}",
                        "hours": task.get('hours', 0),
                        "completed": False,
                    })
                    # Optionally remove from original spot or mark as rescheduled
                    # For simplicity, we just add it to a new day here.
                    tasks[i]['description'] = f"[RESCHEDULED] {task.get('description', '')}"
                    tasks[i]['rescheduled'] = True
                    found_and_realigned = True
                    break
            if found_and_realigned:
                break

    # Further AI logic would go here to intelligently re-distribute tasks
    # based on availability and study time constraints.
    
    return realigned_timetable