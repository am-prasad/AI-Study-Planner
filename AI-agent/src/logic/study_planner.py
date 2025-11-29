from datetime import datetime, timedelta
from math import ceil
from src.preprocessing.embedding_service import EmbeddingService

class StudyPlanner:
    def __init__(self):
        self.embedding_service = EmbeddingService()

    def generate_topic_embeddings(self, topics: list[str]):
        """Generate embeddings for each topic."""
        embeddings = []
        for t in topics:
            vec = self.embedding_service.embed_text(t)
            embeddings.append({"text": t, "vector": vec})
        return embeddings

    def rank_topics(self, topics: list[str]):
        """Rank topics by semantic complexity (using vector norm)."""
        embedded = self.generate_topic_embeddings(topics)

        # Norm as a simple difficulty proxy
        for e in embedded:
            e["difficulty"] = sum([x*x for x in e["vector"]]) ** 0.5

        ranked = sorted(embedded, key=lambda x: x["difficulty"], reverse=True)
        return ranked

    def create_schedule(self, topics: list[str], hours_per_day: int, exam_date: str):
        exam = datetime.strptime(exam_date, "%Y-%m-%d")
        today = datetime.now()
        days_left = (exam - today).days

        if days_left <= 0:
            raise ValueError("Exam date must be in the future.")

        ranked = self.rank_topics(topics)

        total_topics = len(ranked)
        sessions_per_topic = 2  # revision logic
        total_sessions = total_topics * sessions_per_topic

        daily_sessions = ceil(total_sessions / days_left)

        schedule = {}
        day_pointer = today

        i = 0
        while i < total_sessions:
            day_key = day_pointer.strftime("%Y-%m-%d")
            schedule.setdefault(day_key, [])

            for _ in range(daily_sessions):
                if i >= total_sessions:
                    break

                topic_index = i // sessions_per_topic
                revision_round = (i % sessions_per_topic) + 1

                schedule[day_key].append({
                    "topic": ranked[topic_index]["text"],
                    "session_type": "revision" if revision_round == 2 else "learning"
                })

                i += 1

            day_pointer += timedelta(days=1)

        return schedule

    def generate(self, subjects: list[str], exam_date: str, hours_per_day: int = 3):
        return self.create_schedule(subjects, hours_per_day, exam_date)
