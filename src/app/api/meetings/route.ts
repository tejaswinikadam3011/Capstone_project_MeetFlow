import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// In-memory fallback cache when Supabase is not yet configured
let localMeetings = [
  {
    id: 'm1',
    room_code: 'DSA-001',
    title: 'DSA Lecture — Graphs & BFS/DFS',
    host_name: 'Prof. Sharma',
    scheduled_start: new Date(Date.now() + 3600000).toISOString(),
    status: 'scheduled',
    is_recurring: true,
    password_protected: false,
    waiting_room_enabled: true,
    allow_join_before_host: false,
    auto_record: true,
  },
  {
    id: 'm2',
    room_code: 'DBMS-04',
    title: 'DBMS Lab — SQL Triggers',
    host_name: 'Prof. Verma',
    scheduled_start: new Date(Date.now() + 7200000).toISOString(),
    status: 'scheduled',
    is_recurring: false,
    password_protected: true,
    waiting_room_enabled: true,
    allow_join_before_host: true,
    auto_record: true,
  }
];

export async function GET() {
  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('meetings').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return NextResponse.json({ success: true, source: 'supabase', data });
    }

    return NextResponse.json({
      success: true,
      source: 'in-memory',
      message: 'Using in-memory store. Add Supabase keys to .env.local for persistent PostgreSQL storage.',
      data: localMeetings,
    });
  } catch (error: any) {
    console.error('Fetch Meetings Error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to fetch meetings' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const newMeeting = {
      id: `m_${Date.now()}`,
      room_code: body.room_code || `MEET-${Math.floor(100 + Math.random() * 900)}`,
      title: body.title || 'Untitled Meeting',
      host_name: body.host_name || 'You',
      scheduled_start: body.scheduled_start || new Date().toISOString(),
      status: 'scheduled',
      is_recurring: Boolean(body.is_recurring),
      password_protected: Boolean(body.password_protected),
      meeting_password: body.meeting_password || '',
      waiting_room_enabled: body.waiting_room_enabled !== false,
      allow_join_before_host: Boolean(body.allow_join_before_host),
      auto_record: body.auto_record !== false,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('meetings').insert([newMeeting]).select();
      if (error) throw error;
      return NextResponse.json({ success: true, source: 'supabase', data: data[0] });
    }

    localMeetings.unshift(newMeeting);

    return NextResponse.json({
      success: true,
      source: 'in-memory',
      message: 'Meeting created in memory. Configure Supabase in .env.local for PostgreSQL persistence.',
      data: newMeeting,
    });
  } catch (error: any) {
    console.error('Create Meeting Error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to create meeting' }, { status: 500 });
  }
}
