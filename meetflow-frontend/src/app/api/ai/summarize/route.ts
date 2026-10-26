import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export async function POST(req: Request) {
  try {
    const { transcript, title, meetingId } = await req.json();

    const apiKey = process.env.GROQ_API_KEY;

    if (!transcript || transcript.trim().length === 0) {
      return NextResponse.json(
        { error: 'Meeting transcript or notes are required' },
        { status: 400 }
      );
    }

    if (!apiKey) {
      // Fallback structured analysis if API key is not yet set
      return NextResponse.json({
        success: true,
        source: 'fallback',
        message: 'No GROQ_API_KEY detected in .env.local. Providing demo AI summary. Add GROQ_API_KEY for live generation.',
        data: {
          executiveSummary: `The session focused on ${title || 'project architecture and delivery milestones'}. Key technical priorities, module assignments, and next deployment deadlines were finalized across the core engineering team.`,
          keyPoints: [
            { topic: 'Architecture Finalization', detail: 'Consensus reached on microservice boundaries and real-time WebRTC channels.', timestamp: '04:15' },
            { topic: 'AI Agent Pipeline', detail: 'Agreed on Groq LLaMA integration for autonomous transcript summaries and Q&A indexing.', timestamp: '18:30' },
            { topic: 'Student Catch-up Flow', detail: 'Approved highlight reels and timestamped question assistance for absent participants.', timestamp: '31:40' },
          ],
          decisions: [
            'Adopted LiveKit WebRTC for cross-platform HD video routing',
            'Enforced Human-in-the-Loop review before AI summaries are published to students',
            'Scheduled sprint demo for upcoming Friday at 10:00 AM'
          ],
          actionItems: [
            { task: 'Implement LiveKit token generation endpoint', assignee: 'Backend Lead', priority: 'High', dueDate: 'Friday' },
            { task: 'Connect Supabase Auth & PostgreSQL schema', assignee: 'Database Team', priority: 'High', dueDate: 'Thursday' },
            { task: 'Validate AI Q&A timestamp search citations', assignee: 'AI Team', priority: 'Medium', dueDate: 'Monday' }
          ],
          sentiment: 'Highly Productive & Aligned'
        }
      });
    }

    const groq = new Groq({ apiKey });

    const prompt = `You are an expert AI Executive Meeting Assistant for "MeetFlow", an intelligent college and enterprise collaboration platform.
Analyze the following meeting transcript/notes for the meeting titled "${title || 'Class / Team Meeting'}":

---
TRANSCRIPT:
${transcript}
---

Provide a structured, accurate JSON response with the following keys ONLY (no markdown code blocks, just raw JSON):
{
  "executiveSummary": "A concise, high-level summary of the entire meeting (2-3 paragraphs)",
  "keyPoints": [
    { "topic": "Short topic name", "detail": "Detailed bullet point", "timestamp": "MM:SS estimate or section" }
  ],
  "decisions": [
    "Decision 1 made during the meeting",
    "Decision 2..."
  ],
  "actionItems": [
    { "task": "Concrete task description", "assignee": "Name or Role", "priority": "High | Medium | Low", "dueDate": "Estimated date or deadline" }
  ],
  "sentiment": "Overall meeting tone (e.g. Highly Productive, Strategic, Technical Alignment, etc.)"
}`;

    // Try models in order of preference
    const models = ['llama-3.3-70b-versatile', 'llama-3.1-70b-versatile', 'llama-3.1-8b-instant'];
    let lastError: any = null;

    for (const model of models) {
      try {
        const response = await groq.chat.completions.create({
          model,
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
          temperature: 0.3,
        });

        const responseText = response.choices[0]?.message?.content || '{}';
        const clean = responseText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
        const parsedData = JSON.parse(clean);

        return NextResponse.json({
          success: true,
          source: model,
          data: parsedData,
        });
      } catch (modelErr: any) {
        console.error(`Model ${model} failed:`, modelErr?.message);
        lastError = modelErr;
        continue;
      }
    }

    throw lastError || new Error('All Groq models failed');

  } catch (error: any) {
    console.error('AI Summarization Error:', error?.message || error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to generate AI summary',
        hint: 'Ensure GROQ_API_KEY is a valid key from console.groq.com',
      },
      { status: 500 }
    );
  }
}
