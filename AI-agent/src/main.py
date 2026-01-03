# am-prasad/ai-study-planner/AI-agent/src/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 1️⃣ Create app FIRST
app = FastAPI(title="AI Study Planner API")

# 2️⃣ Add CORS Middleware
# Make sure the port matches your Vite frontend (usually 5173 or 8080)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8080"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3️⃣ Import Routers
# Ensure these routers have internal prefixes like router = APIRouter(prefix="/schedule")
from src.schedule.router import router as schedule_router
from src.pdf.router import router as pdf_router

# 4️⃣ Include Routers
# If your schedule/router.py already has prefix="/schedule", just include it like this:
app.include_router(schedule_router)
app.include_router(pdf_router)

@app.get("/")
def root():
    return {"message": "AI Study Planner Running"}