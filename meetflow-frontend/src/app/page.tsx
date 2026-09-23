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

      {/* CAPSULE "GET STARTED" BUTTON (Centered below the video's MeetFlow branding) */}
      <div
        style={{
          position: 'absolute',
          bottom: '16%',
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
                  padding: '1.15rem 3rem',
                  borderRadius: '9999px',
                  background: 'linear-gradient(135deg, #6c63ff 0%, #00d4aa 100%)',
                  color: '#ffffff',
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  letterSpacing: '-0.01em',
                  boxShadow: '0 0 45px rgba(108, 99, 255, 0.75), 0 0 90px rgba(0, 212, 170, 0.5)',
                  border: '2px solid rgba(255, 255, 255, 0.4)',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  userSelect: 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
                  e.currentTarget.style.boxShadow =
                    '0 0 65px rgba(108, 99, 255, 1), 0 0 110px rgba(0, 212, 170, 0.8)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow =
                    '0 0 45px rgba(108, 99, 255, 0.75), 0 0 90px rgba(0, 212, 170, 0.5)';
                }}
              >
                <span>Get Started</span>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ArrowRight size={19} color="#ffffff" />
                </div>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
