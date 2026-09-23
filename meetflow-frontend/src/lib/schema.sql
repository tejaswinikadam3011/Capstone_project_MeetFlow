-- =====================================================================
-- MeetFlow Production Database Schema (PostgreSQL / Supabase)
-- =====================================================================

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  role TEXT DEFAULT 'student', -- 'student' | 'faculty' | 'admin'
  language_preference TEXT DEFAULT 'en',
  birth_year INT,
  is_adult BOOLEAN DEFAULT true,
  availability_status TEXT DEFAULT 'available', -- 'available' | 'busy' | 'dnd'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Meetings Table
CREATE TABLE IF NOT EXISTS meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  host_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  host_name TEXT NOT NULL,
  scheduled_start TIMESTAMP WITH TIME ZONE,
  scheduled_end TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'scheduled', -- 'scheduled' | 'live' | 'ended' | 'cancelled'
  is_recurring BOOLEAN DEFAULT false,
  password_protected BOOLEAN DEFAULT false,
  meeting_password TEXT,
  waiting_room_enabled BOOLEAN DEFAULT true,
  allow_join_before_host BOOLEAN DEFAULT false,
  auto_record BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Meeting Participants (Catch-up / attendance tracking)
CREATE TABLE IF NOT EXISTS meeting_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'participant', -- 'host' | 'co-host' | 'participant'
  attended BOOLEAN DEFAULT false,
  joined_at TIMESTAMP WITH TIME ZONE,
  left_at TIMESTAMP WITH TIME ZONE,
  added_to_calendar BOOLEAN DEFAULT true,
  UNIQUE (meeting_id, user_id)
);

-- 4. Tasks & Action Items (Detected by AI Task Agent)
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE SET NULL,
  meeting_title TEXT,
  title TEXT NOT NULL,
  description TEXT,
  assignee_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  assignee_name TEXT NOT NULL DEFAULT 'Unassigned',
  priority TEXT DEFAULT 'Medium', -- 'High' | 'Medium' | 'Low'
  due_date TEXT,
  status TEXT DEFAULT 'pending', -- 'pending' | 'in_progress' | 'completed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. AI Summaries & Transcripts (Human-in-the-loop review)
CREATE TABLE IF NOT EXISTS meeting_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  transcript TEXT,
  executive_summary TEXT,
  key_points JSONB DEFAULT '[]'::JSONB,
  decisions JSONB DEFAULT '[]'::JSONB,
  is_approved BOOLEAN DEFAULT false,
  visibility TEXT DEFAULT 'all', -- 'all' | 'absentees'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_summaries ENABLE ROW LEVEL SECURITY;
