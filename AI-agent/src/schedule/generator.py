# src/schedule/generator.py

from datetime import datetime, timedelta
from typing import List, Dict, Any

from .schemas import Topic  # 👈 import your Topic model
from src.schedule.utils import (
    extract_pdf_headings,
    extract_full_text,
    compute_topic_difficulty,
    distribute_hours,
)


class ScheduleGenerator:
    """
    Creates a simple study schedule from topics.
    """

    @staticmethod
    def create_schedule(
        topics: List[Topic],
        daily_hours: float,
        days: int,
    ) -> List[Dict[str, Any]]:
        """
        topics: list[Topic] from ScheduleRequest
        daily_hours: default hours per topic/day
        days: max number of days to plan (we stop at this)
        """
        schedule: List[Dict[str, Any]] = []
        day = 1

        for topic in topics:
            if day > days:
                break

            # Topic is a Pydantic model -> use attributes
            hours = topic.hours_required or daily_hours

            schedule.append(
                {
                    "day": day,
                    "topic": topic.name,
                    "hours": hours,
                }
            )
            day += 1

        return schedule


def generate_schedule(
    topics: List[Topic],
    daily_hours: float,
    days: int,
) -> Dict[str, Any]:
    """
    Main schedule generator used by router.create_schedule.

    MUST return a dict of shape:
        {"schedule": [ { "day": int, "topic": str, "hours": float }, ... ]}
    to match ScheduleResponse.
    """
    schedule_items = ScheduleGenerator.create_schedule(topics, daily_hours, days)
    return {"schedule": schedule_items}


def generate_schedule_from_headings(
    headings: List[str],
    total_hours: float,
    difficulty_scores: Dict[str, float],
) -> List[Dict[str, Any]]:
    """
    Used by /upload-pdf endpoint to create a difficulty‑aware study plan.

    Returns a list of dicts: { "day": int, "topic": str, "hours": float }
    """
    enriched: List[Dict[str, Any]] = []
    for h in headings:
        diff = difficulty_scores.get(h, 1.0)
        enriched.append({"title": h, "difficulty": diff})

    total_diff = sum(h["difficulty"] for h in enriched) or len(enriched) or 1

    schedule: List[Dict[str, Any]] = []
    day = 1
    for h in enriched:
        portion = h["difficulty"] / total_diff
        allocated_hours = round(total_hours * portion, 2)
        schedule.append(
            {
                "day": day,
                "topic": h["title"],
                "hours": allocated_hours,
            }
        )
        day += 1

    return schedule
