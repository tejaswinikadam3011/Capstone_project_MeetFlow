# MeetFlow — Python AI Service (FastAPI)

This service powers the AI Agent Layer for **MeetFlow**, fulfilling the college capstone requirements for NLP, intelligent agent workflows, and automated meeting intelligence.

---

## 🏗️ Architecture & Features

### 1. 📝 Summarizer Agent (`/api/summarize`)
- Processes meeting dialogues or live transcripts.
- Extracts high-level executive overview, key discussed topics, formal decisions made, and follow-up milestones.

### 2. ✅ Task Extractor Agent (`/api/extract-tasks`)
- Automatically detects actionable commitments and assignments made during meetings.
- Categorizes assignees, deadlines, and priority ratings (High / Medium / Low).

### 3. 🧠 Q&A Assistant Agent (`/api/qa`)
- Answers user inquiries regarding topics discussed across past sessions.
- Attaches exact timestamp citations (e.g. `[Jump to 18:30]`) and confidence scores.

---

## 🚀 How to Run Locally

### 1. Install Dependencies
```bash
python -m pip install -r requirements.txt
```

### 2. Start the Server
```bash
python -m uvicorn main:app --app-dir backend --port 8000 --reload
```
*(Or from the project root: `npm run backend`)*

### 3. Interactive API Documentation (Swagger)
Open in your browser:
👉 **[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)**
