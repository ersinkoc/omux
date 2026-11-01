import React from 'react';
import {colors, fonts} from './theme';
import {Line, timedTranscript, TimedLine} from './script';

export const Dot: React.FC<{color: string; size?: number; style?: React.CSSProperties}> = ({
  color,
  size = 10,
  style,
}) => (
  <span
    style={{
      display: 'inline-block',
      width: size,
      height: size,
      borderRadius: size,
      background: color,
      boxShadow: `0 0 ${size * 0.8}px ${color}66`,
      flexShrink: 0,
      ...style,
    }}
  />
);

export const AgentsPill: React.FC<{scale: number; count?: number}> = ({scale, count = 5}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '3px 12px 3px 10px',
      borderRadius: 999,
      border: `1px solid ${colors.blue}66`,
      background: `${colors.blue}1A`,
      color: colors.blue,
      fontSize: 14,
      fontFamily: fonts.ui,
      transform: `scale(${scale})`,
      opacity: Math.min(1, scale),
      whiteSpace: 'nowrap',
    }}
  >
    <span style={{display: 'flex', gap: 3}}>
      {Array.from({length: count}).map((_, i) => (
        <span
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: 7,
            background: colors.blue,
            opacity: 0.9,
          }}
        />
      ))}
    </span>
    {count} agents
  </div>
);

export const TerminalHeader: React.FC<{
  title: string;
  provider: string;
  status: string;
  dot: string;
  right?: React.ReactNode;
  slim?: boolean;
}> = ({title, provider, status, dot, right, slim}) => (
  <div
    style={{
      height: slim ? 38 : 46,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '0 16px',
      background: colors.chrome,
      borderBottom: `1px solid ${colors.border}`,
      fontFamily: fonts.ui,
      fontSize: slim ? 15 : 16,
      flexShrink: 0,
    }}
  >
    <Dot color={dot} />
    <span style={{color: colors.text, fontWeight: 600}}>{title}</span>
    <span style={{color: colors.dim}}>{provider}</span>
    <span style={{color: colors.secondary}}>{status}</span>
    <div style={{flex: 1}} />
    {right}
  </div>
);

// Reveals lines of a transcript character by character based on frame.
export const timeLines = (lines: Line[], startFrame: number): TimedLine[] => {
  let t = startFrame;
  return lines.map((line) => {
    const cps = line.cps ?? 6;
    const frames = line.text.length === 0 ? 1 : Math.ceil(line.text.length / cps);
    const start = t;
    const end = start + frames;
    t = end + (line.gap ?? 0);
    return {...line, start, end};
  });
};

export const Transcript: React.FC<{
  frame: number;
  lines?: TimedLine[];
  fontSize?: number;
  lineHeight?: number;
}> = ({frame, lines = timedTranscript, fontSize = 16, lineHeight = 24}) => {
  const cursorOn = Math.floor(frame / 16) % 2 === 0;
  // Which line is being typed (or last typed)?
  let activeIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (frame >= lines[i].start) activeIndex = i;
  }
  return (
    <div
      style={{
        fontFamily: fonts.mono,
        fontSize,
        lineHeight: `${lineHeight}px`,
        color: colors.text,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        overflow: 'hidden',
      }}
    >
      {lines.map((l, i) => {
        if (frame < l.start) return null;
        const cps = l.cps ?? 6;
        const visible =
          frame >= l.end ? l.text.length : Math.min(l.text.length, Math.floor((frame - l.start) * cps));
        const text = l.text.slice(0, visible);
        const isActive = i === activeIndex;
        const stillTyping = frame < l.end;
        const showCursor = isActive && (stillTyping || cursorOn);
        return (
          <div key={i} style={{color: l.color ?? colors.text, minHeight: lineHeight}}>
            {text}
            {showCursor ? (
              <span
                style={{
                  display: 'inline-block',
                  width: fontSize * 0.6,
                  height: fontSize * 1.15,
                  background: colors.text,
                  verticalAlign: 'text-bottom',
                  marginLeft: 1,
                  opacity: 0.9,
                }}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
};
