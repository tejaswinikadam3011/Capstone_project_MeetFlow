'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';

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

      {/* GLASSMORPHISM CAPSULE "GET STARTED" BUTTON */}
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
                className="flex justify-center gap-3 items-center mx-auto text-lg font-bold isolation-auto before:absolute before:w-full before:transition-all before:duration-700 before:hover:w-full before:-left-full before:hover:left-0 before:rounded-full before:bg-gradient-to-r before:from-[#6c63ff] before:to-[#00d4aa] text-white hover:text-white before:-z-10 before:aspect-square before:hover:scale-150 before:hover:duration-700 relative z-10 px-8 py-3.5 overflow-hidden rounded-full group cursor-pointer transition-all duration-300"
                style={{
                  textDecoration: 'none',
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  border: '1.5px solid rgba(255, 255, 255, 0.28)',
                  boxShadow:
                    '0 8px 32px 0 rgba(0, 0, 0, 0.5), inset 0 1px 2px 0 rgba(255, 255, 255, 0.45), 0 0 45px rgba(108, 99, 255, 0.45), 0 0 80px rgba(0, 212, 170, 0.25)',
                  letterSpacing: '-0.01em',
                }}
              >
                <span style={{ textShadow: '0 2px 10px rgba(0,0,0,0.6)' }}>Get Started</span>
                <div
                  className="w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 group-hover:rotate-90"
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.35)',
                    boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.3)',
                  }}
                >
                  <svg
                    className="w-4 h-4 text-white rotate-45 transition-transform duration-300"
                    viewBox="0 0 16 19"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7 18C7 18.5523 7.44772 19 8 19C8.55228 19 9 18.5523 9 18H7ZM8.70711 0.292893C8.31658 -0.0976311 7.68342 -0.0976311 7.29289 0.292893L0.928932 6.65685C0.538408 7.04738 0.538408 7.68054 0.928932 8.07107C1.31946 8.46159 1.95262 8.46159 2.34315 8.07107L8 2.41421L13.6569 8.07107C14.0474 8.46159 14.6805 8.46159 15.0711 8.07107C15.4616 7.68054 15.4616 7.04738 15.0711 6.65685L8.70711 0.292893ZM9 18L9 1H7L7 18H9Z"
                      fill="#ffffff"
                    />
                  </svg>
                </div>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
