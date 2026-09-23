'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Video, Plus, Users, Calendar, Brain, MessageSquare,
  Bell, Settings, Archive, CreditCard, Info, ChevronRight,
  Clock, Mic, MicOff, VideoOff, MoreHorizontal, X, Menu, CheckSquare
} from 'lucide-react';
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isFuture } from 'date-fns';

// ── Demo Data ──────────────────────────────────────────────────────────────
const demoUser = { name: 'Tejaswini Kadam', email: 'tejaswini@college.edu', avatar: 'T', role: 'host' };

const demoMeetings = [
  { id: '1', title: 'DSA Lecture — Graphs', roomCode: 'DSA-001', date: addDays(new Date(), 1), time: '10:00 AM', duration: '1h 30m', participants: 45, isHost: true, status: 'upcoming' },
  { id: '2', title: 'Project Team Sync', roomCode: 'PROJ-22', date: addDays(new Date(), 2), time: '3:00 PM', duration: '45m', participants: 8, isHost: true, status: 'upcoming' },
  { id: '3', title: 'DBMS Tutorial', roomCode: 'DBMS-07', date: addDays(new Date(), 3), time: '11:30 AM', duration: '1h', participants: 38, isHost: false, status: 'upcoming' },
  { id: '4', title: 'OS Lab Discussion', roomCode: 'OS-LAB-3', date: addDays(new Date(), 5), time: '2:00 PM', duration: '2h', participants: 22, isHost: false, status: 'upcoming' },
];

const demoNotifications = [
  { id: '1', text: 'DSA Lecture starts in 30 minutes', time: '9:30 AM', type: 'reminder' },
  { id: '2', text: 'Task "Implement BFS" is due today', time: '8:00 AM', type: 'task' },
  { id: '3', text: 'Prof. Sharma approved summary for OS Lab', time: 'Yesterday', type: 'summary' },
];

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

