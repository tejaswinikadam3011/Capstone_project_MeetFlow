'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Video, Sparkles, ShieldCheck, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '1.75rem 2rem',
        position: 'relative',
        zIndex: 10,
        overflow: 'hidden',
      }}
    >
      {/* Top Header Bar */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          maxWidth: 960,
          margin: '0 auto',
          fontSize: '0.875rem',
          fontWeight: 500,
          color: 'rgba(255, 255, 255, 0.75)',
          letterSpacing: '-0.01em',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#00f2c3',
              boxShadow: '0 0 10px #00f2c3',
            }}
          />
          <span style={{ color: '#ffffff', fontWeight: 600 }}>MeetFlow</span>
          <span style={{ color: 'rgba(255, 255, 255, 0.4)' }}>—</span>
          <span>Smart College Collaboration</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>Gemini 2.5 Flash</span>
          <Link
            href="/auth/login"
            style={{
              color: '#ffffff',
              textDecoration: 'none',
              fontSize: '0.8125rem',
              fontWeight: 600,
              padding: '0.35rem 0.85rem',
              borderRadius: 9999,
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
            }}
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Center Hero Portrait Glassmorphism Card (Exact Reference UI) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          margin: '2rem auto',
          width: '100%',
          maxWidth: 480,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="figma-glass-card"
          style={{
            width: '100%',
            minHeight: 560,
            padding: '3rem 2.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          {/* Card Top Label */}
          <div>
            <div
              style={{
                fontSize: '1rem',
                fontWeight: 500,
                color: 'rgba(255, 255, 255, 0.78)',
                letterSpacing: '-0.01em',
                marginBottom: '1.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Sparkles size={16} color="#c084fc" />
              <span>Let&apos;s collaborate</span>
            </div>

            {/* Giant Clean Typography (matching the reference image) */}
            <h1
              style={{
                fontSize: '3.25rem',
                fontWeight: 800,
                lineHeight: 1.08,
                letterSpacing: '-0.035em',
                color: '#ffffff',
                marginBottom: '1.5rem',
                fontFamily: 'var(--font-space-grotesk), sans-serif',
              }}
            >
              AI<br />
              Meeting<br />
              Flow
            </h1>

            <p
              style={{
                fontSize: '0.9375rem',
                color: 'rgba(255, 255, 255, 0.68)',
                lineHeight: 1.55,
                maxWidth: 340,
              }}
            >
              Real-time video conferencing, automated Gemini 2.5 summaries, timestamp citations & autonomous task management.
            </p>
          </div>

          {/* Card Bottom: Glass Capsule Action Button */}
          <div style={{ paddingTop: '2rem' }}>
            <Link
              href="/auth/login"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.95rem 1.4rem',
                borderRadius: 9999,
                background: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1.2px solid rgba(255, 255, 255, 0.35)',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35), inset 0 1px 1.5px rgba(255, 255, 255, 0.45)',
                color: '#ffffff',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '1rem',
                transition: 'all 0.25s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.22)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.6)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(147, 51, 234, 0.45), inset 0 1px 2px rgba(255, 255, 255, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.35)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.35), inset 0 1px 1.5px rgba(255, 255, 255, 0.45)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Video size={16} color="#ffffff" />
                </div>
                <span>Get Started</span>
              </div>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                }}
              >
                <ArrowRight size={17} color="#ffffff" />
              </div>
            </Link>

            <div
              style={{
                marginTop: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.75rem',
                color: 'rgba(255, 255, 255, 0.5)',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <ShieldCheck size={13} color="#00f2c3" /> Zero Setup Required
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Zap size={13} color="#c084fc" /> Instant WebRTC
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Footer Bar (matching the reference footer) */}
      <footer
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          maxWidth: 960,
          margin: '0 auto',
          fontSize: '0.8125rem',
          color: 'rgba(255, 255, 255, 0.65)',
        }}
      >
        <span>MeetFlow® Platform</span>
        <span style={{ opacity: 0.4 }}>x</span>
        <span>College Classrooms & Teams</span>
      </footer>
    </main>
  );
}
