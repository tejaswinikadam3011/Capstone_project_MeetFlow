'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Video, ArrowLeft, Calendar, Clock, Lock, Users, RepeatIcon,
  Share2, Copy, CheckCircle2, ChevronDown, Shield, Mic, MicOff
} from 'lucide-react';

const SHARE_PLATFORMS = [
  { name: 'WhatsApp', emoji: '📱', color: '#25D366' },
  { name: 'Gmail', emoji: '📧', color: '#EA4335' },
  { name: 'SMS', emoji: '💬', color: '#007AFF' },
  { name: 'Copy Link', emoji: '🔗', color: 'var(--color-accent)' },
];

export default function CreateMeetingPage() {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [isInstant, setIsInstant] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordEnabled, setPasswordEnabled] = useState(false);
  const [waitingRoom, setWaitingRoom] = useState(true);
  const [joinBeforeHost, setJoinBeforeHost] = useState(false);
  const [autoRecord, setAutoRecord] = useState(false);
  const [joinMode, setJoinMode] = useState<'auto' | 'manual'>('manual');
  const [defaultAudio, setDefaultAudio] = useState<'on' | 'off'>('on');
  const [created, setCreated] = useState(false);
  const [roomCode] = useState('MF-' + Math.random().toString(36).substring(2, 7).toUpperCase());
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState<'form' | 'share'>('form');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setCreated(true);
    setStep('share');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://meetflow.app/join/${roomCode}`).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const Toggle = ({ value, onChange, id }: { value: boolean; onChange: (v: boolean) => void; id: string }) => (
    <button id={id} onClick={() => onChange(!value)}
      style={{ width: 40, height: 22, borderRadius: 999, border: 'none', cursor: 'pointer', transition: 'background 0.25s', background: value ? 'var(--color-accent)' : 'rgba(255,255,255,0.1)', position: 'relative', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 3, left: value ? 21 : 3, width: 16, height: 16, borderRadius: '50%', background: 'white', transition: 'left 0.25s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
    </button>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--color-border)', cursor: 'pointer', textDecoration: 'none', color: 'var(--color-text-secondary)' }}>
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 style={{ fontSize: '1.375rem', fontWeight: 700 }}>New Meeting Room</h1>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Configure your meeting settings</p>
          </div>
        </div>

        {step === 'form' ? (
          <motion.form onSubmit={handleCreate} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Meeting type toggle */}
            <div className="glass" style={{ borderRadius: 16, padding: '1.25rem' }}>
              <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '0.25rem', marginBottom: '0.75rem' }}>
                {([false, true] as const).map(instant => (
                  <button key={String(instant)} type="button" onClick={() => setIsInstant(instant)}
                    style={{ flex: 1, padding: '0.5rem', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, transition: 'all 0.2s', background: isInstant === instant ? 'var(--color-accent)' : 'transparent', color: isInstant === instant ? 'white' : 'var(--color-text-secondary)' }}>
                    {instant ? '⚡ Instant Meet' : '📅 Schedule'}
                  </button>
                ))}
              </div>

              {/* Title */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.375rem', display: 'block' }}>Meeting Title *</label>
                <input id="meeting-title" className="input-glass" placeholder="DSA Lecture — Graphs" value={title} onChange={e => setTitle(e.target.value)} required />
              </div>

              {!isInstant && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.375rem', display: 'block' }}>Date</label>
                    <input id="meeting-date" type="date" className="input-glass" value={date} onChange={e => setDate(e.target.value)} required={!isInstant} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.375rem', display: 'block' }}>Time</label>
                    <input id="meeting-time" type="time" className="input-glass" value={time} onChange={e => setTime(e.target.value)} required={!isInstant} />
                  </div>
                </div>
              )}
            </div>

            {/* Room Settings — FR-16 */}
            <div className="glass" style={{ borderRadius: 16, padding: '1.25rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={16} color="var(--color-accent-light)" /> Room Settings
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Meeting Password */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Meeting Password</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Require a password to join</div>
                  </div>
                  <Toggle id="toggle-password" value={passwordEnabled} onChange={setPasswordEnabled} />
                </div>
                {passwordEnabled && (
                  <input id="meeting-password" className="input-glass" type="text" placeholder="Set password" value={password} onChange={e => setPassword(e.target.value)} style={{ marginTop: '-0.25rem' }} />
                )}

                {[
                  { label: 'Enable Waiting Room', desc: 'Admit participants manually', value: waitingRoom, onChange: setWaitingRoom, id: 'toggle-waiting-room' },
                  { label: 'Allow Join Before Host', desc: 'Participants can enter before you', value: joinBeforeHost, onChange: setJoinBeforeHost, id: 'toggle-join-before' },
                  { label: 'Auto-Record Meeting', desc: 'Start recording automatically', value: autoRecord, onChange: setAutoRecord, id: 'toggle-auto-record' },
                  { label: 'Recurring Meeting', desc: 'Same room code reused each session', value: isRecurring, onChange: setIsRecurring, id: 'toggle-recurring' },
                ].map(item => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{item.label}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{item.desc}</div>
                    </div>
                    <Toggle id={item.id} value={item.value} onChange={item.onChange} />
                  </div>
                ))}

                {/* Join Mode */}
                <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Join Mode</div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {(['auto', 'manual'] as const).map(m => (
                      <button key={m} type="button" onClick={() => setJoinMode(m)}
                        style={{ flex: 1, padding: '0.5rem', borderRadius: 8, border: `1px solid ${joinMode === m ? 'var(--color-accent)' : 'var(--color-border)'}`, background: joinMode === m ? 'rgba(108,99,255,0.12)' : 'transparent', color: joinMode === m ? 'var(--color-accent-light)' : 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600, transition: 'all 0.2s' }}>
                        {m === 'auto' ? 'Auto-Admit' : 'Manual Approval'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Default Audio */}
                <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Default Audio</div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {(['on', 'off'] as const).map(a => (
                      <button key={a} type="button" onClick={() => setDefaultAudio(a)}
                        style={{ flex: 1, padding: '0.5rem', borderRadius: 8, border: `1px solid ${defaultAudio === a ? 'var(--color-accent)' : 'var(--color-border)'}`, background: defaultAudio === a ? 'rgba(108,99,255,0.12)' : 'transparent', color: defaultAudio === a ? 'var(--color-accent-light)' : 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600, transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                        {a === 'on' ? <><Mic size={13} /> Mic On</> : <><MicOff size={13} /> Muted</>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.875rem', borderRadius: 12, fontSize: '1rem' }}>
              {isInstant ? '⚡ Start Meeting Now' : '📅 Create Meeting Room'}
            </button>
          </motion.form>
        ) : (
          // Share screen — FR-17
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="glass border-gradient" style={{ borderRadius: 20, padding: '2rem', textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <CheckCircle2 size={28} color="var(--color-success)" />
              </div>
              <h2 style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '0.25rem' }}>Room Created!</h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>{title || 'Your Meeting'}</p>

              {/* Room Code */}
              <div style={{ background: 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.3)', borderRadius: 12, padding: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Room Code</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: "'Space Grotesk',sans-serif", letterSpacing: '0.1em', color: 'var(--color-accent-light)' }}>{roomCode}</div>
              </div>

              {/* Share options */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
                {SHARE_PLATFORMS.map(p => (
                  <button key={p.name} onClick={p.name === 'Copy Link' ? handleCopy : undefined}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '0.875rem 0.5rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = p.color; e.currentTarget.style.background = `${p.color}15`; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}>
                    <span style={{ fontSize: '1.5rem' }}>{p.emoji}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{p.name}</span>
                  </button>
                ))}
              </div>

              {copied && (
                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} style={{ fontSize: '0.8125rem', color: 'var(--color-success)', marginBottom: '0.75rem' }}>
                  ✓ Link copied to clipboard!
                </motion.div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link href="/dashboard" className="btn-secondary" style={{ flex: 1, textAlign: 'center', padding: '0.75rem', borderRadius: 12, textDecoration: 'none' }}>
                Back to Dashboard
              </Link>
              <Link href={`/meeting/${roomCode}`} className="btn-teal" style={{ flex: 1, textAlign: 'center', padding: '0.75rem', borderRadius: 12, textDecoration: 'none' }}>
                Start Meeting →
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