// Mini Calendar
const MiniCalendar = ({ meetings }: { meetings: typeof demoMeetings }) => {
  const [currentDate] = useState(new Date());
  const [selected, setSelected] = useState<Date | null>(null);
  const days = eachDayOfInterval({ start: startOfMonth(currentDate), end: endOfMonth(currentDate) });
  const firstDayOfWeek = startOfMonth(currentDate).getDay();
  const meetingDates = meetings.map(m => m.date);

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

// AI Chat Box (FR-6)
const AIChatBox = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hi! Ask me anything about your past meetings.' }
  ]);

  const send = () => {
    if (!query.trim()) return;
    setMessages(m => [...m, { role: 'user', text: query }, { role: 'ai', text: `Searching your meetings for "${query}"... In the DSA Lecture on ${format(addDays(new Date(), -3), 'MMM dd')}, Prof. Sharma discussed graph traversal at 42:15. [Jump to timestamp →]` }]);
    setQuery('');
  };

  return (
    <div className="glass" style={{ borderRadius: 16, padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(108,99,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Brain size={16} color="var(--color-accent-light)" />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>AI Assistant</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Ask about any past meeting</div>
        </div>
      </div>

      <div style={{ maxHeight: 160, overflowY: 'auto', marginBottom: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '85%', padding: '0.5rem 0.875rem', borderRadius: m.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
              background: m.role === 'user' ? 'var(--color-accent)' : 'rgba(255,255,255,0.06)',
              fontSize: '0.8125rem', lineHeight: 1.5,
            }}>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          id="ai-chat-input"
          className="input-glass"
          placeholder="What was discussed about graphs?"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          style={{ borderRadius: 10, fontSize: '0.8125rem' }}
        />
        <button onClick={send} className="btn-primary" style={{ padding: '0.5rem 1rem', borderRadius: 10, whiteSpace: 'nowrap', fontSize: '0.8125rem' }}>
          Ask
        </button>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Top Nav */}
      <header style={{ position: 'sticky', top: 0, zIndex: 30, background: 'rgba(8,11,20,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--color-border)', padding: '0 1.5rem', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', display: 'flex', padding: '0.25rem' }}>
            <Menu size={20} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Video size={13} color="white" />
            </div>
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: '1rem' }}>MeetFlow</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Notification bell */}
          <div style={{ position: 'relative' }}>
            <button
              id="notifications-btn"
              onClick={() => setNotifOpen(!notifOpen)}
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--color-border)', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}
            >
              <Bell size={16} color="var(--color-text-secondary)" />
              <div style={{ position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: '50%', background: 'var(--color-accent)', border: '1.5px solid var(--color-bg-primary)' }} />
            </button>
            <AnimatePresence>
              {notifOpen && (
                <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  style={{ position: 'absolute', right: 0, top: '120%', width: 320, zIndex: 50 }} className="glass" >
                  <div style={{ borderRadius: 14, overflow: 'hidden' }}>
                    <div style={{ padding: '1rem 1rem 0.5rem', fontWeight: 700, fontSize: '0.875rem' }}>Notifications</div>
                    {demoNotifications.map(n => (
                      <div key={n.id} style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.type === 'reminder' ? 'var(--color-accent)' : n.type === 'task' ? 'var(--color-warning)' : 'var(--color-success)', marginTop: 5 }} />
                        <div>
                          <div style={{ fontSize: '0.8125rem' }}>{n.text}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 2 }}>{n.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Avatar */}
          <Link href="/settings">
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}>
              {demoUser.avatar}
            </div>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>
            {greeting}, <span className="gradient-text">{demoUser.name.split(' ')[0]}</span> 👋
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>You have {demoMeetings.length} upcoming meetings</p>
        </motion.div>

        {/* Primary Actions — FR-4 */}
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

          {/* On-the-Spot Meet — FR-5 */}
          <Link href="/meeting/DSA-001" style={{ textDecoration: 'none' }}>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              style={{ background: 'rgba(247,37,133,0.1)', border: '1px solid rgba(247,37,133,0.25)', borderRadius: 16, padding: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(247,37,133,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Video size={22} color="#f72585" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>On-the-Spot Meet</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Start instantly</div>
              </div>
            </motion.div>
          </Link>
        </div>

        {/* Grid Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>
          {/* Left: Upcoming Meetings */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Upcoming Meetings</h2>
                <Link href="/archive" style={{ fontSize: '0.8125rem', color: 'var(--color-accent-light)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  View archive <ChevronRight size={14} />
                </Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {demoMeetings.map((m, i) => (
                  <motion.div
                    key={m.id}
                    className="glass glass-hover"
                    style={{ borderRadius: 14, padding: '1.125rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                  >
                    <div style={{ width: 46, height: 46, borderRadius: 12, background: m.isHost ? 'rgba(108,99,255,0.15)' : 'rgba(0,212,170,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Video size={20} color={m.isHost ? 'var(--color-accent-light)' : 'var(--color-teal)'} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{m.title}</span>
                        <span className={`badge ${m.isHost ? 'badge-accent' : 'badge-teal'}`}>{m.isHost ? 'Host' : 'Participant'}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Calendar size={12} /> {format(m.date, 'MMM d')}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={12} /> {m.time}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Users size={12} /> {m.participants}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link href={`/meeting/${m.roomCode}`}>
                        <button className="btn-teal" style={{ padding: '0.4rem 1rem', fontSize: '0.8125rem' }}>Join</button>
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Tasks quick view */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Pending Tasks</h2>
                <Link href="/tasks" style={{ fontSize: '0.8125rem', color: 'var(--color-accent-light)', textDecoration: 'none' }}>View all</Link>
              </div>
              <div className="glass" style={{ borderRadius: 14, padding: '1rem' }}>
                {[{ name: 'Implement BFS Algorithm', due: 'Today', progress: 60, meeting: 'DSA Lecture' },
                  { name: 'ER Diagram for Library System', due: 'Tomorrow', progress: 30, meeting: 'DBMS Tutorial' },
                ].map((t, i) => (
                  <div key={i} style={{ padding: '0.75rem 0', borderBottom: i === 0 ? '1px solid var(--color-border)' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{t.name}</span>
                      <span className={`badge ${t.due === 'Today' ? 'badge-warning' : 'badge-accent'}`}>{t.due}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>{t.meeting}</div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${t.progress}%` }} />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>{t.progress}% complete</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Calendar + AI Chat */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <MiniCalendar meetings={demoMeetings} />
            <AIChatBox />
          </div>
        </div>
      </main>
    </div>
  );
}
