'use client';

import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Clock, Users, Shield, Mic, MicOff, Video, VideoOff, LogOut } from 'lucide-react';
import NewtonsCradleLoader from '@/components/NewtonsCradleLoader';

export default function WaitingRoomPage() {
  const params = useParams();
  const roomId = params.roomId as string;
  const [waitTime, setWaitTime] = useState(0);
  const [audioOn, setAudioOn] = useState(false);
  const [videoOn, setVideoOn] = useState(false);
  const [dots, setDots] = useState('');

  useEffect(() => {
    const t1 = setInterval(() => setWaitTime(w => w + 1), 1000);
    const t2 = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 600);
    return () => { clearInterval(t1); clearInterval(t2); };
  }, []);

  const formatWait = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: 480, textAlign: 'center', position: 'relative', zIndex: 1 }}>
        {/* Newton's Cradle Loader */}
        <div style={{ margin: '0 auto 2rem', display: 'flex', justifyContent: 'center' }}>
          <NewtonsCradleLoader size={60} speed={1.2} color="#c4b5fd" />
        </div>

        <h1 style={{ fontSize: '1.625rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Waiting to be admitted{dots}
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
          The host will let you in shortly
        </p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>
          <Clock size={14} /> Wait time: {formatWait(waitTime)}
        </div>

        {/* Room info */}
        <div className="glass" style={{ borderRadius: 16, padding: '1.25rem', marginBottom: '1.5rem', textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div>
              <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>DSA Lecture — Graphs</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Shield size={12} /> Room: <strong>{roomId}</strong>
              </div>
            </div>
            <span className="badge badge-warning">Waiting</span>
          </div>

          {/* Preview camera */}
          <div style={{ aspectRatio: '16/9', background: '#0d1117', borderRadius: 10, border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.875rem', position: 'relative' }}>
            {videoOn ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem' }}>T</div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Camera preview</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <VideoOff size={28} color="var(--color-text-muted)" />
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Camera off</span>
              </div>
            )}
          </div>

          {/* Pre-join controls */}
          <div style={{ display: 'flex', gap: '0.625rem' }}>
            <button id="waiting-toggle-audio"
              onClick={() => setAudioOn(!audioOn)}
              style={{ flex: 1, padding: '0.625rem', borderRadius: 10, border: `1px solid ${audioOn ? 'var(--color-teal)' : 'var(--color-border)'}`, background: audioOn ? 'rgba(0,212,170,0.1)' : 'transparent', color: audioOn ? 'var(--color-teal)' : 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', fontSize: '0.8125rem', fontWeight: 600, transition: 'all 0.2s' }}>
              {audioOn ? <Mic size={15} /> : <MicOff size={15} />} {audioOn ? 'Mic On' : 'Mic Off'}
            </button>
            <button id="waiting-toggle-video"
              onClick={() => setVideoOn(!videoOn)}
              style={{ flex: 1, padding: '0.625rem', borderRadius: 10, border: `1px solid ${videoOn ? 'var(--color-accent)' : 'var(--color-border)'}`, background: videoOn ? 'rgba(108,99,255,0.1)' : 'transparent', color: videoOn ? 'var(--color-accent-light)' : 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', fontSize: '0.8125rem', fontWeight: 600, transition: 'all 0.2s' }}>
              {videoOn ? <Video size={15} /> : <VideoOff size={15} />} {videoOn ? 'Cam On' : 'Cam Off'}
            </button>
          </div>
        </div>

        {/* Status dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
          {[...Array(3)].map((_, i) => (
            <motion.div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-accent)' }}
              animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.4 }} />
          ))}
        </div>

        <button onClick={() => window.location.href = '/dashboard'}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'none', border: '1px solid var(--color-border)', borderRadius: 12, padding: '0.75rem 1.5rem', color: 'var(--color-text-secondary)', cursor: 'pointer', width: '100%', fontSize: '0.875rem', transition: 'all 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-danger)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}>
          <LogOut size={16} /> Leave Waiting Room
        </button>
      </motion.div>
    </div>
  );
}
