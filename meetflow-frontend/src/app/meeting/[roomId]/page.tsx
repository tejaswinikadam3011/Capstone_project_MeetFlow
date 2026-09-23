'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import {
  Mic, MicOff, Video, VideoOff, Monitor, MonitorOff, Hand,
  MessageSquare, MoreHorizontal, PhoneOff, Users, Pin, Shield,
  Brain, CheckSquare, Settings, Volume2, VolumeX, X, Send,
  Crown, Radio
} from 'lucide-react';

// ── Demo Participants ──────────────────────────────────────────────────────
const initialParticipants = [
  { id: '1', name: 'Prof. Sharma', isHost: true, isCoHost: false, audioOn: true, videoOn: true, handRaised: false, initials: 'PS', color: '#6c63ff' },
  { id: '2', name: 'You (Host)', isHost: true, isCoHost: false, audioOn: true, videoOn: true, handRaised: false, initials: 'YO', color: '#00d4aa' },
  { id: '3', name: 'Sakshi M.', isHost: false, isCoHost: false, audioOn: false, videoOn: true, handRaised: true, initials: 'SM', color: '#f72585' },
  { id: '4', name: 'Rahul D.', isHost: false, isCoHost: false, audioOn: true, videoOn: false, handRaised: false, initials: 'RD', color: '#f59e0b' },
  { id: '5', name: 'Priya N.', isHost: false, isCoHost: false, audioOn: false, videoOn: false, handRaised: true, initials: 'PN', color: '#3b82f6' },
  { id: '6', name: 'Arjun S.', isHost: false, isCoHost: false, audioOn: true, videoOn: true, handRaised: false, initials: 'AS', color: '#ec4899' },
];

const chatMessages = [
  { id: '1', sender: 'Prof. Sharma', text: 'Welcome everyone! Realtime WebRTC and AI transcription are active.', time: '10:01', isHost: true },
  { id: '2', sender: 'You', text: 'LiveKit room token generated. Video and audio streaming enabled.', time: '10:02', isHost: true },
  { id: '3', sender: 'Sakshi M.', text: 'Will this meeting be auto-summarized by Gemini?', time: '10:03', isHost: false },
  { id: '4', sender: 'Prof. Sharma', text: 'Yes, full transcript and task action items will be reviewed at the end.', time: '10:05', isHost: true },
];

const reactions = [
  { emoji: '👍', label: 'Like' }, { emoji: '❤️', label: 'Love' },
  { emoji: '😂', label: 'Haha' }, { emoji: '👏', label: 'Clap' },
  { emoji: '🔥', label: 'Fire' }, { emoji: '💡', label: 'Idea' },
];

