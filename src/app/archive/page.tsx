'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Calendar, Video, Search, ChevronRight, Archive, Users, Clock } from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';

const pastMeetings = [
  { id: '1', title: 'DSA Lecture — Trees', roomCode: 'DSA-002', date: subDays(new Date(), 1), duration: '1h 20m', participants: 42, isHost: true, hasSummary: true, hasRecording: true },
  { id: '2', title: 'DBMS Lab Session', roomCode: 'DBMS-06', date: subDays(new Date(), 3), duration: '2h', participants: 18, isHost: false, hasSummary: true, hasRecording: true },
  { id: '3', title: 'CN Theory Class', roomCode: 'CN-04', date: subDays(new Date(), 5), duration: '50m', participants: 55, isHost: false, hasSummary: false, hasRecording: true },
  { id: '4', title: 'Project Planning Meet', roomCode: 'PROJ-21', date: subDays(new Date(), 7), duration: '45m', participants: 6, isHost: true, hasSummary: true, hasRecording: false },
  { id: '5', title: 'DSA Lecture — Graphs', roomCode: 'DSA-001', date: subDays(new Date(), 8), duration: '1h 30m', participants: 45, isHost: true, hasSummary: true, hasRecording: true },
  { id: '6', title: 'OS Lecture — Scheduling', roomCode: 'OS-03', date: subDays(new Date(), 12), duration: '1h', participants: 39, isHost: false, hasSummary: true, hasRecording: true },
];

export default function ArchivePage() {
  const [tab, setTab] = useState<'joined' | 'hosted'>('joined');
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth] = useState(new Date());

  const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
  const firstDow = startOfMonth(currentMonth).getDay();

  const filtered = pastMeetings.filter(m => {
    const tabMatch = tab === 'hosted' ? m.isHost : !m.isHost;
    const searchMatch = m.title.toLowerCase().includes(search.toLowerCase()) || m.roomCode.toLowerCase().includes(search.toLowerCase());
    const dateMatch = !selectedDate || isSameDay(m.date, selectedDate);
    return tabMatch && searchMatch && dateMatch;
  });

  const meetingDates = pastMeetings.filter(m => tab === 'hosted' ? m.isHost : !m.isHost).map(m => m.date);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--color-border)', textDecoration: 'none', color: 'var(--color-text-secondary)' }}>
            <ArrowLeft size={18} />
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(108,99,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Archive size={18} color="var(--color-accent-light)" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Archive</h1>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Past meetings, recordings, and summaries</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem' }}>
          {/* Left: Calendar + Search */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Tabs — FR-49 */}
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '0.25rem' }}>
              {(['joined', 'hosted'] as const).map(t => (
                <button key={t} onClick={() => { setTab(t); setSelectedDate(null); }}
                  style={{ flex: 1, padding: '0.5rem', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', transition: 'all 0.2s', background: tab === t ? 'var(--color-accent)' : 'transparent', color: tab === t ? 'white' : 'var(--color-text-secondary)', textTransform: 'capitalize' }}>
                  {t === 'joined' ? '👤 Joined' : '🎙️ Hosted'}
                </button>
              ))}
            </div>

            {/* Archive Calendar */}
            <div className="glass" style={{ borderRadius: 16, padding: '1.25rem' }}>
              <div style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.9375rem' }}>{format(currentMonth, 'MMMM yyyy')}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem', marginBottom: '0.5rem' }}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                  <div key={i} style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600, padding: '0.25rem 0' }}>{d}</div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem' }}>
                {Array.from({ length: firstDow }).map((_, i) => <div key={`e-${i}`} />)}
                {days.map(day => {
                  const hasMeeting = meetingDates.some(d => isSameDay(d, day));
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  return (
                    <div key={day.toISOString()}
                      className={`cal-day ${hasMeeting ? 'has-event' : ''} ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedDate(isSelected ? null : day)}
                      style={{ fontSize: '0.8125rem', padding: '0.25rem', cursor: hasMeeting ? 'pointer' : 'default', opacity: hasMeeting ? 1 : 0.4 }}>
                      {format(day, 'd')}
                    </div>
                  );
                })}
              </div>
              {selectedDate && (
                <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>{format(selectedDate, 'MMMM d, yyyy')}</span>
                  <button onClick={() => setSelectedDate(null)} style={{ fontSize: '0.75rem', color: 'var(--color-accent-light)', background: 'none', border: 'none', cursor: 'pointer' }}>Clear</button>
                </div>
              )}
            </div>

            {/* Search — FR-51 */}
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input id="archive-search" className="input-glass" style={{ paddingLeft: '2.25rem', borderRadius: 12 }} placeholder="Search by topic or title..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

          {/* Right: Meeting list */}
          <div>
            <div style={{ fontWeight: 700, marginBottom: '1rem', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
              {filtered.length} meeting{filtered.length !== 1 ? 's' : ''} {selectedDate ? `on ${format(selectedDate, 'MMM d')}` : 'found'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {filtered.map((m, i) => (
                <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link href={`/archive/${m.id}`} style={{ textDecoration: 'none' }}>
                    <div className="glass glass-hover" style={{ borderRadius: 14, padding: '1.125rem 1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: m.isHost ? 'rgba(108,99,255,0.15)' : 'rgba(0,212,170,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Video size={20} color={m.isHost ? 'var(--color-accent-light)' : 'var(--color-teal)'} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.375rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{m.title}</span>
                          <span className={`badge ${m.isHost ? 'badge-accent' : 'badge-teal'}`} style={{ flexShrink: 0 }}>{m.isHost ? 'Host' : 'Attended'}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Calendar size={12} /> {format(m.date, 'MMM d, yyyy')}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={12} /> {m.duration}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Users size={12} /> {m.participants} participants</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {m.hasRecording && <span className="badge badge-accent" style={{ fontSize: '0.7rem' }}>🎥 Recording</span>}
                          {m.hasSummary && <span className="badge badge-teal" style={{ fontSize: '0.7rem' }}>📝 Summary</span>}
                          {!m.hasSummary && <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>⏳ Pending Review</span>}
                        </div>
                      </div>
                      <ChevronRight size={16} color="var(--color-text-muted)" style={{ flexShrink: 0, marginTop: 4 }} />
                    </div>
                  </Link>
                </motion.div>
              ))}
              {filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--color-text-muted)' }}>
                  <Archive size={40} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
                  <p>No meetings found</p>
                  {search && <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Try a different search term</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
