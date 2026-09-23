'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Video, Clock, Users, Calendar, Play, Download, Brain, Hash } from 'lucide-react';
import { subDays, format } from 'date-fns';

const meeting = {
  id: '1',
  title: 'DSA Lecture — Trees',
  roomCode: 'DSA-002',
  date: subDays(new Date(), 1),
  duration: '1h 20m',
  participants: 42,
  isHost: true,
  summary: `This session covered Binary Trees and Binary Search Trees (BST). Prof. Sharma started with a recap of linked lists, then introduced tree terminology (root, node, leaf, depth, height). Key topics: pre-order, in-order, post-order traversal, BST insertion/deletion, and balanced trees (AVL). Three practice problems were assigned: implement BST from scratch, write all three traversals, and implement tree height calculation.`,
  highlights: [
    { time: '08:32', topic: 'Tree terminology and structure' },
    { time: '22:15', topic: 'Tree traversal algorithms' },
    { time: '44:50', topic: 'BST insertion & deletion' },
    { time: '58:10', topic: 'AVL trees & rotations' },
    { time: '1:12:30', topic: 'Q&A and practice problems' },
  ],
  tasks: [
    { title: 'Implement BST from scratch', due: 'In 2 days', progress: 30 },
    { title: 'Write all three traversals', due: 'In 2 days', progress: 0 },
    { title: 'Implement tree height calculation', due: 'In 3 days', progress: 0 },
  ],
};

export default function ArchiveEntryPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <Link href="/archive" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--color-border)', textDecoration: 'none', color: 'var(--color-text-secondary)' }}>
            <ArrowLeft size={18} />
          </Link>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <h1 style={{ fontSize: '1.375rem', fontWeight: 700 }}>{meeting.title}</h1>
              <span className={`badge ${meeting.isHost ? 'badge-accent' : 'badge-teal'}`}>{meeting.isHost ? 'Host' : 'Attended'}</span>
            </div>
            <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.8125rem', color: 'var(--color-text-muted)', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Calendar size={12} /> {format(meeting.date, 'MMMM d, yyyy')}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={12} /> {meeting.duration}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Users size={12} /> {meeting.participants} participants</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Hash size={12} /> {meeting.roomCode}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Recording Player */}
          <motion.div className="glass" style={{ borderRadius: 16, overflow: 'hidden' }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ aspectRatio: '16/9', background: '#0a0d16', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <div style={{ textAlign: 'center' }}>
                <button style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--color-accent)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem', boxShadow: '0 0 30px rgba(108,99,255,0.4)' }}>
                  <Play size={26} color="white" style={{ marginLeft: 4 }} />
                </button>
                <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Click to play recording</div>
              </div>
              <div style={{ position: 'absolute', bottom: 12, right: 12, display: 'flex', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', background: 'rgba(0,0,0,0.6)', padding: '0.25rem 0.625rem', borderRadius: 6 }}>{meeting.duration}</span>
              </div>
            </div>
            <div style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border)' }}>
              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Session Recording</span>
              <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '0.5rem 0.875rem', cursor: 'pointer', color: 'var(--color-text-secondary)', fontSize: '0.8125rem', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-accent)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}>
                <Download size={14} /> Download
              </button>
            </div>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.5rem' }}>
            {/* Left: Summary */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* AI Summary — FR-50 */}
              <motion.div className="glass" style={{ borderRadius: 16, padding: '1.5rem' }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(108,99,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Brain size={16} color="var(--color-accent-light)" />
                  </div>
                  <span style={{ fontWeight: 700 }}>AI Summary</span>
                  <span className="badge badge-teal" style={{ fontSize: '0.7rem', marginLeft: 'auto' }}>Approved</span>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>{meeting.summary}</p>

                {meeting.isHost && (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '0.75rem' }}>
                    <Link href={`/summary/${meeting.id}`} className="btn-secondary" style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem', borderRadius: 10, textDecoration: 'none' }}>Edit Summary</Link>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '0.8125rem', cursor: 'pointer' }}>
                      <Download size={13} /> Export PDF
                    </button>
                  </div>
                )}
              </motion.div>

              {/* Highlights / Timestamp reel */}
              <motion.div className="glass" style={{ borderRadius: 16, padding: '1.5rem' }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <div style={{ fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  🎬 Highlight Reel
                </div>
                {meeting.highlights.map((h, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.875rem', alignItems: 'center', padding: '0.625rem 0', borderBottom: i < meeting.highlights.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                    <button style={{ background: 'rgba(108,99,255,0.12)', border: 'none', borderRadius: 8, padding: '0.375rem 0.75rem', cursor: 'pointer', color: 'var(--color-accent-light)', fontSize: '0.8125rem', fontFamily: 'monospace', fontWeight: 700, flexShrink: 0, transition: 'all 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(108,99,255,0.25)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(108,99,255,0.12)'}>
                      {h.time}
                    </button>
                    <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{h.topic}</span>
                    <Play size={14} color="var(--color-text-muted)" style={{ marginLeft: 'auto', flexShrink: 0 }} />
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right: Tasks */}
            <motion.div className="glass" style={{ borderRadius: 16, padding: '1.25rem', alignSelf: 'start' }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div style={{ fontWeight: 700, marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Tasks Assigned
                <Link href="/tasks" style={{ fontSize: '0.75rem', color: 'var(--color-accent-light)', textDecoration: 'none' }}>View all</Link>
              </div>
              {meeting.tasks.map((t, i) => (
                <div key={i} style={{ paddingBottom: '0.875rem', marginBottom: '0.875rem', borderBottom: i < meeting.tasks.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>{t.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.375rem' }}>Due: {t.due}</div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${t.progress}%` }} />
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>{t.progress}%</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
