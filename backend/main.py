import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from models import (
    SummarizeRequest, SummarizeResponse,
    ExtractTasksRequest, ExtractTasksResponse,
    QARequest, QAResponse
)
from agents.summarizer import summarize_meeting
from agents.task_extractor import extract_tasks_from_transcript
from agents.qa_agent import answer_meeting_question

load_dotenv()

app = FastAPI(
    title="MeetFlow AI Service",
    description="Python FastAPI backend powering AI agents for MeetFlow (Summarizer, Task Extractor, Q&A Assistant)",
    version="1.0.0"
)

# Allow requests from frontend (Next.js localhost:3000 + deployed production apps)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "service": "MeetFlow AI Service",
        "status": "online",
        "framework": "FastAPI (Python)",
        "docs_url": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "agents": ["summarizer", "task_extractor", "qa_assistant"]
    }

@app.post("/api/summarize", response_model=SummarizeResponse)
def summarize_endpoint(payload: SummarizeRequest):
    """
    Summarizer Agent endpoint: Generates structured overview, key points,
    decisions, and next steps from meeting transcripts.
    """
    try:
        return summarize_meeting(payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/extract-tasks", response_model=ExtractTasksResponse)
def extract_tasks_endpoint(payload: ExtractTasksRequest):
    """
    Task Extractor Agent endpoint: Detects action items, assignees, deadlines,
    and priority ratings from meeting dialogues.
    """
    try:
        return extract_tasks_from_transcript(payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/qa", response_model=QAResponse)
def qa_endpoint(payload: QARequest):
    """
    Q&A Assistant Agent endpoint: Responds to user queries about past meetings
    with timestamp citations and confidence scores.
    """
    try:
        return answer_meeting_question(payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
