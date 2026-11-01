import React from 'react';
import {colors} from './theme';

// Thick ring with a green/cyan to violet gradient on a black rounded tile.
export const Logo: React.FC<{
  size: number;
  progress: number; // 0..1, how much of the ring is drawn
  id?: string;
  glow?: number; // 0..1
}> = ({size, progress, id = 'logo', glow = 1}) => {
  const r = 34;
  const c = 2 * Math.PI * r;
  const sw = 17;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 128 128"
      style={{display: 'block'}}
    >
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={colors.green} />
          <stop offset="0.45" stopColor={colors.cyan} />
          <stop offset="1" stopColor={colors.violet} />
        </linearGradient>
        <linearGradient id={`${id}-tile`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#101013" />
          <stop offset="1" stopColor="#000000" />
        </linearGradient>
        <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>
      <rect
        x="4"
        y="4"
        width="120"
        height="120"
        rx="28"
        fill={`url(#${id}-tile)`}
        stroke="#2A2A2E"
        strokeWidth="1.5"
      />
      <circle
        cx="64"
        cy="64"
        r={r}
        fill="none"
        stroke={colors.cyan}
        strokeWidth={sw + 6}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - progress)}
        transform="rotate(-90 64 64)"
        opacity={0.45 * glow}
        filter={`url(#${id}-glow)`}
      />
      <circle
        cx="64"
        cy="64"
        r={r}
        fill="none"
        stroke={`url(#${id}-g)`}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - progress)}
        transform="rotate(-90 64 64)"
      />
    </svg>
  );
};
