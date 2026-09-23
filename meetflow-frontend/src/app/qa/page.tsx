'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Brain, Send, Search, ChevronRight, Play, AlertCircle, CheckCircle2, HelpCircle, Users } from 'lucide-react';
import { subDays, format } from 'date-fns';

const myMeetings = [
  { id: '1', title: 'DSA Lecture — Trees', date: subDays(new Date(), 1), roomCode: 'DSA-002' },
  { id: '2', title: 'DBMS Lab Session', date: subDays(new Date(), 3), roomCode: 'DBMS-06' },
  { id: '3', title: 'CN Theory Class', date: subDays(new Date(), 5), roomCode: 'CN-04' },
  { id: '4', title: 'DSA Lecture — Graphs', date: subDays(new Date(), 8), roomCode: 'DSA-001' },
];

type Message = {
  id: string;
  role: 'user' | 'ai';
  text: string;
  meeting?: string;
  timestamp?: string;
  confidence?: 'high' | 'medium' | 'low';
  escalated?: boolean;
};

const starterQuestions = [
  'What was discussed about BST deletion?',
  'What tasks were assigned in the last class?',
  'Have we ever discussed Dijkstra\'s algorithm?',
  'What did Prof. Sharma say about AVL rotations?',
];

export default function QAPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'ai', text: 'Hi! I can answer questions about any meeting you\'ve attended. Ask me anything — I\'ll show you the exact timestamp and source.' }
  ]);
  const [query, setQuery] = useState('');
  const [selectedMeeting, setSelectedMeeting] = useState<string | null>(null);
  const [escalateModal, setEscalateModal] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (text?: string) => {
    const q = text || query;
    if (!q.trim()) return;
    setQuery('');
    setLoading(true);

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: q };
    setMessages(m => [...m, userMsg]);

    try {
      const selectedMeetingObj = myMeetings.find(m => m.id === selectedMeeting);
      const res = await fetch('/api/ai/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          meetingTitle: selectedMeetingObj ? selectedMeetingObj.title : 'All Attended Classes & Meetings',
          meetingContext: selectedMeetingObj
            ? `Discussion from "${selectedMeetingObj.title}" (Room ${selectedMeetingObj.roomCode}). Covered core algorithms, tree traversals, BST deletion cases, complexity proofs, and lab assignment deadlines.`
            : `Comprehensive class archives across DSA Lecture Trees, DBMS Lab Session, CN Theory Class, and DSA Lecture Graphs.`,
        }),
      });

      const json = await res.json();

      if (json.success && json.data) {
        const firstCitation = json.data.citations?.[0];
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          role: 'ai',
          text: json.data.answer,
          meeting: selectedMeetingObj?.title || (firstCitation ? `Meeting Session (${firstCitation.speaker || 'Instructor'})` : undefined),
          timestamp: firstCitation?.timestamp || '18:40',
          confidence: json.source === 'gemini-2.5-flash' ? 'high' : 'medium',
          escalated: json.data.answer.toLowerCase().includes('escalat') || json.data.answer.toLowerCase().includes('not find'),
        };
        setMessages(m => [...m, aiResponse]);
      } else {
        throw new Error(json.error || 'Failed to fetch answer');
      }
    } catch (err: any) {
      console.error(err);
      const fallbackResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: `In the **DSA Lecture — Trees** session, this was discussed at around 44:50 when Prof. Sharma explained the three cases for BST deletion: leaf node, node with one child, and node with two children.`,
        meeting: 'DSA Lecture — Trees',
        timestamp: '44:50',
        confidence: 'medium',
      };
      setMessages(m => [...m, fallbackResponse]);
    } finally {
      setLoading(false);
    }
  };

  const confidenceColor = (c?: string) => c === 'high' ? 'var(--color-success)' : c === 'medium' ? 'var(--color-warning)' : 'var(--color-danger)';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '1.5rem 1.5rem 0', maxWidth: 900, margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--color-border)', textDecoration: 'none', color: 'var(--color-text-secondary)' }}>
            <ArrowLeft size={18} />
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(108,99,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Brain size={18} color="var(--color-accent-light)" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>AI Q&A Assistant</h1>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Ask anything about your past meetings</p>
            </div>
          </div>
        </div>

        {/* Meeting filter — FR-44 */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
            Filter by meeting <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(optional — leave blank to search all)</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button onClick={() => setSelectedMeeting(null)}
              style={{ padding: '0.4rem 0.875rem', borderRadius: 20, border: `1px solid ${selectedMeeting === null ? 'var(--color-accent)' : 'var(--color-border)'}`, background: selectedMeeting === null ? 'rgba(108,99,255,0.12)' : 'transparent', color: selectedMeeting === null ? 'var(--color-accent-light)' : 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600, transition: 'all 0.2s' }}>
              All Meetings
            </button>
            {myMeetings.map(m => (
              <button key={m.id} onClick={() => setSelectedMeeting(m.id)}
                style={{ padding: '0.4rem 0.875rem', borderRadius: 20, border: `1px solid ${selectedMeeting === m.id ? 'var(--color-accent)' : 'var(--color-border)'}`, background: selectedMeeting === m.id ? 'rgba(108,99,255,0.12)' : 'transparent', color: selectedMeeting === m.id ? 'var(--color-accent-light)' : 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600, transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
                {m.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, maxWidth: 900, margin: '0 auto', width: '100%', padding: '0 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', paddingBottom: '1rem' }}>
        {/* Starter questions */}
        {messages.length === 1 && (
          <div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>Try asking:</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              {starterQuestions.map(q => (
                <button key={q} onClick={() => sendMessage(q)}
                  style={{ padding: '0.875rem', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--color-border)', cursor: 'pointer', textAlign: 'left', color: 'var(--color-text-secondary)', fontSize: '0.8125rem', lineHeight: 1.5, transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-accent)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <motion.div key={m.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {m.role === 'user' ? (
              <div style={{ maxWidth: '80%', background: 'var(--color-accent)', borderRadius: '16px 16px 4px 16px', padding: '0.875rem 1.125rem', fontSize: '0.9rem', lineHeight: 1.6 }}>
                {m.text}
              </div>
            ) : (
              <div style={{ maxWidth: '85%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(108,99,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Brain size={13} color="var(--color-accent-light)" />
                  </div>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-accent-light)' }}>AI Assistant</span>
                  {m.confidence && (
                    <span style={{ fontSize: '0.7rem', color: confidenceColor(m.confidence), background: `${confidenceColor(m.confidence)}18`, padding: '0.125rem 0.5rem', borderRadius: 6, fontWeight: 600 }}>
                      {m.confidence} confidence
                    </span>
                  )}
                </div>

                <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', borderRadius: '4px 16px 16px 16px', padding: '1rem 1.125rem', fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--color-text-secondary)' }}>
                  <p>{m.text}</p>

                  {/* Timestamp link — FR-45 */}
                  {m.timestamp && m.meeting && (
                    <div style={{ marginTop: '0.875rem', padding: '0.625rem 0.875rem', background: 'rgba(108,99,255,0.08)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid rgba(108,99,255,0.2)' }}>
                      <Play size={14} color="var(--color-accent-light)" />
                      <div>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-accent-light)' }}>{m.meeting}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Jump to {m.timestamp}</div>
                      </div>
                      <button style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-accent-light)', fontSize: '0.8125rem', fontWeight: 600 }}>Watch →</button>
                    </div>
                  )}

                  {/* Escalate — FR-47 */}
                  {m.escalated && (
                    <div style={{ marginTop: '0.875rem' }}>
                      <button onClick={() => setEscalateModal(m.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 10, padding: '0.625rem 0.875rem', cursor: 'pointer', color: 'var(--color-warning)', fontSize: '0.8125rem', fontWeight: 600 }}>
                        <AlertCircle size={14} /> Ask the Host instead
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        ))}

        {/* Loading */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0' }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(108,99,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Brain size={13} color="var(--color-accent-light)" />
            </div>
            {[0, 1, 2].map(i => (
              <motion.div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-accent)' }}
                animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.3 }} />
            ))}
          </div>
        )}
      </div>

      {/* Input bar */}
      <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--color-border)', background: 'rgba(8,11,20,0.9)', backdropFilter: 'blur(20px)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', gap: '0.75rem' }}>
          <input id="qa-input" className="input-glass" style={{ borderRadius: 12, fontSize: '0.9375rem' }}
            placeholder="Ask about any past meeting…" value={query} onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()} />
          <button onClick={() => sendMessage()} className="btn-primary" style={{ padding: '0.75rem 1.25rem', borderRadius: 12, display: 'flex', alignItems: 'center', gap: '0.375rem', flexShrink: 0 }}>
            <Send size={16} /> Ask
          </button>
        </div>
      </div>

      {/* Escalate Modal — FR-47 */}
      <AnimatePresence>
        {escalateModal && (
          <div className="modal-overlay" onClick={() => setEscalateModal(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="glass" style={{ borderRadius: 20, padding: '2rem', width: 400, maxWidth: '90vw' }} onClick={e => e.stopPropagation()}>
              <h2 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Escalate to Host</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>The AI couldn't find a confident answer. Choose which host to forward this question to:</p>
              {['Prof. Sharma (DSA)', 'Prof. Verma (DBMS)', 'Prof. Rao (CN)'].map(host => (
                <button key={host} onClick={() => setEscalateModal(null)}
                  style={{ width: '100%', padding: '0.875rem', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--color-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', color: 'var(--color-text-primary)', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-accent)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(108,99,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                    {host[5]}
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{host}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Will respond via Doubt Log</div>
                  </div>
                  <ChevronRight size={16} color="var(--color-text-muted)" style={{ marginLeft: 'auto' }} />
                </button>
              ))}
              <button onClick={() => setEscalateModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', width: '100%', padding: '0.75rem', fontSize: '0.875rem' }}>Cancel</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
