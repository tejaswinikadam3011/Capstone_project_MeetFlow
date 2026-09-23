import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
  try {
    const { transcript, meetingTitle } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!transcript || transcript.trim().length === 0) {
      return NextResponse.json(
        { error: 'Transcript or text is required' },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json({
        success: true,
        source: 'fallback',
        message: 'No GEMINI_API_KEY detected. Providing demo extracted tasks. Add GEMINI_API_KEY for live extraction.',
        data: {
          tasks: [
            { id: '1', title: 'Prepare LiveKit token generation API', assignee: 'Alex Morgan', priority: 'High', dueDate: 'Tomorrow, 5:00 PM', status: 'pending' },
            { id: '2', title: 'Review student attendance catch-up policy', assignee: 'Dr. Priya Sharma', priority: 'Medium', dueDate: 'Friday, 12:00 PM', status: 'pending' },
            { id: '3', title: 'Upload sprint presentation deck to archive', assignee: 'Rahul Verma', priority: 'Low', dueDate: 'Next Monday', status: 'completed' },
          ]
        }
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are "MeetFlow AI Task Agent", an intelligent action item detector for meetings.
Analyze the following transcript from "${meetingTitle || 'Meeting'}" and extract all clear action items, assignments, and follow-ups.

TRANSCRIPT:
"""
${transcript}
"""

Return a raw JSON response (no markdown enclosing) with this exact schema:
{
  "tasks": [
    {
      "id": "unique string or index",
      "title": "Clear actionable task name",
      "assignee": "Person name or team or Unassigned",
      "priority": "High | Medium | Low",
      "dueDate": "Specific date/time mentioned or 'TBD'",
      "status": "pending"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '{"tasks":[]}';
    const parsedData = JSON.parse(responseText);

    return NextResponse.json({
      success: true,
      source: 'gemini-2.5-flash',
      data: parsedData,
    });
  } catch (error: any) {
    console.error('AI Task Extraction Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to extract tasks' },
      { status: 500 }
    );
  }
}
