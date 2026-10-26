import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export async function POST(req: Request) {
  try {
    const { question, meetingContext, meetingTitle, chatHistory = [] } = await req.json();

    const apiKey = process.env.GROQ_API_KEY;

    if (!question || question.trim().length === 0) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({
        success: true,
        source: 'fallback',
        data: {
          answer: `I'm running in demo mode (no API key set). For the question: "${question}" — in a real session, I would search through your meeting transcripts and provide a detailed answer with timestamps and citations.`,
          citations: [],
          relatedTopics: ['Add GROQ_API_KEY to .env.local for live responses'],
        },
      });
    }

    const groq = new Groq({ apiKey });

    // Build conversation messages with full history
    const systemPrompt = `You are MeetFlow AI — an expert meeting assistant for students and professionals.
Your job is to answer questions about meetings using the provided transcript/context.

RULES:
- Answer ONLY from the meeting context provided. If context is empty, say so honestly.
- Be concise, helpful, and direct.
- If you find relevant info, cite the timestamp and speaker.
- If asked something not in the meeting, say "This wasn't covered in the meeting" and suggest escalating to the host.
- Always respond with valid raw JSON only — no markdown, no code fences.

RESPONSE FORMAT (strict JSON):
{
  "answer": "Your detailed answer here",
  "citations": [
    { "timestamp": "MM:SS", "speaker": "Speaker name or 'Unknown'", "note": "What was said" }
  ],
  "relatedTopics": ["Topic 1", "Topic 2"]
}

MEETING: "${meetingTitle || 'Meeting'}"
TRANSCRIPT/CONTEXT:
"""
${meetingContext || 'No transcript available for this meeting.'}
"""`;

    // Build message history for multi-turn conversation
    const messages: Groq.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      // Include prior conversation turns
      ...chatHistory.flatMap((turn: { question: string; answer: string }) => [
        { role: 'user' as const, content: turn.question },
        { role: 'assistant' as const, content: turn.answer },
      ]),
      { role: 'user', content: question },
    ];

    let lastError: any = null;
    const models = ['qwen/qwen3.8-27b', 'openai/gpt-oss-20b'];

    for (const model of models) {
      try {
        const response = await groq.chat.completions.create({
          model,
          messages,
          temperature: 0.2,
          max_tokens: 1024,
        });

        const raw = response.choices[0]?.message?.content || '{}';
        // Strip any accidental markdown fences
        const clean = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

        let parsed: any;
        try {
          parsed = JSON.parse(clean);
        } catch {
          // If JSON parse fails, treat entire response as plain answer
          parsed = { answer: clean, citations: [], relatedTopics: [] };
        }

        return NextResponse.json({
          success: true,
          source: model,
          data: {
            answer: parsed.answer || clean,
            citations: parsed.citations || [],
            relatedTopics: parsed.relatedTopics || [],
          },
        });
      } catch (err: any) {
        console.error(`Model ${model} failed:`, err?.message);
        lastError = err;
        continue;
      }
    }

    throw lastError || new Error('All AI models failed');

  } catch (error: any) {
    console.error('AI Q&A Error:', error?.message || error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to process your question' },
      { status: 500 }
    );
  }
}
