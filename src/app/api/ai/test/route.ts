import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ status: 'no-key', message: 'GEMINI_API_KEY not set in environment' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: 'Reply with just the word: OK',
    });
    return NextResponse.json({
      status: 'success',
      keyPrefix: apiKey.substring(0, 6) + '...',
      response: response.text,
    });
  } catch (err: any) {
    return NextResponse.json({
      status: 'error',
      keyPrefix: apiKey.substring(0, 6) + '...',
      error: err?.message || String(err),
      code: err?.status || err?.code,
    });
  }
}
