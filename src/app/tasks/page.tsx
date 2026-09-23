'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { CheckSquare, Clock, Users, Paperclip, MoreHorizontal, Filter, Search, Brain, AlertCircle, CheckCircle2, Circle, ArrowLeft } from 'lucide-react';
import { format, addDays } from 'date-fns';

const demoTasks = [
  { id: '1', title: 'Implement BFS Algorithm', meeting: 'DSA Lecture — Graphs', assignee: 'All', due: addDays(new Date(), 0), progress: 60, status: 'in-progress', meeting_id: 'DSA-001' },
  { id: '2', title: 'ER Diagram for Library System', meeting: 'DBMS Tutorial', assignee: 'Tejaswini K.', due: addDays(new Date(), 1), progress: 30, status: 'in-progress', meeting_id: 'DBMS-07' },
  { id: '3', title: 'Process Scheduling Report', meeting: 'OS Lab Discussion', assignee: 'All', due: addDays(new Date(), 4), progress: 0, status: 'pending', meeting_id: 'OS-LAB-3' },
  { id: '4', title: 'Network Topology Diagram', meeting: 'CN Lecture', assignee: 'Tejaswini K.', due: addDays(new Date(), -2), progress: 100, status: 'done', meeting_id: 'CN-01' },
  { id: '5', title: 'Algorithm Complexity Analysis', meeting: 'DSA Lecture — Trees', assignee: 'All', due: addDays(new Date(), -1), progress: 45, status: 'overdue', meeting_id: 'DSA-002' },
];

type TaskStatus = 'pending' | 'in-progress' | 'done' | 'overdue';

const statusConfig: Record<TaskStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  'pending': { label: 'Pending', color: 'var(--color-text-muted)', bg: 'rgba(255,255,255,0.06)', icon: <Circle size={14} /> },
  'in-progress': { label: 'In Progress', color: 'var(--color-info)', bg: 'rgba(59,130,246,0.1)', icon: <Clock size={14} /> },
  'done': { label: 'Done', color: 'var(--color-success)', bg: 'rgba(34,197,94,0.1)', icon: <CheckCircle2 size={14} /> },
  'overdue': { label: 'Overdue', color: 'var(--color-danger)', bg: 'rgba(239,68,68,0.1)', icon: <AlertCircle size={14} /> },
};

