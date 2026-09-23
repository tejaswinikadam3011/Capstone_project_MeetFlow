'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Brain, Edit3, CheckCircle2, RefreshCw, Download, Eye, EyeOff, History, Save, Users, Globe, AlertCircle } from 'lucide-react';
import { subDays, format } from 'date-fns';

const draftSummary = `This session covered Binary Trees and Binary Search Trees (BST). Prof. Sharma started with a recap of linked lists, then introduced tree terminology (root, node, leaf, depth, height). Key topics covered included pre-order, in-order, post-order traversal algorithms, BST insertion and deletion operations, and an introduction to balanced trees (AVL trees).

Three practice problems were assigned to students:
1. Implement a complete BST from scratch in Python
2. Write all three traversal algorithms
3. Implement a tree height calculation function

Students raised questions about the time complexity of BST operations and edge cases in deletion. The session ended with a live coding demo of AVL rotations.`;

const originalSummary = `Binary Trees and BST session. Covered: tree terminology, traversal (pre/in/post order), BST insert/delete, AVL trees intro. Three tasks assigned. Q&A on time complexity. Live AVL rotation demo.`;

export default function SummaryReviewPage() {
  const [summary, setSummary] = useState(draftSummary);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(draftSummary);
  const [approved, setApproved] = useState(false);
  const [visibility, setVisibility] = useState<'all' | 'absentees'>('all');
  const [showHistory, setShowHistory] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const handleApprove = () => setApproved(true);

  const handleSaveEdit = () => {
    setSummary(editText);
    setEditing(false);
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'DSA Lecture — Trees',
          transcript: summary || draftSummary,
        }),
      });
      const json = await res.json();
      if (json.success && json.data?.executiveSummary) {
        const generated = `${json.data.executiveSummary}\n\nKey Highlights:\n${json.data.keyPoints?.map((k: any) => `• [${k.timestamp}] ${k.topic}: ${k.detail}`).join('\n') || ''}\n\nDecisions:\n${json.data.decisions?.map((d: any) => `• ${d}`).join('\n') || ''}`;
        setSummary(generated);
        setEditText(generated);
      }
    } catch (err) {
      console.error('Regeneration error:', err);
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <Link href="/archive" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--color-border)', textDecoration: 'none', color: 'var(--color-text-secondary)' }}>
            <ArrowLeft size={18} />
          </Link>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '1.375rem', fontWeight: 700 }}>Review AI Summary</h1>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>DSA Lecture — Trees · {format(subDays(new Date(), 1), 'MMMM d, yyyy')}</p>
          </div>
          {!approved && (
            <span className="badge badge-warning" style={{ padding: '0.375rem 0.875rem', fontSize: '0.8125rem' }}>⏳ Pending Review</span>
          )}
          {approved && (
            <span className="badge badge-success" style={{ padding: '0.375rem 0.875rem', fontSize: '0.8125rem' }}>✅ Approved</span>
          )}
        </div>

        {/* Approved banner */}
        <AnimatePresence>
          {approved && (
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <CheckCircle2 size={20} color="var(--color-success)" />
              <div>
                <div style={{ fontWeight: 700, color: 'var(--color-success)' }}>Summary Approved & Published</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>Visible to: {visibility === 'all' ? 'All participants' : 'Absentees only'}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI notice */}
        {!approved && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
            <AlertCircle size={18} color="var(--color-warning)" style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <div style={{ fontWeight: 700, color: 'var(--color-warning)', fontSize: '0.9rem' }}>Review before publishing</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>This AI-generated summary is only visible to you. Edit, regenerate, or approve it before students can see it. (NFR-2)</div>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: '1.5rem', alignItems: 'start' }}>
          {/* Main summary editor */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="glass" style={{ borderRadius: 16, padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(108,99,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Brain size={16} color="var(--color-accent-light)" />
                  </div>
                  <span style={{ fontWeight: 700 }}>AI Generated Summary</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => setShowHistory(!showHistory)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: showHistory ? 'rgba(108,99,255,0.12)' : 'rgba(255,255,255,0.05)', border: `1px solid ${showHistory ? 'var(--color-accent)' : 'var(--color-border)'}`, borderRadius: 8, padding: '0.4rem 0.75rem', cursor: 'pointer', color: showHistory ? 'var(--color-accent-light)' : 'var(--color-text-muted)', fontSize: '0.8125rem', transition: 'all 0.2s' }}>
                    <History size={13} /> History
                  </button>
                  {!editing && !approved && (
                    <button onClick={() => { setEditing(true); setEditText(summary); }}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '0.4rem 0.75rem', cursor: 'pointer', color: 'var(--color-text-secondary)', fontSize: '0.8125rem' }}>
                      <Edit3 size={13} /> Edit
                    </button>
                  )}
                </div>
              </div>

              {/* Version history — FR-42 */}
              <AnimatePresence>
                {showHistory && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    style={{ marginBottom: '1.25rem', overflow: 'hidden' }}>
                    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '1rem', border: '1px solid var(--color-border)' }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--color-text-muted)' }}>📜 Original AI Draft</div>
                      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, fontStyle: 'italic' }}>{originalSummary}</p>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.75rem' }}>Generated automatically · 2 edits made by host</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {editing ? (
                <div>
                  <textarea
                    id="summary-editor"
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                    style={{ width: '100%', minHeight: 280, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--color-accent)', borderRadius: 12, padding: '1rem', color: 'var(--color-text-primary)', fontSize: '0.9rem', lineHeight: 1.7, resize: 'vertical', outline: 'none', fontFamily: 'inherit' }}
                  />
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
                    <button onClick={() => setEditing(false)} className="btn-secondary" style={{ padding: '0.6rem 1.25rem', borderRadius: 10 }}>Cancel</button>
                    <button onClick={handleSaveEdit} className="btn-primary" style={{ padding: '0.6rem 1.25rem', borderRadius: 10, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <Save size={14} /> Save Edits
                    </button>
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>{summary}</p>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Visibility — FR-39 */}
            <div className="glass" style={{ borderRadius: 14, padding: '1.25rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Eye size={15} /> Visibility
              </div>
              {([['all', 'Everyone', '👥'], ['absentees', 'Absentees Only', '🙋']] as const).map(([val, label, emoji]) => (
                <button key={val} onClick={() => setVisibility(val)} disabled={approved}
                  style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: 10, border: `1px solid ${visibility === val ? 'var(--color-accent)' : 'var(--color-border)'}`, background: visibility === val ? 'rgba(108,99,255,0.12)' : 'transparent', color: visibility === val ? 'var(--color-accent-light)' : 'var(--color-text-secondary)', cursor: approved ? 'not-allowed' : 'pointer', fontSize: '0.8125rem', fontWeight: 600, textAlign: 'left', transition: 'all 0.2s', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {emoji} {label}
                </button>
              ))}
            </div>

            {/* Actions */}
            {!approved && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button id="approve-summary-btn" onClick={handleApprove} className="btn-teal" style={{ width: '100%', padding: '0.75rem', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} /> Approve & Publish
                </button>
                <button onClick={handleRegenerate} disabled={regenerating}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', cursor: regenerating ? 'wait' : 'pointer', color: 'var(--color-text-secondary)', fontWeight: 600, fontSize: '0.875rem', transition: 'all 0.2s' }}>
                  <motion.div animate={regenerating ? { rotate: 360 } : { rotate: 0 }} transition={{ duration: 1, repeat: regenerating ? Infinity : 0, ease: 'linear' }}>
                    <RefreshCw size={15} />
                  </motion.div>
                  {regenerating ? 'Regenerating...' : 'Regenerate'}
                </button>
              </div>
            )}

            {/* Export — FR-43 */}
            <button style={{ width: '100%', padding: '0.75rem', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--color-border)', cursor: 'pointer', color: 'var(--color-text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>
              <Download size={15} /> Export as PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
