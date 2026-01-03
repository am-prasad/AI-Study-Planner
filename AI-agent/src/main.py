from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 1️⃣ Create app FIRST
app = FastAPI()

# Add CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"], # Your Vite frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2️⃣ Import Routers AFTER app is created
from src.schedule.router import router as schedule_router

# 3️⃣ Include Routers
app.include_router(schedule_router)



@app.get("/")
def root():
    return {"message": "AI Study Planner Running"}
from src.pdf.router import router as pdf_router
app.include_router(pdf_router)

