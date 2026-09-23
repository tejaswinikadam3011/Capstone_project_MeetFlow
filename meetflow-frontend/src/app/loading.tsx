'use client';

import NewtonsCradleLoader from '@/components/NewtonsCradleLoader';

export default function Loading() {
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 50,
      }}
    >
      <div
        className="glass-card"
        style={{
          padding: '2.5rem 3.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.5), 0 0 35px rgba(124, 58, 237, 0.4)',
        }}
      >
        <NewtonsCradleLoader size={56} speed={1.2} color="#c4b5fd" label="Loading MeetFlow..." />
      </div>
    </div>
  );
}
