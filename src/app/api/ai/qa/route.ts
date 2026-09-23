import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
  try {
    const { question, meetingContext, meetingTitle, chatHistory } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

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
        message: 'No GEMINI_API_KEY set. Providing mock response. Add GEMINI_API_KEY in .env.local for live Gemini responses.',
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

    const ai = new GoogleGenAI({ apiKey });

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

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '{}';
    const parsedData = JSON.parse(responseText);

    return NextResponse.json({
      success: true,
      source: 'gemini-2.5-flash',
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
