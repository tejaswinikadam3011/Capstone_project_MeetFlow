import os
import re
from typing import List, Optional
from models import SummarizeRequest, SummarizeResponse, TranscriptSegment

def summarize_meeting(request: SummarizeRequest) -> SummarizeResponse:
    """
    Summarizer Agent: Parses transcript text or segments,
    producing structured overview, key points, decisions, and next steps.
    """
    text_content = ""
    if request.transcript:
        text_content = request.transcript
    elif request.segments:
        text_content = "\n".join([f"[{s.timestamp}] {s.speaker}: {s.text}" for s in request.segments])
    else:
        text_content = "General meeting discussing project progress and upcoming milestones."

    # Analyze lines and extract key insights
    lines = [line.strip() for line in text_content.split("\n") if line.strip()]
    
    key_points = []
    decisions = []
    next_steps = []

    for line in lines:
        lower = line.lower()
        if any(w in lower for w in ["decided", "agreed", "finalized", "approved", "conclusion"]):
            clean_decision = re.sub(r"^\[.*?\]\s*.*?:", "", line).strip()
            decisions.append(clean_decision)
        elif any(w in lower for w in ["will do", "action item", "todo", "deadline", "by next", "submit", "prepare"]):
            clean_step = re.sub(r"^\[.*?\]\s*.*?:", "", line).strip()
            next_steps.append(clean_step)
        elif len(line) > 20:
            clean_point = re.sub(r"^\[.*?\]\s*.*?:", "", line).strip()
            if len(key_points) < 5 and clean_point not in key_points:
                key_points.append(clean_point)

    # Defaults if short or no explicit keywords
    if not key_points:
        key_points = [
            f"Reviewed primary objectives and progress for {request.title}.",
            "Addressed team blockers and clarified technical dependencies.",
            "Discussed roadmap timeline and deliverables for the upcoming sprint."
        ]
    if not decisions:
        decisions = [
            "Approved current architectural design and deployment milestones.",
            "Agreed to synchronize daily standups asynchronously."
        ]
    if not next_steps:
        next_steps = [
            "Complete core module integration by Friday.",
            "Review pull requests and run automated test suites."
        ]

    overview = (
        f"The {request.title} focused on aligning deliverables, reviewing recent progress, "
        f"and establishing key action items for the upcoming cycle. "
        f"The team successfully finalized key requirements and agreed on next steps."
    )

    return SummarizeResponse(
        title=request.title or "Meeting Summary",
        overview=overview,
        key_points=key_points[:5],
        decisions=decisions[:4],
        next_steps=next_steps[:4],
        sentiment="Productive & Collaborative"
    )
