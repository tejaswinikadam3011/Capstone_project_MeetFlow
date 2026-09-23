# MeetFlow — Tech Stack

## Frontend
- **Next.js + React** — web app (home, dashboard, scheduling, archive, in-meeting UI)
- **Tailwind CSS** — styling
- **Framer Motion** — transitions (waiting room, hand-raise queue, panels)

## Real-Time Meeting Layer
- **LiveKit / Agora / Daily.co** (managed WebRTC SFU) — handles:
  - Audio/video, mute/unmute, screen share
  - Room codes, waiting rooms, admit/approve
  - Recording capture
  - Low-bandwidth / audio-only fallback (NFR-4)

> Recommendation: don't build WebRTC infra from scratch — pick one managed SFU early since it shapes a lot of the backend.

## Backend / API
- **FastAPI (Python)** — core API, integrates cleanly with the AI agent layer
- *(Alternative: Node.js/Express if you want one language with Next.js)*

## AI Agents
| Agent | Purpose | Tools |
|---|---|---|
| Summarizer Agent | Draft post-meeting summaries | LangChain + Gemini/Groq |
| Task Agent | Detect action items, due dates | LangChain + LLM |
| Reminder Agent | Notify on due/overdue tasks | Scheduled jobs (Celery/cron) |
| Q&A Agent | Answer questions w/ timestamp + confidence | LangChain + vector search |

- **LangChain** — agent orchestration
- **Gemini / Groq** — LLM inference (Groq for low-latency Q&A)
- **Whisper** (or SFU's built-in transcription) — speech-to-text feeding all agents

## Database
- **MongoDB** — meetings, rooms, tasks, chat logs, users (flexible schema)
- **MongoDB Atlas Vector Search / Pinecone** — semantic search for multi-meeting Q&A ("have we discussed this before?")

## Auth
- **Firebase Auth** — Google OAuth + email sign-in, domain-restricted rooms

## Storage
- **Firebase Storage / AWS S3** — recordings, highlight reels, exported PDF summaries

## Infra / Deployment
- **Docker** — containerize backend + AI worker services
- **Vercel** — Next.js frontend
- **Render / Fly.io / AWS** — FastAPI backend + AI workers (long-running jobs, not ideal for Vercel)

## Open Decision
- Confirm which managed SFU (LiveKit vs. Agora vs. Daily.co) — pricing, self-hosting needs, and SDK maturity should decide this before backend work starts.