export default function TasksPage() {
  const [tasks, setTasks] = useState(demoTasks);
  const [filter, setFilter] = useState<'all' | TaskStatus>('all');
  const [search, setSearch] = useState('');
  const [selectedTask, setSelectedTask] = useState<typeof demoTasks[0] | null>(null);
  const [progressInput, setProgressInput] = useState(0);

  const filtered = tasks.filter(t => {
    const matchFilter = filter === 'all' || t.status === filter;
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) || t.meeting.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const updateProgress = (id: string, progress: number) => {
    setTasks(prev => prev.map(t => t.id === id ? {
      ...t, progress,
      status: progress === 100 ? 'done' : progress > 0 ? 'in-progress' : t.status
    } : t));
    setSelectedTask(null);
  };

  const summary = {
    total: tasks.length,
    done: tasks.filter(t => t.status === 'done').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    overdue: tasks.filter(t => t.status === 'overdue').length,
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--color-border)', textDecoration: 'none', color: 'var(--color-text-secondary)' }}>
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Task Dashboard</h1>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Track assignments across all your meetings</p>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Total Tasks', value: summary.total, color: 'var(--color-accent-light)', bg: 'rgba(108,99,255,0.1)' },
            { label: 'In Progress', value: summary.inProgress, color: 'var(--color-info)', bg: 'rgba(59,130,246,0.1)' },
            { label: 'Completed', value: summary.done, color: 'var(--color-success)', bg: 'rgba(34,197,94,0.1)' },
            { label: 'Overdue', value: summary.overdue, color: 'var(--color-danger)', bg: 'rgba(239,68,68,0.1)' },
          ].map((s, i) => (
            <motion.div key={s.label} className="glass" style={{ borderRadius: 14, padding: '1.125rem', textAlign: 'center' }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <div style={{ fontSize: '1.875rem', fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* AI Task detection notice */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.25)', borderRadius: 12, padding: '0.875rem 1rem', marginBottom: '1.5rem' }}>
          <Brain size={18} color="var(--color-accent-light)" />
          <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            <strong style={{ color: 'var(--color-text-primary)' }}>AI Task Agent</strong> auto-detected 3 new action items from today's DSA lecture.
          </span>
          <button style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--color-accent-light)', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>Review →</button>
        </div>

        {/* Filters & Search */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input id="tasks-search" className="input-glass" style={{ paddingLeft: '2.25rem', borderRadius: 10 }} placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '0.25rem', gap: '0.125rem' }}>
            {(['all', 'pending', 'in-progress', 'done', 'overdue'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ padding: '0.4rem 0.875rem', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600, transition: 'all 0.2s', background: filter === f ? 'var(--color-accent)' : 'transparent', color: filter === f ? 'white' : 'var(--color-text-secondary)', textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
                {f === 'in-progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Task List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map((task, i) => {
            const sc = statusConfig[task.status as TaskStatus];
            return (
              <motion.div key={task.id} className="glass glass-hover" style={{ borderRadius: 14, padding: '1.125rem 1.25rem', cursor: 'pointer' }}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                onClick={() => { setSelectedTask(task); setProgressInput(task.progress); }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: sc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: sc.color, flexShrink: 0 }}>
                    {sc.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.375rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{task.title}</span>
                      <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                        <span style={{ background: sc.bg, color: sc.color, borderRadius: 6, padding: '0.2rem 0.6rem', fontSize: '0.75rem', fontWeight: 600 }}>{sc.label}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginBottom: '0.625rem', flexWrap: 'wrap' }}>
                      <span>📋 {task.meeting}</span>
                      <span>👤 {task.assignee}</span>
                      <span style={{ color: task.status === 'overdue' ? 'var(--color-danger)' : 'inherit' }}>
                        🗓️ {format(task.due, 'MMM d')}
                        {task.status === 'overdue' && ' (Overdue)'}
                      </span>
                    </div>
                    {task.status !== 'done' && task.status !== 'pending' && (
                      <div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${task.progress}%` }} />
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>{task.progress}% complete</div>
                      </div>
                    )}
                    {task.status === 'done' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--color-success)' }}>
                        <CheckCircle2 size={14} /> Completed
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
              <CheckSquare size={40} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
              <p>No tasks found</p>
            </div>
          )}
        </div>
      </div>

      {/* Update Progress Modal — FR-34 */}
      <AnimatePresence>
        {selectedTask && (
          <div className="modal-overlay" onClick={() => setSelectedTask(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="glass" style={{ borderRadius: 20, padding: '2rem', width: 420, maxWidth: '90vw' }} onClick={e => e.stopPropagation()}>
              <h2 style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: '0.375rem' }}>Update Progress</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>{selectedTask.title}</p>

              {/* Progress slider */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Progress</label>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-accent-light)' }}>{progressInput}%</span>
                </div>
                <input id="progress-slider" type="range" min="0" max="100" step="5" value={progressInput} onChange={e => setProgressInput(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--color-accent)', cursor: 'pointer' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                  <span>0%</span><span>50%</span><span>100%</span>
                </div>
              </div>

              {/* Quick set buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                {[25, 50, 75, 100].map(v => (
                  <button key={v} onClick={() => setProgressInput(v)}
                    style={{ padding: '0.4rem 0.875rem', borderRadius: 8, border: `1px solid ${progressInput === v ? 'var(--color-accent)' : 'var(--color-border)'}`, background: progressInput === v ? 'rgba(108,99,255,0.12)' : 'transparent', color: progressInput === v ? 'var(--color-accent-light)' : 'var(--color-text-secondary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.8125rem' }}>
                    {v}%
                  </button>
                ))}
                <button onClick={() => setProgressInput(100)}
                  style={{ padding: '0.4rem 0.875rem', borderRadius: 8, border: '1px solid var(--color-success)', background: 'rgba(34,197,94,0.1)', color: 'var(--color-success)', cursor: 'pointer', fontWeight: 600, fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <CheckCircle2 size={13} /> Done
                </button>
              </div>

              {/* Attachment note */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.375rem', display: 'block' }}>Attach document (optional)</label>
                <div style={{ border: '1px dashed var(--color-border)', borderRadius: 10, padding: '0.875rem', textAlign: 'center', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>
                  <Paperclip size={16} style={{ margin: '0 auto 0.25rem', display: 'block' }} /> Click to attach file
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={() => setSelectedTask(null)} className="btn-secondary" style={{ flex: 1, padding: '0.75rem', borderRadius: 12 }}>Cancel</button>
                <button onClick={() => updateProgress(selectedTask.id, progressInput)} className="btn-primary" style={{ flex: 2, padding: '0.75rem', borderRadius: 12 }}>Update Progress</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
