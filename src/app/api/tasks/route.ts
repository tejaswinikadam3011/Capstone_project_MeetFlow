import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function GET() {
  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return NextResponse.json({ success: true, source: 'supabase', data: data || [] });
    }
    return NextResponse.json({ success: true, source: 'none', data: [] });
  } catch (error: any) {
    console.error('Fetch Tasks Error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newTask = {
      title: body.title || 'Untitled Task',
      assignee_name: body.assignee || 'Unassigned',
      priority: body.priority || 'Medium',
      due_date: body.dueDate || null,
      status: 'pending',
      meeting_title: body.meeting_title || '',
      meeting_id: body.meeting_id || null,
      created_at: new Date().toISOString(),
    };
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('tasks').insert([newTask]).select();
      if (error) throw error;
      return NextResponse.json({ success: true, source: 'supabase', data: data[0] });
    }
    return NextResponse.json({ success: false, error: 'Supabase not configured' }, { status: 500 });
  } catch (error: any) {
    console.error('Create Task Error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to create task' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, status } = await req.json();
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('tasks').update({ status }).eq('id', id).select();
      if (error) throw error;
      return NextResponse.json({ success: true, source: 'supabase', data: data[0] });
    }
    return NextResponse.json({ success: false, error: 'Supabase not configured' }, { status: 500 });
  } catch (error: any) {
    console.error('Update Task Error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to update task' }, { status: 500 });
  }
}
