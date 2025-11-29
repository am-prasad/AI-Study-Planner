from datetime import datetime, timedelta

class ScheduleGenerator:

    @staticmethod
    def create_schedule(topics, daily_hours, days):
        schedule = []
        current_date = datetime.now()

        for topic in topics:
            schedule.append({
                "date": current_date.strftime("%Y-%m-%d"),
                "topic": topic["name"],
                "hours": topic.get("hours_required", 2)
            })
            current_date += timedelta(days=1)

        return schedule


def generate_schedule(subjects: list, exam_date: str, hours_per_day: int):
    """
    Main schedule generator function used by router.py
    Creates a simple day-wise schedule.
    """
    exam_dt = datetime.strptime(exam_date, "%Y-%m-%d")
    today = datetime.now()
    days_available = (exam_dt - today).days

    if days_available <= 0:
        raise ValueError("Exam date must be in the future!")

    schedule = []
    day = 1

    for subject in subjects:
        schedule.append({
            "day": day,
            "subject": subject,
            "hours": hours_per_day
        })
        day += 1

    return {
        "days_available": days_available,
        "total_items": len(subjects),
        "plan": schedule
    }


from src.schedule.utils import (
    extract_pdf_headings,
    extract_full_text,
    compute_topic_difficulty,
    distribute_hours,
)

def generate_schedule_from_headings(
    headings: list[str],
    total_hours: float,
    difficulty_scores: dict[str, float],
):
    enriched = []
    for h in headings:
        diff = difficulty_scores.get(h, 1.0)
        enriched.append({"title": h, "difficulty": diff})

    total_diff = sum(h["difficulty"] for h in enriched) or len(enriched) or 1

    schedule = []
    day = 1
    for h in enriched:
        portion = h["difficulty"] / total_diff
        allocated_hours = round(total_hours * portion, 2)
        schedule.append(
            {"day": day, "topic": h["title"], "hours": allocated_hours}
        )
        day += 1

    return schedule
