'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const [showButton, setShowButton] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Show the capsule button after the intro animation plays (2.5 seconds), or on video end
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const handleVideoEnded = () => {
    setShowButton(true);
  };

  const handleScreenClick = () => {
    setShowButton(true);
  };

  return (
    <main
      onClick={handleScreenClick}
      style={{
        position: 'relative',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        background: '#000000',
        cursor: 'default',
      }}
    >
      {/* FULLSCREEN MP4 VIDEO */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
        }}
      >
        <video
          ref={videoRef}
          src="/dark-bg-animation.mp4"
          autoPlay
          muted
          playsInline
          preload="auto"
          onEnded={handleVideoEnded}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>

      {/* PURE GLASSMORPHISM CAPSULE "GET STARTED" BUTTON */}
      <div
        style={{
          position: 'absolute',
          bottom: '15%',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 50,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          pointerEvents: 'auto',
        }}
      >
        <AnimatePresence>
          {showButton && (
            <motion.div
              key="get-started-capsule"
              initial={{ opacity: 0, y: 25, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{
                type: 'spring',
                stiffness: 280,
                damping: 22,
              }}
            >
              <Link
                href="/auth/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.875rem',
                  padding: '1.1rem 3rem',
                  borderRadius: '9999px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  border: '1.5px solid rgba(255, 255, 255, 0.3)',
                  boxShadow:
                    '0 8px 32px 0 rgba(0, 0, 0, 0.45), inset 0 1px 2px 0 rgba(255, 255, 255, 0.45), 0 0 35px rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  fontSize: '1.1875rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  letterSpacing: '-0.01em',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  userSelect: 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.04)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.16)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.55)';
                  e.currentTarget.style.boxShadow =
                    '0 12px 40px 0 rgba(0, 0, 0, 0.6), inset 0 1px 3px 0 rgba(255, 255, 255, 0.6), 0 0 50px rgba(108, 99, 255, 0.45)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  e.currentTarget.style.boxShadow =
                    '0 8px 32px 0 rgba(0, 0, 0, 0.45), inset 0 1px 2px 0 rgba(255, 255, 255, 0.45), 0 0 35px rgba(255, 255, 255, 0.15)';
                }}
              >
                <span style={{ textShadow: '0 2px 10px rgba(0,0,0,0.6)' }}>Get Started</span>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.18)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.3)',
                  }}
                >
                  <ArrowRight size={17} color="#ffffff" />
                </div>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
