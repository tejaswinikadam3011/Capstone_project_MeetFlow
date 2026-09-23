'use client';

import React from 'react';

interface NewtonsCradleProps {
  size?: number;
  speed?: number;
  color?: string;
  label?: string;
}

export default function NewtonsCradleLoader({
  size = 50,
  speed = 1.2,
  color = '#a78bfa',
  label,
}: NewtonsCradleProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.25rem',
      }}
    >
      <div
        className="newtons-cradle"
        style={
          {
            '--uib-size': `${size}px`,
            '--uib-speed': `${speed}s`,
            '--uib-color': color,
          } as React.CSSProperties
        }
      >
        <div className="newtons-cradle__dot" />
        <div className="newtons-cradle__dot" />
        <div className="newtons-cradle__dot" />
        <div className="newtons-cradle__dot" />
      </div>

      {label && (
        <span
          style={{
            fontSize: '0.9375rem',
            fontWeight: 600,
            color: 'rgba(255, 255, 255, 0.85)',
            letterSpacing: '0.01em',
            textAlign: 'center',
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
