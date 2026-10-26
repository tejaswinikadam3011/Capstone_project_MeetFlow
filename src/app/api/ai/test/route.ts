import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export async function GET() {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ status: 'no-key', message: 'GROQ_API_KEY not set in environment' });
  }

  try {
    const groq = new Groq({ apiKey });
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: 'Reply with just the word: OK' }],
      max_tokens: 5,
    });

    return NextResponse.json({
      status: 'success',
      keyPrefix: apiKey.substring(0, 8) + '...',
      response: response.choices[0]?.message?.content,
    });
  } catch (err: any) {
    return NextResponse.json({
      status: 'error',
      keyPrefix: apiKey.substring(0, 8) + '...',
      error: err?.message || String(err),
      code: err?.status || err?.code,
    });
  }
}
