import React from 'react';
import {AbsoluteFill} from 'remotion';
import {colors} from '../theme';

// Slow gradient drift in cyan/violet plus a faint grid. Never busy.
export const Background: React.FC<{frame: number}> = ({frame}) => {
  const t = frame / 30;
  const x1 = 28 + Math.sin(t * 0.33) * 9;
  const y1 = 32 + Math.cos(t * 0.26) * 9;
  const x2 = 74 + Math.cos(t * 0.29) * 8;
  const y2 = 70 + Math.sin(t * 0.21) * 8;
  const shift = (frame * 0.35) % 80;
  return (
    <AbsoluteFill style={{background: colors.bg, overflow: 'hidden'}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(1000px 760px at ${x1}% ${y1}%, rgba(34,211,238,0.11), rgba(34,211,238,0) 70%), radial-gradient(1000px 760px at ${x2}% ${y2}%, rgba(167,139,250,0.10), rgba(167,139,250,0) 70%)`,
        }}
      />
      <svg width="1920" height="1080" style={{position: 'absolute', inset: 0}}>
        <defs>
          <pattern id="hype-grid" width="80" height="80" patternUnits="userSpaceOnUse" x={shift} y={shift}>
            <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#FFFFFF" strokeOpacity="0.045" strokeWidth="1" />
          </pattern>
          <radialGradient id="hype-vig" cx="50%" cy="50%" r="70%">
            <stop offset="55%" stopColor="#000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.55" />
          </radialGradient>
        </defs>
        <rect width="1920" height="1080" fill="url(#hype-grid)" />
        <rect width="1920" height="1080" fill="url(#hype-vig)" />
      </svg>
    </AbsoluteFill>
  );
};
