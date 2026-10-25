import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function GET() {
  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return NextResponse.json({ success: true, source: 'supabase', data: data || [] });
    }
    return NextResponse.json({ success: true, source: 'none', data: [] });
  } catch (error: any) {
    console.error('Fetch Meetings Error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to fetch meetings' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newMeeting = {
      room_code: body.room_code || `MF-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      title: body.title || 'Untitled Meeting',
      host_name: body.host_name || 'You',
      host_id: body.host_id || null,
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
    return NextResponse.json({ success: false, error: 'Supabase not configured' }, { status: 500 });
  } catch (error: any) {
    console.error('Create Meeting Error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to create meeting' }, { status: 500 });
  }
}
