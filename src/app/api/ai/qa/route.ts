import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export async function POST(req: Request) {
  try {
    const { question, meetingContext, meetingTitle, chatHistory } = await req.json();

    const apiKey = process.env.GROQ_API_KEY;

    if (!question || question.trim().length === 0) {
      return NextResponse.json(
        { error: 'Question query is required' },
        { status: 400 }
      );
    }

    if (!apiKey) {
      // Fallback demo response if API key is not yet set
      return NextResponse.json({
        success: true,
        source: 'fallback',
        message: 'No GROQ_API_KEY set. Providing mock response. Add GROQ_API_KEY in .env.local for live AI responses.',
        data: {
          answer: `Regarding "${question}": During the session, the team emphasized completing the core deliverables by Friday. Dr. Priya confirmed that the architectural review passed and highlighted that all students must review the summary before next Monday.`,
          citations: [
            { timestamp: '14:20', speaker: 'Dr. Priya Sharma', note: 'Discussion on delivery scope' },
            { timestamp: '28:45', speaker: 'Rahul Verma', note: 'Confirmation on testing criteria' }
          ],
          relatedTopics: ['Architecture Review', 'LiveKit WebRTC Setup', 'Action Item Tracking']
        }
      });
    }

    const groq = new Groq({ apiKey });

    const prompt = `You are "MeetFlow AI Q&A Assistant", an intelligent meeting assistant for university students and professors.
A student or attendee is asking a question about a past meeting titled "${meetingTitle || 'Meeting'}".

MEETING CONTEXT / TRANSCRIPT:
"""
${meetingContext || 'General meeting discussions regarding course milestones, architecture design, deadlines, and task assignments.'}
"""

USER QUESTION:
"${question}"

Provide a direct, helpful, and polite answer. Include specific timestamp references/citations whenever relevant.
Respond with raw JSON only (no markdown enclosing):
{
  "answer": "Detailed answer explaining the topic clearly and citing participants if mentioned",
  "citations": [
    { "timestamp": "MM:SS", "speaker": "Speaker name if identifiable", "note": "What was said" }
  ],
  "relatedTopics": ["Related Topic 1", "Related Topic 2"]
}`;

    const response = await groq.chat.completions.create({
      model: 'qwen/qwen3.8-27b',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    const responseText = response.choices[0]?.message?.content || '{}';
    const parsedData = JSON.parse(responseText);

    return NextResponse.json({
      success: true,
      source: 'llama-3.3-70b-versatile',
      data: parsedData,
    });
  } catch (error: any) {
    console.error('AI Q&A Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process AI question' },
      { status: 500 }
    );
  }
}
