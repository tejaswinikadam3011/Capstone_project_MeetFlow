'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft, Brain, Send, Play, AlertCircle,
  ChevronRight, Sparkles, Clock, Users, MessageSquare,
} from 'lucide-react';
import { format } from 'date-fns';
import NewtonsCradleLoader from '@/components/NewtonsCradleLoader';

// ── Types ──────────────────────────────────────────────────────────────────
type Citation = { timestamp: string; speaker: string; note: string };

type Message = {
  id: string;
  role: 'user' | 'ai';
  text: string;
  citations?: Citation[];
  relatedTopics?: string[];
  meeting?: string;
  source?: string;
  error?: boolean;
};

type MeetingOption = {
  id: string;
  title: string;
  room_code: string;
  created_at: string;
  mom_summary?: string;     // stored MoM executive summary
  transcript?: string;      // stored transcript
};

const STARTER_QUESTIONS = [
  'What were the main decisions made?',
  'What action items were assigned?',
  'Summarize the key discussion points.',
  'Who was responsible for which tasks?',
];

// ── Component ──────────────────────────────────────────────────────────────
export default function QAPage() {
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [meetings, setMeetings] = useState<MeetingOption[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingOption | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'ai',
      text: "Hi! I'm your MeetFlow AI assistant. Select a meeting below and ask me anything about it — I'll answer based on the actual transcript and minutes.",
    },
  ]);
  // Keep track of conversation turns for multi-turn context
  const [chatHistory, setChatHistory] = useState<{ question: string; answer: string }[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMeetings, setLoadingMeetings] = useState(true);
  const [escalateModal, setEscalateModal] = useState(false);

  // Load meetings from API
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/meetings');
        const json = await res.json();
        if (json.success && json.data?.length) {
          setMeetings(json.data);
        }
      } catch {
        // silently ignore — user can still ask general questions
      } finally {
        setLoadingMeetings(false);
      }
    };
    load();
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const buildContext = (meeting: MeetingOption | null) => {
    if (!meeting) return '';
    const parts: string[] = [];
    if (meeting.title) parts.push(`Meeting: ${meeting.title}`);
    if (meeting.room_code) parts.push(`Room: ${meeting.room_code}`);
    if (meeting.created_at) parts.push(`Date: ${format(new Date(meeting.created_at), 'PPP')}`);
    if (meeting.mom_summary) parts.push(`\nMinutes of Meeting:\n${meeting.mom_summary}`);
    if (meeting.transcript) parts.push(`\nTranscript:\n${meeting.transcript}`);
    return parts.join('\n');
  };

  const sendMessage = async (text?: string) => {
    const q = (text || query).trim();
    if (!q || loading) return;
    setQuery('');
    setLoading(true);

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: q };
    setMessages(m => [...m, userMsg]);

    try {
      const res = await fetch('/api/ai/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          meetingTitle: selectedMeeting?.title || 'All Meetings',
          meetingContext: buildContext(selectedMeeting),
          chatHistory, // send full conversation history for multi-turn
        }),
      });

      const json = await res.json();

      if (json.success && json.data) {
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'ai',
          text: json.data.answer,
          citations: json.data.citations || [],
          relatedTopics: json.data.relatedTopics || [],
          meeting: selectedMeeting?.title,
          source: json.source,
        };
        setMessages(m => [...m, aiMsg]);
        // Append to history for next turn
        setChatHistory(h => [...h, { question: q, answer: json.data.answer }]);
      } else {
        throw new Error(json.error || 'No response from AI');
      }
    } catch (err: any) {
      setMessages(m => [...m, {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: `Sorry, I couldn't process that question. ${err.message || ''}`,
        error: true,
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleMeetingSelect = (m: MeetingOption | null) => {
    setSelectedMeeting(m);
    setChatHistory([]); // reset history when switching meeting
    const contextMsg = m
      ? `Switched context to **${m.title}**. Ask me anything about this meeting.`
      : 'Now searching across all your meetings.';
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', text: contextMsg }]);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', display: 'flex', flexDirection: 'column' }}>

      {/* ── Header ── */}
      <div style={{ padding: '1.25rem 1.5rem 0', maxWidth: 860, margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--color-border)', textDecoration: 'none', color: 'var(--color-text-secondary)' }}>
            <ArrowLeft size={18} />
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,rgba(108,99,255,0.3),rgba(168,85,247,0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Brain size={18} color="var(--color-accent-light)" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>AI Q&amp;A Assistant</h1>
              <p style={{ fontSize: '0.775rem', color: 'var(--color-text-muted)', margin: 0 }}>Powered by Groq AI · Ask anything about your meetings</p>
            </div>
          </div>
        </div>

        {/* Meeting selector */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <Users size={12} /> Select meeting context
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleMeetingSelect(null)}
              style={{ padding: '0.375rem 0.875rem', borderRadius: 20, border: `1px solid ${!selectedMeeting ? 'var(--color-accent)' : 'var(--color-border)'}`, background: !selectedMeeting ? 'rgba(108,99,255,0.15)' : 'transparent', color: !selectedMeeting ? 'var(--color-accent-light)' : 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.2s' }}>
              All Meetings
            </button>
            {loadingMeetings && (
              <span style={{ fontSize: '0.775rem', color: 'var(--color-text-muted)', alignSelf: 'center' }}>Loading meetings…</span>
            )}
            {meetings.map(m => (
              <button key={m.id} onClick={() => handleMeetingSelect(m)}
                style={{ padding: '0.375rem 0.875rem', borderRadius: 20, border: `1px solid ${selectedMeeting?.id === m.id ? 'var(--color-accent)' : 'var(--color-border)'}`, background: selectedMeeting?.id === m.id ? 'rgba(108,99,255,0.15)' : 'transparent', color: selectedMeeting?.id === m.id ? 'var(--color-accent-light)' : 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
                {m.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Chat area ── */}
      <div style={{ flex: 1, maxWidth: 860, margin: '0 auto', width: '100%', padding: '0 1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>

        {/* Starter suggestions (show only at start) */}
        {messages.length <= 1 && (
          <div>
            <div style={{ fontSize: '0.775rem', color: 'var(--color-text-muted)', marginBottom: '0.625rem' }}>Try asking:</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              {STARTER_QUESTIONS.map(q => (
                <button key={q} onClick={() => sendMessage(q)}
                  style={{ padding: '0.75rem 1rem', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)', cursor: 'pointer', textAlign: 'left', color: 'var(--color-text-secondary)', fontSize: '0.8125rem', lineHeight: 1.5, transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.background = 'rgba(108,99,255,0.06)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}>
                  <Sparkles size={11} style={{ marginRight: 6, color: 'var(--color-accent-light)', verticalAlign: 'middle' }} />
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map(m => (
          <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>

            {m.role === 'user' ? (
              <div style={{ maxWidth: '78%', background: 'var(--color-accent)', borderRadius: '16px 16px 4px 16px', padding: '0.75rem 1.125rem', fontSize: '0.9rem', lineHeight: 1.6 }}>
                {m.text}
              </div>
            ) : (
              <div style={{ maxWidth: '88%' }}>
                {/* AI badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, background: 'rgba(108,99,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Brain size={12} color="var(--color-accent-light)" />
                  </div>
                  <span style={{ fontSize: '0.775rem', fontWeight: 700, color: m.error ? '#f87171' : 'var(--color-accent-light)' }}>
                    {m.error ? 'Error' : 'MeetFlow AI'}
                  </span>
                  {m.source && !m.error && (
                    <span style={{ fontSize: '0.675rem', color: 'var(--color-text-muted)', background: 'rgba(255,255,255,0.05)', padding: '0.1rem 0.5rem', borderRadius: 6 }}>
                      {m.source}
                    </span>
                  )}
                </div>

                {/* Bubble */}
                <div style={{ background: m.error ? 'rgba(239,68,68,0.07)' : 'rgba(255,255,255,0.045)', border: `1px solid ${m.error ? 'rgba(239,68,68,0.25)' : 'var(--color-border)'}`, borderRadius: '4px 16px 16px 16px', padding: '0.875rem 1.125rem', fontSize: '0.9rem', lineHeight: 1.75, color: 'var(--color-text-secondary)', whiteSpace: 'pre-wrap' }}>
                  {m.text}

                  {/* Citations */}
                  {m.citations && m.citations.length > 0 && (
                    <div style={{ marginTop: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                      {m.citations.map((c, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.5rem 0.75rem', background: 'rgba(108,99,255,0.08)', borderRadius: 8, border: '1px solid rgba(108,99,255,0.18)' }}>
                          <Play size={12} color="var(--color-accent-light)" />
                          <div style={{ flex: 1 }}>
                            <span style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--color-accent-light)' }}>{c.timestamp}</span>
                            {c.speaker && <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginLeft: 6 }}>· {c.speaker}</span>}
                            {c.note && <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: 2 }}>{c.note}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Related topics */}
                  {m.relatedTopics && m.relatedTopics.length > 0 && (
                    <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                      {m.relatedTopics.map((t, i) => (
                        <button key={i} onClick={() => sendMessage(t)}
                          style={{ padding: '0.2rem 0.625rem', borderRadius: 20, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', cursor: 'pointer', fontSize: '0.725rem', color: 'var(--color-text-muted)', transition: 'all 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-accent)'}
                          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}>
                          {t} →
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Escalate button if AI says it doesn't know */}
                {m.text.toLowerCase().includes("wasn't covered") || m.text.toLowerCase().includes("not in the meeting") ? (
                  <button onClick={() => setEscalateModal(true)}
                    style={{ marginTop: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.375rem', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 8, padding: '0.4rem 0.75rem', cursor: 'pointer', color: '#fbbf24', fontSize: '0.775rem', fontWeight: 600 }}>
                    <AlertCircle size={13} /> Ask the Host instead
                  </button>
                ) : null}
              </div>
            )}
          </motion.div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1.125rem', background: 'rgba(255,255,255,0.04)', borderRadius: '4px 16px 16px 16px', border: '1px solid var(--color-border)', width: 'fit-content' }}>
            <div style={{ width: 22, height: 22, borderRadius: 6, background: 'rgba(108,99,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Brain size={12} color="#c4b5fd" />
            </div>
            <NewtonsCradleLoader size={32} speed={1.2} color="#c4b5fd" label="Groq AI is thinking..." />
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ── */}
      <div style={{ padding: '0.875rem 1.5rem', borderTop: '1px solid var(--color-border)', background: 'rgba(8,11,20,0.92)', backdropFilter: 'blur(20px)', position: 'sticky', bottom: 0 }}>
        <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', gap: '0.625rem', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <MessageSquare size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
            <input
              id="qa-input"
              ref={inputRef}
              className="input-glass"
              style={{ borderRadius: 12, fontSize: '0.9375rem', paddingLeft: '2.25rem', width: '100%' }}
              placeholder={selectedMeeting ? `Ask about "${selectedMeeting.title}"…` : 'Ask anything about your meetings…'}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              disabled={loading}
            />
          </div>
          <button onClick={() => sendMessage()} className="btn-primary"
            disabled={loading || !query.trim()}
            style={{ padding: '0.75rem 1.25rem', borderRadius: 12, display: 'flex', alignItems: 'center', gap: '0.375rem', flexShrink: 0, opacity: loading || !query.trim() ? 0.5 : 1 }}>
            <Send size={16} /> Ask
          </button>
        </div>
        {chatHistory.length > 0 && (
          <div style={{ maxWidth: 860, margin: '0.375rem auto 0', fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <Clock size={10} /> {chatHistory.length} turn{chatHistory.length > 1 ? 's' : ''} in conversation
            <button onClick={() => { setChatHistory([]); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '0.7rem', marginLeft: 6, textDecoration: 'underline' }}>
              Clear history
            </button>
          </div>
        )}
      </div>

      {/* ── Escalate Modal ── */}
      <AnimatePresence>
        {escalateModal && (
          <div className="modal-overlay" onClick={() => setEscalateModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }}
              className="glass" style={{ borderRadius: 20, padding: '2rem', width: 400, maxWidth: '90vw' }}
              onClick={e => e.stopPropagation()}>
              <h2 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Escalate to Host</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
                The AI couldn't find this in the meeting. Forward your question to the host:
              </p>
              {['Prof. Sharma (DSA)', 'Prof. Verma (DBMS)', 'Prof. Rao (CN)'].map(host => (
                <button key={host} onClick={() => setEscalateModal(false)}
                  style={{ width: '100%', padding: '0.875rem', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--color-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', color: 'var(--color-text-primary)', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-accent)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(108,99,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem' }}>
                    {host[5]}
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{host}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Will respond via Doubt Log</div>
                  </div>
                  <ChevronRight size={16} color="var(--color-text-muted)" style={{ marginLeft: 'auto' }} />
                </button>
              ))}
              <button onClick={() => setEscalateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', width: '100%', padding: '0.75rem', fontSize: '0.875rem' }}>
                Cancel
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