export default function LiveMeetingPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = (params.roomId as string) || 'DEMO-ROOM';

  const [audioOn, setAudioOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [reactionsOpen, setReactionsOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [lockMute, setLockMute] = useState(false);
  const [chatMsg, setChatMsg] = useState('');
  const [messages, setMessages] = useState(chatMessages);
  const [activeReaction, setActiveReaction] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('All');
  const [taskDue, setTaskDue] = useState('');
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [activeSpeakerId] = useState('2');

  // Real WebRTC / LiveKit state
  const [liveKitToken, setLiveKitToken] = useState<string | null>(null);
  const [isLiveKitConnected, setIsLiveKitConnected] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const selfVideoRef = useRef<HTMLVideoElement>(null);

  // Meeting timer
  useEffect(() => {
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Fetch LiveKit Room Token
  useEffect(() => {
    async function initLiveKit() {
      try {
        const res = await fetch(`/api/livekit/token?room=${encodeURIComponent(roomId)}&username=You&isHost=true`);
        const data = await res.json();
        if (data.success && data.token) {
          setLiveKitToken(data.token);
          setIsLiveKitConnected(true);
        }
      } catch (err) {
        console.warn('LiveKit token generation note:', err);
      }
    }
    initLiveKit();
  }, [roomId]);

  // Real Camera & Mic Capture
  useEffect(() => {
    let stream: MediaStream | null = null;
    async function startMedia() {
      if (videoOn && typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: audioOn,
          });
          setLocalStream(stream);
          if (selfVideoRef.current) {
            selfVideoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.warn('Camera/mic access (permission denied or no camera device found):', err);
        }
      } else {
        if (localStream) {
          localStream.getTracks().forEach(track => track.stop());
          setLocalStream(null);
        }
      }
    }
    startMedia();

    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, [videoOn]);

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const sendMessage = () => {
    if (!chatMsg.trim()) return;
    setMessages(m => [
      ...m,
      {
        id: Date.now().toString(),
        sender: 'You',
        text: chatMsg,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        isHost: true,
      },
    ]);
    setChatMsg('');
  };

  const triggerReaction = (emoji: string) => {
    setActiveReaction(emoji);
    setReactionsOpen(false);
    setTimeout(() => setActiveReaction(null), 2500);
  };

  return (
    <div style={{ height: '100vh', background: '#080b14', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>

      {/* TOP BAR */}
      <div style={{ height: 52, background: 'rgba(13,17,23,0.95)', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.25rem', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-danger)' }} className="animate-recording" />
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>REC</span>
          </div>
          <div style={{ width: 1, height: 16, background: 'var(--color-border)' }} />
          <span style={{ fontWeight: 700, fontSize: '0.9375rem', fontFamily: 'var(--font-space-grotesk), sans-serif' }}>
            MeetFlow Room
          </span>
          <span className="badge badge-accent" style={{ fontSize: '0.7rem' }}>{roomId}</span>
          
          {/* LiveKit status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: isLiveKitConnected ? 'rgba(0,212,170,0.1)' : 'rgba(108,99,255,0.1)', padding: '0.2rem 0.6rem', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Radio size={12} color={isLiveKitConnected ? '#00d4aa' : '#8b85ff'} />
            <span style={{ fontSize: '0.7rem', color: isLiveKitConnected ? '#00d4aa' : '#8b85ff', fontWeight: 600 }}>
              {isLiveKitConnected ? 'LiveKit Cloud Active' : 'WebRTC Ready'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontVariantNumeric: 'tabular-nums', fontFamily: 'monospace' }}>
            {formatTime(elapsed)}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.25)', borderRadius: 20, padding: '0.25rem 0.75rem' }}>
            <div className="status-dot online" />
            <span style={{ fontSize: '0.75rem', color: 'var(--color-teal)', fontWeight: 600 }}>Live HD</span>
          </div>
        </div>
      </div>

      {/* MAIN VIDEO GRID AREA */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        <div style={{ flex: 1, padding: '1rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(2, 1fr)', gap: '0.75rem', alignContent: 'center' }}>
          
          {initialParticipants.map((p, i) => {
            const isSelf = p.id === '2';
            const isActive = p.id === activeSpeakerId;

            return (
              <motion.div key={p.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} style={{ height: '100%' }}>
                <div
                  className={`video-tile ${isActive ? 'active-speaker' : ''}`}
                  style={{
                    position: 'relative',
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#0d1117',
                    borderRadius: 14,
                    overflow: 'hidden',
                    border: isActive ? '2px solid #00d4aa' : '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  {/* REAL WEBRTC VIDEO FEED FOR SELF */}
                  {isSelf && videoOn && localStream ? (
                    <video
                      ref={selfVideoRef}
                      autoPlay
                      muted
                      playsInline
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transform: 'scaleX(-1)', // Mirror local camera
                      }}
                    />
                  ) : (
                    /* AVATAR FALLBACK */
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: 52, height: 52, borderRadius: '50%', background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem', color: 'white' }}>
                        {p.initials}
                      </div>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>{isSelf ? 'You (Camera Off)' : p.name}</span>
                    </div>
                  )}

                  {/* Tile Name Tag */}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0.5rem 0.625rem', background: 'linear-gradient(transparent, rgba(0,0,0,0.85))', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      {p.isHost && <Crown size={11} color="#f59e0b" />}
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'white' }}>{p.name}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      {isSelf ? (!audioOn && <MicOff size={12} color="var(--color-danger)" />) : (!p.audioOn && <MicOff size={12} color="var(--color-danger)" />)}
                      {p.handRaised && <span style={{ fontSize: '0.75rem' }}>✋</span>}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CHAT PANEL */}
        <AnimatePresence>
          {chatOpen && (
            <motion.div initial={{ x: 320 }} animate={{ x: 0 }} exit={{ x: 320 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{ width: 320, background: 'var(--color-bg-secondary)', borderLeft: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700 }}>Meeting Chat</span>
                <button onClick={() => setChatOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}><X size={16} /></button>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {messages.map(m => (
                  <div key={m.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: m.isHost ? 'var(--color-accent-light)' : 'var(--color-text-primary)' }}>{m.sender}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{m.time}</span>
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{m.text}</div>
                  </div>
                ))}
              </div>
              <div style={{ padding: '0.875rem', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '0.5rem' }}>
                <input id="chat-message-input" className="input-glass" style={{ borderRadius: 10, fontSize: '0.8125rem' }} placeholder="Type a message..." value={chatMsg} onChange={e => setChatMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} />
                <button onClick={sendMessage} style={{ background: 'var(--color-accent)', border: 'none', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                  <Send size={14} color="white" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PARTICIPANTS PANEL */}
        <AnimatePresence>
          {participantsOpen && (
            <motion.div initial={{ x: 320 }} animate={{ x: 0 }} exit={{ x: 320 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{ width: 300, background: 'var(--color-bg-secondary)', borderLeft: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700 }}>Participants ({initialParticipants.length})</span>
                <button onClick={() => setParticipantsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}><X size={16} /></button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem' }}>
                {initialParticipants.map(p => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', borderRadius: 10, marginBottom: '0.25rem' }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>{p.initials}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        {p.name}
                        {p.isHost && <Crown size={11} color="#f59e0b" />}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.375rem', color: 'var(--color-text-muted)' }}>
                      {p.audioOn ? <Mic size={13} /> : <MicOff size={13} color="var(--color-danger)" />}
                      {p.videoOn ? <Video size={13} /> : <VideoOff size={13} color="var(--color-danger)" />}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FLOATING REACTION */}
      <AnimatePresence>
        {activeReaction && (
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.5 }} animate={{ opacity: 1, y: 0, scale: 1.5 }} exit={{ opacity: 0, y: -60, scale: 0.5 }}
            style={{ position: 'absolute', bottom: 120, left: '50%', transform: 'translateX(-50%)', fontSize: '2.5rem', pointerEvents: 'none', zIndex: 99 }}>
            {activeReaction}
          </motion.div>
        )}
      </AnimatePresence>

      {/* CONTROLS BAR */}
      <div style={{ height: 72, background: 'rgba(13,17,23,0.97)', borderTop: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0 1.5rem', flexShrink: 0, position: 'relative' }}>

        {[
          { id: 'ctrl-audio', icon: audioOn ? Mic : MicOff, label: audioOn ? 'Mute' : 'Unmute', active: audioOn, color: audioOn ? undefined : 'var(--color-danger)', onClick: () => setAudioOn(!audioOn) },
          { id: 'ctrl-video', icon: videoOn ? Video : VideoOff, label: videoOn ? 'Stop Video' : 'Start Video', active: videoOn, color: videoOn ? undefined : 'var(--color-danger)', onClick: () => setVideoOn(!videoOn) },
          { id: 'ctrl-screen', icon: screenSharing ? MonitorOff : Monitor, label: screenSharing ? 'Stop Share' : 'Share Screen', active: screenSharing, onClick: () => setScreenSharing(!screenSharing) },
          { id: 'ctrl-hand', icon: Hand, label: handRaised ? 'Lower Hand' : 'Raise Hand', active: handRaised, color: handRaised ? 'var(--color-warning)' : undefined, onClick: () => setHandRaised(!handRaised) },
        ].map(ctrl => {
          const Icon = ctrl.icon;
          return (
            <button key={ctrl.id} id={ctrl.id} onClick={ctrl.onClick}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', background: ctrl.active ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '0.5rem 0.875rem', cursor: 'pointer', minWidth: 64, transition: 'all 0.2s', color: ctrl.color || 'var(--color-text-secondary)' }}>
              <Icon size={20} />
              <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>{ctrl.label}</span>
            </button>
          );
        })}

        {/* Reactions */}
        <div style={{ position: 'relative' }}>
          <button id="ctrl-reactions" onClick={() => setReactionsOpen(!reactionsOpen)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '0.5rem 0.875rem', cursor: 'pointer', minWidth: 64, color: 'var(--color-text-secondary)' }}>
            <span style={{ fontSize: '1.125rem' }}>😊</span>
            <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>React</span>
          </button>
          <AnimatePresence>
            {reactionsOpen && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                style={{ position: 'absolute', bottom: '120%', left: '50%', transform: 'translateX(-50%)', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 14, padding: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                {reactions.map(r => (
                  <button key={r.emoji} onClick={() => triggerReaction(r.emoji)}
                    style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: 'none', cursor: 'pointer', fontSize: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {r.emoji}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button id="ctrl-chat" onClick={() => { setChatOpen(!chatOpen); setParticipantsOpen(false); }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', background: chatOpen ? 'rgba(108,99,255,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${chatOpen ? 'var(--color-accent)' : 'var(--color-border)'}`, borderRadius: 12, padding: '0.5rem 0.875rem', cursor: 'pointer', minWidth: 64, color: chatOpen ? 'var(--color-accent-light)' : 'var(--color-text-secondary)' }}>
          <MessageSquare size={20} />
          <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>Chat</span>
        </button>

        <button id="ctrl-participants" onClick={() => { setParticipantsOpen(!participantsOpen); setChatOpen(false); }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', background: participantsOpen ? 'rgba(108,99,255,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${participantsOpen ? 'var(--color-accent)' : 'var(--color-border)'}`, borderRadius: 12, padding: '0.5rem 0.875rem', cursor: 'pointer', minWidth: 64, color: participantsOpen ? 'var(--color-accent-light)' : 'var(--color-text-secondary)', position: 'relative' }}>
          <Users size={20} />
          <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>People</span>
        </button>

        {/* More options */}
        <div style={{ position: 'relative' }}>
          <button id="ctrl-more" onClick={() => setMoreOpen(!moreOpen)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '0.5rem 0.875rem', cursor: 'pointer', minWidth: 64, color: 'var(--color-text-secondary)' }}>
            <MoreHorizontal size={20} />
            <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>More</span>
          </button>
          <AnimatePresence>
            {moreOpen && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                className="glass" style={{ position: 'absolute', bottom: '120%', right: 0, width: 200, borderRadius: 14, overflow: 'hidden' }}>
                {[
                  { icon: CheckSquare, label: 'Assign Task', onClick: () => { setTaskModalOpen(true); setMoreOpen(false); } },
                  { icon: lockMute ? Volume2 : VolumeX, label: lockMute ? 'Unlock Mute' : 'Lock Mute All', onClick: () => setLockMute(!lockMute) },
                  { icon: Shield, label: 'Security', onClick: () => {} },
                  { icon: Settings, label: 'Meeting Settings', onClick: () => {} },
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <button key={item.label} onClick={item.onClick}
                      style={{ width: '100%', padding: '0.75rem 1rem', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-text-secondary)', fontSize: '0.875rem', textAlign: 'left' }}>
                      <Icon size={16} /> {item.label}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* End call */}
        <button id="ctrl-end" onClick={() => setShowEndConfirm(true)}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', background: 'var(--color-danger)', border: 'none', borderRadius: 12, padding: '0.5rem 1.25rem', cursor: 'pointer', color: 'white', marginLeft: '0.5rem' }}>
          <PhoneOff size={20} />
          <span style={{ fontSize: '0.65rem', fontWeight: 700 }}>End</span>
        </button>
      </div>

      {/* ASSIGN TASK MODAL */}
      <AnimatePresence>
        {taskModalOpen && (
          <div className="modal-overlay" onClick={() => setTaskModalOpen(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="glass" style={{ borderRadius: 20, padding: '2rem', width: 400, maxWidth: '90vw' }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontWeight: 700, fontSize: '1.125rem' }}>Assign Task with AI</h2>
                <button onClick={() => setTaskModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}><X size={18} /></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, display: 'block', marginBottom: '0.375rem', color: 'var(--color-text-secondary)' }}>Task Title</label>
                  <input id="task-title-input" className="input-glass" placeholder="Implement WebRTC Token Auth" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, display: 'block', marginBottom: '0.375rem', color: 'var(--color-text-secondary)' }}>Assign To</label>
                  <select id="task-assignee-select" className="input-glass" value={taskAssignee} onChange={e => setTaskAssignee(e.target.value)} style={{ cursor: 'pointer' }}>
                    <option value="All">All Participants</option>
                    {initialParticipants.filter(p => !p.isHost).map(p => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, display: 'block', marginBottom: '0.375rem', color: 'var(--color-text-secondary)' }}>Due Date</label>
                  <input id="task-due-input" type="date" className="input-glass" value={taskDue} onChange={e => setTaskDue(e.target.value)} />
                </div>
                <button className="btn-primary" style={{ width: '100%', padding: '0.75rem', borderRadius: 12 }} onClick={() => setTaskModalOpen(false)}>
                  Assign Task
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* END MEETING CONFIRM */}
      <AnimatePresence>
        {showEndConfirm && (
          <div className="modal-overlay" onClick={() => setShowEndConfirm(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="glass" style={{ borderRadius: 20, padding: '2rem', width: 360, maxWidth: '90vw', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <PhoneOff size={24} color="var(--color-danger)" />
              </div>
              <h2 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>End Meeting & Review AI Summary?</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
                Ending the meeting will generate the AI summary for host review.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button className="btn-danger" style={{ width: '100%', padding: '0.75rem', borderRadius: 12 }} onClick={() => router.push(`/summary/${roomId}`)}>
                  End & Open AI Review
                </button>
                <button className="btn-secondary" style={{ width: '100%', padding: '0.75rem', borderRadius: 12 }} onClick={() => router.push('/dashboard')}>
                  Leave (Keep Meeting Active)
                </button>
                <button onClick={() => setShowEndConfirm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '0.875rem', padding: '0.5rem' }}>
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
