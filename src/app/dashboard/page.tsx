'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Video, Plus, Users, Calendar, Brain, MessageSquare,
  Bell, Settings, Archive, CreditCard, Info, ChevronRight,
  Clock, X, CheckSquare, LogOut, Zap
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { useAuth } from '@/lib/useAuth';
import { getInitials } from '@/lib/auth';
import { askMeetingQA } from '@/lib/aiService';
import NewtonsCradleLoader from '@/components/NewtonsCradleLoader';

// ── Types ──────────────────────────────────────────────────────────────────
type Meeting = {
  id: string;
  room_code: string;
  title: string;
  host_name: string;
  host_id?: string;
  scheduled_start: string;
  status: string;
  created_at: string;
};

type Task = {
  id: string;
  title: string;
  assignee_name: string;
  priority: string;
  due_date?: string;
  status: string;
  meeting_title?: string;
};

// ── Sidebar ─────────────────────────────────────────────────────────────────
const Sidebar = ({ open, onClose }: { open: boolean; onClose: () => void }) => (
  <>
    {open && <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40, backdropFilter: 'blur(4px)' }} />}
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 280, zIndex: 50, background: 'var(--color-bg-secondary)', borderRight: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', padding: '1.5rem 1rem' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', paddingLeft: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Video size={14} color="white" />
              </div>
              <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700 }}>MeetFlow</span>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
              <X size={18} />
            </button>
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
            {[
              { icon: Archive, label: 'Archive', href: '/archive' },
              { icon: Brain, label: 'Meeting Summary', href: '/summary/demo' },
              { icon: CheckSquare, label: 'Tasks', href: '/tasks' },
              { icon: MessageSquare, label: 'Q&A Assistant', href: '/qa' },
              { icon: CreditCard, label: 'Plans & Pricing', href: '/plans' },
              { icon: Info, label: 'About MeetFlow', href: '#' },
            ].map(item => {
              const Icon = item.icon;
              return (
                <Link key={item.label} href={item.href} className="nav-item" onClick={onClose}>
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
            <Link href="/settings" className="nav-item" onClick={onClose}>
              <Settings size={18} />
              <span>Settings</span>
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </>
);

// ── Mini Calendar ────────────────────────────────────────────────────────────
const MiniCalendar = ({ meetingDates }: { meetingDates: Date[] }) => {
  const [currentDate] = useState(new Date());
  const [selected, setSelected] = useState<Date | null>(null);
  const days = eachDayOfInterval({ start: startOfMonth(currentDate), end: endOfMonth(currentDate) });
  const firstDayOfWeek = startOfMonth(currentDate).getDay();

  return (
    <div className="glass" style={{ borderRadius: 16, padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <span style={{ fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif" }}>{format(currentDate, 'MMMM yyyy')}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem', marginBottom: '0.5rem' }}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600, padding: '0.25rem 0' }}>{d}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem' }}>
        {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`empty-${i}`} />)}
        {days.map(day => {
          const hasMeeting = meetingDates.some(d => isSameDay(d, day));
          const isSelected = selected && isSameDay(day, selected);
          const todayDay = isToday(day);
          return (
            <div
              key={day.toISOString()}
              className={`cal-day ${hasMeeting ? 'has-event' : ''} ${todayDay ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
              onClick={() => setSelected(day)}
              style={{ fontSize: '0.8125rem', padding: '0.25rem', cursor: 'pointer' }}
            >
              {format(day, 'd')}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── AI Chat Box ──────────────────────────────────────────────────────────────
const AIChatBox = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hi! Ask me anything about your past meetings.' }
  ]);

  const send = async () => {
    if (!query.trim() || loading) return;
    const userQuery = query.trim();
    setQuery('');
    setMessages(m => [...m, { role: 'user', text: userQuery }]);
    setLoading(true);
    try {
      const res = await askMeetingQA(userQuery, '');
      setMessages(m => [...m, { role: 'ai', text: res.answer }]);
    } catch {
      setMessages(m => [...m, { role: 'ai', text: 'Sorry, I encountered an issue. Make sure the AI backend is running.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass" style={{ borderRadius: 16, padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(108,99,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Brain size={16} color="var(--color-accent-light)" />
        </div>
        <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>AI Assistant</div>
      </div>
      <div style={{ maxHeight: 160, overflowY: 'auto', marginBottom: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '85%', padding: '0.5rem 0.875rem', borderRadius: m.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
              background: m.role === 'user' ? 'var(--color-accent)' : 'rgba(255,255,255,0.06)',
              fontSize: '0.8125rem', lineHeight: 1.5,
            }}>{m.text}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ padding: '0.5rem 0.875rem', borderRadius: '12px 12px 12px 2px', background: 'rgba(255,255,255,0.06)', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Thinking...</div>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input id="ai-chat-input" className="input-glass" placeholder="Ask about your meetings..." value={query}
          disabled={loading} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
          style={{ borderRadius: 10, fontSize: '0.8125rem' }} />
        <button onClick={send} disabled={loading} className="btn-primary" style={{ padding: '0.5rem 1rem', borderRadius: 10, whiteSpace: 'nowrap', fontSize: '0.8125rem' }}>
          {loading ? '...' : 'Ask'}
        </button>
      </div>
    </div>
  );
};

// ── Dashboard ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const fetchData = useCallback(async () => {
    setDataLoading(true);
    try {
      const [mRes, tRes] = await Promise.all([
        fetch('/api/meetings'),
        fetch('/api/tasks'),
      ]);
      const mData = await mRes.json();
      const tData = await tRes.json();
      setMeetings(mData.data || []);
      setTasks((tData.data || []).filter((t: Task) => t.status !== 'completed').slice(0, 3));
    } catch {
      setMeetings([]);
      setTasks([]);
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // On-the-spot instant meeting
  const startInstantMeeting = async () => {
    const roomCode = `MF-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    await fetch('/api/meetings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        room_code: roomCode,
        title: 'Instant Meeting',
        host_name: user?.name || 'You',
        host_id: null,
        scheduled_start: new Date().toISOString(),
      }),
    });
    window.location.href = `/meeting/${roomCode}`;
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-primary)' }}>
        <NewtonsCradleLoader size={54} speed={1.2} color="#a78bfa" label="Loading your dashboard..." />
      </div>
    );
  }

  const currentUser = user ?? { name: 'Guest', email: 'guest@meetflow.app', role: 'student', language: 'English', isLoggedIn: false };
  const displayInitials = getInitials(currentUser.name);
  const upcomingMeetings = meetings.filter(m => m.status !== 'ended');
  const meetingDates = upcomingMeetings.map(m => new Date(m.scheduled_start));

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Top Nav */}
      <header style={{ position: 'sticky', top: 0, zIndex: 30, background: 'rgba(9,3,20,0.85)', backdropFilter: 'blur(24px)', borderBottom: '1px solid var(--color-border)', padding: '0 2rem', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(124, 58, 237, 0.4)' }}>
            <Video size={16} color="white" />
          </div>
          <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: '1.125rem', letterSpacing: '-0.02em', color: '#ffffff' }}>
            Meet<span className="gradient-text">Flow</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ position: 'relative' }}>
            <button id="notifications-btn" onClick={() => setNotifOpen(!notifOpen)}
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--color-border)', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
              <Bell size={16} color="var(--color-text-secondary)" />
            </button>
            <AnimatePresence>
              {notifOpen && (
                <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  style={{ position: 'absolute', right: 0, top: '120%', width: 300, zIndex: 50 }} className="glass">
                  <div style={{ borderRadius: 14, padding: '1rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>
                    No new notifications
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button onClick={signOut} title="Sign out" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--color-border)', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <LogOut size={16} color="var(--color-text-secondary)" />
          </button>
          <Link href="/settings">
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}>
              {displayInitials}
            </div>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-container">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>
            {greeting}, <span className="gradient-text">{currentUser.name.split(' ')[0]}</span> 👋
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
            {upcomingMeetings.length > 0 ? `You have ${upcomingMeetings.length} upcoming meeting${upcomingMeetings.length > 1 ? 's' : ''}` : 'No upcoming meetings — create one to get started!'}
          </p>
        </motion.div>

        {/* Primary Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <Link href="/meeting/create" style={{ textDecoration: 'none' }}>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              style={{ background: 'var(--gradient-brand)', borderRadius: 16, padding: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Plus size={22} color="white" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'white' }}>Host a Meeting</div>
                <div style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.7)' }}>Create or schedule</div>
              </div>
            </motion.div>
          </Link>

          <Link href="/meeting/join" style={{ textDecoration: 'none' }}>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="glass glass-hover" style={{ borderRadius: 16, padding: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--color-border)' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(0,212,170,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={22} color="var(--color-teal)" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>Join a Meeting</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Enter room code</div>
              </div>
            </motion.div>
          </Link>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={startInstantMeeting}
            style={{ background: 'rgba(247,37,133,0.1)', border: '1px solid rgba(247,37,133,0.25)', borderRadius: 16, padding: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(247,37,133,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={22} color="#f72585" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>On-the-Spot Meet</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Start instantly</div>
            </div>
          </motion.div>
        </div>

        {/* Grid Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>
          {/* Left: Meetings + Tasks */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Upcoming Meetings */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Upcoming Meetings</h2>
                <Link href="/archive" style={{ fontSize: '0.8125rem', color: 'var(--color-accent-light)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  View archive <ChevronRight size={14} />
                </Link>
              </div>

              {dataLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                  <NewtonsCradleLoader size={36} speed={1.2} color="#a78bfa" label="Loading meetings..." />
                </div>
              ) : upcomingMeetings.length === 0 ? (
                <div className="glass" style={{ borderRadius: 14, padding: '2rem', textAlign: 'center' }}>
                  <Calendar size={32} color="var(--color-text-muted)" style={{ margin: '0 auto 0.75rem' }} />
                  <div style={{ fontWeight: 600, marginBottom: '0.375rem' }}>No upcoming meetings</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>Create your first meeting to get started</div>
                  <Link href="/meeting/create" className="btn-primary" style={{ padding: '0.5rem 1.25rem', borderRadius: 10, textDecoration: 'none', fontSize: '0.875rem' }}>
                    + Host a Meeting
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {upcomingMeetings.map((m, i) => (
                    <motion.div key={m.id} className="glass glass-hover"
                      style={{ borderRadius: 14, padding: '1.125rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}
                      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                      <div style={{ width: 46, height: 46, borderRadius: 12, background: 'rgba(108,99,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Video size={20} color="var(--color-accent-light)" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '0.25rem' }}>{m.title}</div>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Clock size={12} /> {format(new Date(m.scheduled_start), 'MMM d, h:mm a')}
                          </span>
                          <span style={{ fontFamily: 'monospace', background: 'rgba(108,99,255,0.12)', padding: '0 0.4rem', borderRadius: 4 }}>
                            {m.room_code}
                          </span>
                        </div>
                      </div>
                      <Link href={`/meeting/${m.room_code}`}>
                        <button className="btn-teal" style={{ padding: '0.4rem 1rem', fontSize: '0.8125rem' }}>Join</button>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Pending Tasks */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Pending Tasks</h2>
                <Link href="/tasks" style={{ fontSize: '0.8125rem', color: 'var(--color-accent-light)', textDecoration: 'none' }}>View all</Link>
              </div>
              <div className="glass" style={{ borderRadius: 14, padding: '1rem' }}>
                {dataLoading ? (
                  <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>Loading tasks...</div>
                ) : tasks.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--color-text-muted)' }}>
                    <CheckSquare size={28} style={{ margin: '0 auto 0.5rem' }} />
                    <div style={{ fontSize: '0.875rem' }}>No pending tasks</div>
                  </div>
                ) : (
                  tasks.map((t, i) => (
                    <div key={t.id} style={{ padding: '0.75rem 0', borderBottom: i < tasks.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{t.title}</span>
                        <span className={`badge ${t.priority === 'High' ? 'badge-warning' : 'badge-accent'}`}>{t.priority}</span>
                      </div>
                      {t.meeting_title && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>From: {t.meeting_title}</div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right: Calendar + AI Chat */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <MiniCalendar meetingDates={meetingDates} />
            <AIChatBox />
          </div>
        </div>
      </main>
    </div>
  );
}
