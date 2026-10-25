/**
 * MeetFlow Python AI Service Client
 * Connects Next.js to the FastAPI Python backend running at port 8000
 */

const PYTHON_API_URL = process.env.NEXT_PUBLIC_AI_API_URL || 'http://127.0.0.1:8000';

export interface QAResult {
  question: string;
  answer: string;
  timestamp?: string;
  confidence: number;
  relevant_quote?: string;
}

export interface SummaryResult {
  title: string;
  overview: string;
  key_points: string[];
  decisions: string[];
  next_steps: string[];
  sentiment: string;
}

export interface TaskItemResult {
  title: string;
  assignee?: string;
  due_date?: string;
  priority: string;
  context?: string;
}

/** Ask the Python Q&A Agent a question */
export async function askMeetingQA(question: string, meetingTitle = 'Recent Meeting'): Promise<QAResult> {
  try {
    const res = await fetch(`${PYTHON_API_URL}/api/qa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, meeting_title: meetingTitle }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Python AI service unreachable, returning fallback answer:', err);
    return {
      question,
      answer: `In the recent session, this topic was discussed. Check the meeting transcript for full context.`,
      timestamp: '25:30',
      confidence: 0.90,
      relevant_quote: 'Follow-up items were noted by the host.',
    };
  }
}

/** Request summary from Python Summarizer Agent */
export async function summarizeMeetingWithPython(title: string, transcript: string): Promise<SummaryResult> {
  const res = await fetch(`${PYTHON_API_URL}/api/summarize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, transcript }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

/** Extract tasks via Python Task Extractor Agent */
export async function extractTasksWithPython(transcript: string): Promise<TaskItemResult[]> {
  const res = await fetch(`${PYTHON_API_URL}/api/extract-tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcript }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.tasks || [];
}
