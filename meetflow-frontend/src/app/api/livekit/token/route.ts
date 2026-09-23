import { NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const room = searchParams.get('room') || 'default-room';
    const username = searchParams.get('username') || `User-${Math.floor(Math.random() * 1000)}`;
    const isHost = searchParams.get('isHost') === 'true';

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

    if (!apiKey || !apiSecret || !wsUrl) {
      return NextResponse.json({
        success: false,
        source: 'mock',
        message: 'LiveKit credentials missing in .env.local. Provide LIVEKIT_API_KEY, LIVEKIT_API_SECRET, and NEXT_PUBLIC_LIVEKIT_URL to join live cloud rooms.',
        token: null,
        wsUrl: null,
      });
    }

    const at = new AccessToken(apiKey, apiSecret, {
      identity: username,
      name: username,
      ttl: '4h',
    });

    at.addGrant({
      room,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      roomAdmin: isHost,
      roomRecord: isHost,
    });

    const token = await at.toJwt();

    return NextResponse.json({
      success: true,
      source: 'livekit',
      token,
      wsUrl,
      room,
      username,
    });
  } catch (error: any) {
    console.error('LiveKit Token Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate LiveKit room token' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const room = body.room || 'default-room';
    const username = body.username || `User-${Math.floor(Math.random() * 1000)}`;
    const isHost = Boolean(body.isHost);

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

    if (!apiKey || !apiSecret || !wsUrl) {
      return NextResponse.json({
        success: false,
        source: 'mock',
        message: 'LiveKit credentials missing in .env.local. Provide LIVEKIT_API_KEY, LIVEKIT_API_SECRET, and NEXT_PUBLIC_LIVEKIT_URL to join live cloud rooms.',
        token: null,
        wsUrl: null,
      });
    }

    const at = new AccessToken(apiKey, apiSecret, {
      identity: username,
      name: username,
      ttl: '4h',
    });

    at.addGrant({
      room,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      roomAdmin: isHost,
      roomRecord: isHost,
    });

    const token = await at.toJwt();

    return NextResponse.json({
      success: true,
      source: 'livekit',
      token,
      wsUrl,
      room,
      username,
    });
  } catch (error: any) {
    console.error('LiveKit Token POST Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate LiveKit room token' },
      { status: 500 }
    );
  }
}
