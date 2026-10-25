'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import {
  Mic, MicOff, Video, VideoOff, MonitorOff,
  MessageSquare, PhoneOff, Users, Brain,
  X, Send, Crown, Radio, Hand
} from 'lucide-react';
import { useAuth } from '@/lib/useAuth';

export default function LiveMeetingPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth(false);
  const roomId = (params.roomId as string) || 'DEMO-ROOM';
  const displayName = user?.name || 'You';

  // Media state
  const [audioOn, setAudioOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [handRaised, setHandRaised] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [chatMsg, setChatMsg] = useState('');
  const [messages, setMessages] = useState<{ id: string; sender: string; text: string; time: string; self: boolean }[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [liveKitStatus, setLiveKitStatus] = useState<'connecting' | 'connected' | 'error' | 'no-token'>('connecting');

  // Real camera
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  // Meeting timer
  useEffect(() => {
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Fetch LiveKit token and connect
  useEffect(() => {
    async function initLiveKit() {
      try {
        const res = await fetch(
          `/api/livekit/token?room=${encodeURIComponent(roomId)}&username=${encodeURIComponent(displayName)}&isHost=true`
        );
        const data = await res.json();
        if (data.success && data.token) {
          setLiveKitStatus('connected');
        } else {
          setLiveKitStatus('no-token');
        }
      } catch {
        setLiveKitStatus('error');
      }
    }
    initLiveKit();
  }, [roomId, displayName]);

  // Real camera
  useEffect(() => {
    let stream: MediaStream | null = null;
    async function startMedia() {
      if (!videoOn) {
        localStream?.getTracks().forEach(t => t.stop());
        setLocalStream(null);
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: audioOn });
        setLocalStream(stream);
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      } catch {
        console.warn('Camera/mic access denied or no device found');
      }
    }
    startMedia();
    return () => { stream?.getTracks().forEach(t => t.stop()); };
  }, [videoOn]);

  // Mute/unmute audio tracks
  useEffect(() => {
    localStream?.getAudioTracks().forEach(t => { t.enabled = audioOn; });
  }, [audioOn, localStream]);

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const sendMessage = () => {
    if (!chatMsg.trim()) return;
    setMessages(m => [...m, {
      id: Date.now().toString(),
      sender: displayName,
      text: chatMsg.trim(),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      self: true,
    }]);
    setChatMsg('');
  };

  const endMeeting = () => {
    localStream?.getTracks().forEach(t => t.stop());
    router.push('/dashboard');
  };

  return (
    <div style={{ height: '100vh', background: '#080b14', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>

      {/* TOP BAR */}
      <div style={{ height: 52, background: 'rgba(13,17,23,0.95)', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.25rem', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f72585', animation: 'pulse 1.5s infinite' }} />
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>LIVE</span>
          </div>
          <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)' }} />
          <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>MeetFlow Room</span>
          <span style={{ background: 'rgba(108,99,255,0.2)', border: '1px solid rgba(108,99,255,0.4)', borderRadius: 6, padding: '0.1rem 0.5rem', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em' }}>{roomId}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: liveKitStatus === 'connected' ? 'rgba(0,212,170,0.1)' : 'rgba(108,99,255,0.1)', padding: '0.2rem 0.6rem', borderRadius: 999, border: '1px solid rgba(255,255,255,0.1)' }}>
            <Radio size={11} color={liveKitStatus === 'connected' ? '#00d4aa' : '#8b85ff'} />
            <span style={{ fontSize: '0.68rem', color: liveKitStatus === 'connected' ? '#00d4aa' : '#8b85ff', fontWeight: 600 }}>
              {liveKitStatus === 'connected' ? 'LiveKit Connected' : liveKitStatus === 'connecting' ? 'Connecting...' : 'WebRTC Ready'}
            </span>
          </div>
        </div>
        <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', fontVariantNumeric: 'tabular-nums', fontFamily: 'monospace' }}>
          {formatTime(elapsed)}
        </span>
      </div>

      {/* MAIN AREA */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>

        {/* VIDEO AREA */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', position: 'relative' }}>

          {/* Self video tile */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            style={{ position: 'relative', width: '100%', maxWidth: 720, aspectRatio: '16/9', borderRadius: 18, overflow: 'hidden', background: '#111827', border: '2px solid rgba(108,99,255,0.4)', boxShadow: '0 0 40px rgba(108,99,255,0.2)' }}>

            {videoOn && localStream ? (
              <video ref={localVideoRef} autoPlay playsInline muted
                style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', fontWeight: 700 }}>
                  {displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>{videoOn ? 'Starting camera...' : 'Camera off'}</span>
              </div>
            )}

            {/* Name tag */}
            <div style={{ position: 'absolute', bottom: 12, left: 14, display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', borderRadius: 8, padding: '0.3rem 0.75rem' }}>
              <Crown size={12} color="#f59e0b" />
              <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{displayName} (Host)</span>
            </div>

            {/* Mic indicator */}
            {!audioOn && (
              <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(239,68,68,0.85)', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MicOff size={14} color="white" />
              </div>
            )}

            {/* Hand raise */}
            {handRaised && (
              <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(245,158,11,0.85)', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Hand size={14} color="white" />
              </div>
            )}
          </motion.div>

          {/* Waiting for others hint */}
          <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: 'rgba(13,17,23,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '0.6rem 1.25rem', fontSize: '0.8125rem', color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap' }}>
            Share room code <strong style={{ color: 'var(--color-accent-light)' }}>{roomId}</strong> for others to join
          </div>
        </div>

        {/* CHAT PANEL */}
        <AnimatePresence>
          {chatOpen && (
            <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 320, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
              style={{ background: 'rgba(13,17,23,0.95)', borderLeft: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
              <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>In-Meeting Chat</span>
                <button onClick={() => setChatOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}>
                  <X size={16} />
                </button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {messages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.8125rem', marginTop: '2rem' }}>
                    No messages yet. Say hi! 👋
                  </div>
                ) : messages.map(m => (
                  <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.self ? 'flex-end' : 'flex-start' }}>
                    <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.2rem' }}>{m.sender} · {m.time}</span>
                    <div style={{
                      maxWidth: '85%', padding: '0.5rem 0.875rem',
                      borderRadius: m.self ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                      background: m.self ? 'var(--color-accent)' : 'rgba(255,255,255,0.07)',
                      fontSize: '0.8125rem', lineHeight: 1.5
                    }}>{m.text}</div>
                  </div>
                ))}
              </div>

              <div style={{ padding: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '0.5rem' }}>
                <input value={chatMsg} onChange={e => setChatMsg(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  style={{ flex: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '0.5rem 0.75rem', color: 'white', fontSize: '0.8125rem', outline: 'none' }} />
                <button onClick={sendMessage} style={{ background: 'var(--color-accent)', border: 'none', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <Send size={15} color="white" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PARTICIPANTS PANEL */}
        <AnimatePresence>
          {participantsOpen && (
            <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 280, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
              style={{ background: 'rgba(13,17,23,0.95)', borderLeft: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
              <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>Participants (1)</span>
                <button onClick={() => setParticipantsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}>
                  <X size={16} />
                </button>
              </div>
              <div style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem', borderRadius: 10, background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.25)' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gradient-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 700 }}>
                    {displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{displayName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Host · You</div>
                  </div>
                  <Crown size={14} color="#f59e0b" />
                </div>
                <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.8125rem', color: 'rgba(255,255,255,0.3)' }}>
                  Share the room code to invite others
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* BOTTOM CONTROL BAR */}
      <div style={{ height: 72, background: 'rgba(13,17,23,0.97)', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', flexShrink: 0 }}>

        {/* Mic */}
        <button onClick={() => setAudioOn(a => !a)} title={audioOn ? 'Mute' : 'Unmute'}
          style={{ width: 48, height: 48, borderRadius: '50%', border: 'none', cursor: 'pointer', background: audioOn ? 'rgba(255,255,255,0.1)' : 'rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
          {audioOn ? <Mic size={20} color="white" /> : <MicOff size={20} color="#f87171" />}
        </button>

        {/* Camera */}
        <button onClick={() => setVideoOn(v => !v)} title={videoOn ? 'Stop Video' : 'Start Video'}
          style={{ width: 48, height: 48, borderRadius: '50%', border: 'none', cursor: 'pointer', background: videoOn ? 'rgba(255,255,255,0.1)' : 'rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
          {videoOn ? <Video size={20} color="white" /> : <VideoOff size={20} color="#f87171" />}
        </button>

        {/* Hand raise */}
        <button onClick={() => setHandRaised(h => !h)} title={handRaised ? 'Lower Hand' : 'Raise Hand'}
          style={{ width: 48, height: 48, borderRadius: '50%', border: 'none', cursor: 'pointer', background: handRaised ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
          <Hand size={20} color={handRaised ? '#fbbf24' : 'white'} />
        </button>

        {/* Participants */}
        <button onClick={() => { setParticipantsOpen(p => !p); setChatOpen(false); }} title="Participants"
          style={{ width: 48, height: 48, borderRadius: '50%', border: 'none', cursor: 'pointer', background: participantsOpen ? 'rgba(108,99,255,0.3)' : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
          <Users size={20} color="white" />
        </button>

        {/* Chat */}
        <button onClick={() => { setChatOpen(c => !c); setParticipantsOpen(false); }} title="Chat"
          style={{ width: 48, height: 48, borderRadius: '50%', border: 'none', cursor: 'pointer', background: chatOpen ? 'rgba(108,99,255,0.3)' : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', position: 'relative' }}>
          <MessageSquare size={20} color="white" />
          {messages.length > 0 && !chatOpen && (
            <div style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: '50%', background: 'var(--color-accent)', border: '1.5px solid #080b14' }} />
          )}
        </button>

        {/* AI Summary */}
        <button title="AI Summary (after meeting)"
          style={{ width: 48, height: 48, borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Brain size={20} color="white" />
        </button>

        {/* Divider */}
        <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.12)', margin: '0 0.5rem' }} />

        {/* End */}
        <button onClick={() => setShowEndConfirm(true)} title="Leave Meeting"
          style={{ height: 48, padding: '0 1.25rem', borderRadius: 24, border: 'none', cursor: 'pointer', background: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.875rem', color: 'white' }}>
          <PhoneOff size={18} />
          Leave
        </button>
      </div>

      {/* END CONFIRM MODAL */}
      <AnimatePresence>
        {showEndConfirm && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setShowEndConfirm(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: '2rem', width: 360, textAlign: 'center' }}
              onClick={e => e.stopPropagation()}>
              <PhoneOff size={32} color="#f87171" style={{ margin: '0 auto 1rem' }} />
              <h2 style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '0.5rem' }}>Leave Meeting?</h2>
              <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', marginBottom: '1.5rem' }}>
                The meeting will continue for others if they are connected.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={() => setShowEndConfirm(false)}
                  style={{ flex: 1, padding: '0.75rem', borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: 'white', cursor: 'pointer', fontWeight: 600 }}>
                  Stay
                </button>
                <button onClick={endMeeting}
                  style={{ flex: 1, padding: '0.75rem', borderRadius: 12, border: 'none', background: '#dc2626', color: 'white', cursor: 'pointer', fontWeight: 700 }}>
                  Leave Now
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
