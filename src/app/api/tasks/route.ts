import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

let localTasks = [
  { id: '1', title: 'Implement LiveKit Token Generation API', assignee: 'Backend Lead', priority: 'High', dueDate: 'Tomorrow, 5:00 PM', status: 'completed', meeting_title: 'Sprint Kickoff' },
  { id: '2', title: 'Prepare DSA Traversal Code Submission', assignee: 'You', priority: 'High', dueDate: 'Friday, 11:59 PM', status: 'pending', meeting_title: 'DSA Lecture — Trees' },
  { id: '3', title: 'Review Attendance & Doubt Log for Absentees', assignee: 'Prof. Sharma', priority: 'Medium', dueDate: 'Next Monday', status: 'pending', meeting_title: 'DSA Lecture — Trees' },
  { id: '4', title: 'Configure PostgreSQL Database Schema in Supabase', assignee: 'DevOps', priority: 'Medium', dueDate: 'Thursday, 3:00 PM', status: 'completed', meeting_title: 'Architecture Review' },
];

export async function GET() {
  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return NextResponse.json({ success: true, source: 'supabase', data });
    }

    return NextResponse.json({
      success: true,
      source: 'in-memory',
      data: localTasks,
    });
  } catch (error: any) {
    console.error('Fetch Tasks Error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const newTask = {
      id: `task_${Date.now()}`,
      title: body.title || 'Untitled Task',
      assignee: body.assignee || 'Unassigned',
      priority: body.priority || 'Medium',
      dueDate: body.dueDate || 'TBD',
      status: 'pending',
      meeting_title: body.meeting_title || 'General Meeting',
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('tasks').insert([newTask]).select();
      if (error) throw error;
      return NextResponse.json({ success: true, source: 'supabase', data: data[0] });
    }

    localTasks.unshift(newTask);
    return NextResponse.json({ success: true, source: 'in-memory', data: newTask });
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

    localTasks = localTasks.map(t => (t.id === id ? { ...t, status } : t));
    return NextResponse.json({ success: true, source: 'in-memory', data: { id, status } });
  } catch (error: any) {
    console.error('Update Task Error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to update task' }, { status: 500 });
  }
}
