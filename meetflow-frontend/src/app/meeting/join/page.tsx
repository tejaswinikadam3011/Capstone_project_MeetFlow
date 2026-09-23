'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Hash, Lock, Mic, MicOff, Video, VideoOff, ChevronRight } from 'lucide-react';

export default function JoinMeetingPage() {
  const [roomCode, setRoomCode] = useState('');
  const [password, setPassword] = useState('');
  const [audioOn, setAudioOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<'enter' | 'preview'>('enter');

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'enter') setStep('preview');
    else window.location.href = `/meeting/${roomCode.toUpperCase()}`;
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
      {/* BG */}
      <motion.div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,170,0.12) 0%, transparent 70%)', top: '10%', left: '5%', pointerEvents: 'none' }} animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 8, repeat: Infinity }} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--color-border)', cursor: 'pointer', textDecoration: 'none', color: 'var(--color-text-secondary)' }}>
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 style={{ fontSize: '1.375rem', fontWeight: 700 }}>Join Meeting</h1>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Enter your room code to continue</p>
          </div>
        </div>

        <div className="glass" style={{ borderRadius: 20, padding: '2rem' }}>
          {step === 'enter' ? (
            <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Room code — FR-19 */}
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                  Room Code or Link
                </label>
                <div style={{ position: 'relative' }}>
                  <Hash size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                  <input
                    id="room-code-input"
                    className="input-glass"
                    style={{ paddingLeft: '2.5rem', fontSize: '1.125rem', fontWeight: 700, letterSpacing: '0.1em', fontFamily: "'Space Grotesk',sans-serif" }}
                    placeholder="DSA-001"
                    value={roomCode}
                    onChange={e => setRoomCode(e.target.value.toUpperCase())}
                    required
                  />
                </div>
              </div>

              {/* Password — FR-19 */}
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                  Meeting Password <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(if required)</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                  <input
                    id="meeting-password-input"
                    className="input-glass"
                    style={{ paddingLeft: '2.5rem' }}
                    placeholder="Leave blank if none"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {/* Pre-join toggles — FR-20 */}
              <div className="glass" style={{ borderRadius: 12, padding: '1rem', display: 'flex', gap: '0.75rem' }}>
                <button type="button" id="toggle-audio-prejoin"
                  onClick={() => setAudioOn(!audioOn)}
                  style={{ flex: 1, padding: '0.75rem', borderRadius: 10, border: `1px solid ${audioOn ? 'var(--color-teal)' : 'var(--color-border)'}`, background: audioOn ? 'rgba(0,212,170,0.1)' : 'rgba(255,255,255,0.04)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: audioOn ? 'var(--color-teal)' : 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.8125rem', transition: 'all 0.2s' }}>
                  {audioOn ? <Mic size={16} /> : <MicOff size={16} />}
                  {audioOn ? 'Mic On' : 'Mic Off'}
                </button>
                <button type="button" id="toggle-video-prejoin"
                  onClick={() => setVideoOn(!videoOn)}
                  style={{ flex: 1, padding: '0.75rem', borderRadius: 10, border: `1px solid ${videoOn ? 'var(--color-accent)' : 'var(--color-border)'}`, background: videoOn ? 'rgba(108,99,255,0.1)' : 'rgba(255,255,255,0.04)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: videoOn ? 'var(--color-accent-light)' : 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.8125rem', transition: 'all 0.2s' }}>
                  {videoOn ? <Video size={16} /> : <VideoOff size={16} />}
                  {videoOn ? 'Cam On' : 'Cam Off'}
                </button>
              </div>

              <button type="submit" id="join-meeting-btn" className="btn-teal" style={{ width: '100%', padding: '0.875rem', borderRadius: 12, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                Continue <ChevronRight size={18} />
              </button>
            </form>
          ) : (
            // Preview / permission screen — FR-21
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Camera preview mock */}
              <div style={{ aspectRatio: '16/9', background: '#0d1117', borderRadius: 14, border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.75rem', position: 'relative' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700 }}>T</div>
                <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Camera preview</span>
                {!videoOn && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <VideoOff size={28} color="var(--color-text-muted)" />
                  </div>
                )}
              </div>

              {/* Permission notice — FR-21 */}
              <div style={{ background: 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.25)', borderRadius: 12, padding: '0.875rem', fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                🔐 MeetFlow will request access to your <strong>microphone</strong> and <strong>camera</strong> when you join. You can change these anytime during the meeting.
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={() => setStep('enter')} className="btn-secondary" style={{ flex: 1, padding: '0.75rem', borderRadius: 12 }}>
                  Back
                </button>
                <button onClick={() => window.location.href = `/meeting/${roomCode}`} className="btn-teal" style={{ flex: 2, padding: '0.75rem', borderRadius: 12 }}>
                  Join Room {roomCode}
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Recent rooms */}
        <div style={{ marginTop: '1.5rem' }}>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>Recently joined</p>
          {[{ code: 'DSA-001', title: 'DSA Lecture' }, { code: 'DBMS-07', title: 'DBMS Tutorial' }].map(r => (
            <button key={r.code} onClick={() => { setRoomCode(r.code); setStep('enter'); }}
              style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: '0.5rem', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{r.title}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{r.code}</div>
              </div>
              <ChevronRight size={16} color="var(--color-text-muted)" />
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
