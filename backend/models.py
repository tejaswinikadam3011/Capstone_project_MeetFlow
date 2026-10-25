from typing import List, Optional
from pydantic import BaseModel, Field

# ── Summarization Models ──────────────────────────────────────────────────────
class TranscriptSegment(BaseModel):
    speaker: str
    text: str
    timestamp: Optional[str] = "00:00"

class SummarizeRequest(BaseModel):
    title: Optional[str] = "Meeting"
    transcript: Optional[str] = None
    segments: Optional[List[TranscriptSegment]] = None

class SummarizeResponse(BaseModel):
    title: str
    overview: str
    key_points: List[str]
    decisions: List[str]
    next_steps: List[str]
    sentiment: str = "Productive & Focused"

# ── Task Extraction Models ───────────────────────────────────────────────────
class TaskItem(BaseModel):
    title: str
    assignee: Optional[str] = "Unassigned"
    due_date: Optional[str] = "Next meeting"
    priority: str = Field(default="Medium", description="Low, Medium, High")
    context: Optional[str] = None

class ExtractTasksRequest(BaseModel):
    transcript: Optional[str] = None
    segments: Optional[List[TranscriptSegment]] = None

class ExtractTasksResponse(BaseModel):
    tasks: List[TaskItem]
    total_tasks: int

# ── Q&A Agent Models ──────────────────────────────────────────────────────────
class QARequest(BaseModel):
    question: str
    meeting_title: Optional[str] = "Recent Meeting"
    transcript: Optional[str] = None

class QAResponse(BaseModel):
    question: str
    answer: str
    timestamp: Optional[str] = None
    confidence: float = 0.95
    relevant_quote: Optional[str] = None
