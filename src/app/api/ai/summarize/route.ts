import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export async function POST(req: Request) {
  try {
    const { transcript, title } = await req.json();

    const apiKey = process.env.GROQ_API_KEY;

    if (!transcript || transcript.trim().length === 0) {
      return NextResponse.json({ error: 'Transcript is required' }, { status: 400 });
    }

    // No API key configured
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        source: 'no-key',
        error: 'GROQ_API_KEY not set. Please add it to your environment variables.',
      }, { status: 500 });
    }

    const groq = new Groq({ apiKey });

    const prompt = `You are an expert AI Meeting Assistant for "MeetFlow".
Analyze the following meeting information for the meeting titled "${title || 'Team Meeting'}":

---
MEETING NOTES / TRANSCRIPT:
${transcript}
---

Based ONLY on what is in the notes above, generate a structured Minutes of Meeting in this exact JSON format (raw JSON, no markdown):
{
  "executiveSummary": "2-3 sentence summary of what happened in this specific meeting based on the notes",
  "keyPoints": [
    { "topic": "Topic name from the meeting", "detail": "Specific detail from the notes", "timestamp": "Start / Middle / End" }
  ],
  "decisions": [
    "A specific decision or conclusion from this meeting"
  ],
  "actionItems": [
    { "task": "Specific task mentioned or implied", "assignee": "Person or role mentioned, else 'Team'", "priority": "High | Medium | Low", "dueDate": "Next session / TBD / specific date if mentioned" }
  ],
  "sentiment": "Short phrase describing the meeting tone based on content"
}

IMPORTANT: Only use information from the provided notes. Do not invent topics not mentioned. Return raw JSON only, no markdown fences.`;

    // Try models in order of preference
    const models = ['qwen/qwen3.8-27b', 'openai/gpt-oss-20b'];
    let lastError: any = null;

    for (const model of models) {
      try {
        const response = await groq.chat.completions.create({
          model,
          messages: [{ role: 'user', content: prompt }],
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

    // All models failed
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
