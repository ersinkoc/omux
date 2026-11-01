import React from 'react';
import {spring} from 'remotion';
import {colors, FPS} from '../theme';

// Font stack for the hype video: SF Pro on macOS, system-ui elsewhere.
export const hypeFont = '-apple-system, system-ui, "SF Pro Display", "Helvetica Neue", Helvetica, sans-serif';
export const monoFont = 'ui-monospace, "SF Mono", Menlo, Monaco, monospace';

// A snappy spring with ~15% overshoot. Returns 0 before `start`.
export const slam = (
  frame: number,
  start: number,
  cfg: {damping?: number; stiffness?: number; mass?: number} = {},
) =>
  frame < start
    ? 0
    : spring({
        frame: frame - start,
        fps: FPS,
        config: {damping: cfg.damping ?? 13, stiffness: cfg.stiffness ?? 240, mass: cfg.mass ?? 0.7},
      });

export const c01 = (v: number) => Math.max(0, Math.min(1, v));

export type From = 'up' | 'down' | 'left' | 'right' | 'scale' | 'pop';

type KineticProps = {
  text: string;
  frame: number;
  start?: number;
  size?: number;
  split?: 'letters' | 'words' | 'none';
  stagger?: number; // frames between units; defaults to 1 for letters, 2 for words
  from?: From | From[]; // one per unit when an array (cycles)
  color?: string;
  unitColors?: string[]; // per unit (cycles)
  align?: 'left' | 'center' | 'right';
  weight?: number;
  tracking?: number; // em
  dist?: number; // px travelled for directional entries
  damping?: number;
  stiffness?: number;
  style?: React.CSSProperties;
};

const unitTransform = (from: From, p: number, dist: number) => {
  const r = 1 - p;
  switch (from) {
    case 'up':
      return `translateY(${r * dist}px) scale(${0.9 + 0.1 * p})`;
    case 'down':
      return `translateY(${-r * dist}px) scale(${0.9 + 0.1 * p})`;
    case 'left':
      return `translateX(${-r * dist}px)`;
    case 'right':
      return `translateX(${r * dist}px)`;
    case 'scale':
      return `scale(${1 + r * 0.7})`;
    case 'pop':
      return `scale(${Math.max(0, p)})`;
  }
};

export const Kinetic: React.FC<KineticProps> = ({
  text,
  frame,
  start = 0,
  size = 160,
  split = 'words',
  stagger,
  from = 'up',
  color = colors.text,
  unitColors,
  align = 'center',
  weight = 800,
  tracking = -0.045,
  dist = 90,
  damping = 14,
  stiffness = 300,
  style,
}) => {
  const step = stagger ?? (split === "letters" ? 1 : 2);
  const units: string[] =
    split === 'letters' ? Array.from(text) : split === 'words' ? text.split(' ') : [text];
  const froms = Array.isArray(from) ? from : [from];
  return (
    <div
      style={{
        fontFamily: hypeFont,
        fontWeight: weight,
        fontSize: size,
        letterSpacing: `${tracking}em`,
        lineHeight: 1,
        color,
        textAlign: align,
        whiteSpace: 'pre',
        ...style,
      }}
    >
      {units.map((u, i) => {
        const f = froms[i % froms.length];
        const p = slam(frame, start + i * step, {damping, stiffness});
        const pc = c01(p);
        const blur = f === 'scale' ? (1 - pc) * 16 : (1 - pc) * 6;
        const uc = unitColors ? unitColors[i % unitColors.length] : undefined;
        return (
          <React.Fragment key={i}>
            <span
              style={{
                display: 'inline-block',
                transform: unitTransform(f, p, dist),
                opacity: c01(pc * 1.5),
                filter: blur > 0.3 ? `blur(${blur.toFixed(1)}px)` : undefined,
                color: uc,
                transformOrigin: 'center',
              }}
            >
              {u}
            </span>
            {split === 'words' && i < units.length - 1 ? <span> </span> : null}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// Absolutely positioned box, the layout primitive for every scene.
export const Abs: React.FC<{
  x: number;
  y: number;
  w?: number;
  h?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({x, y, w, h, style, children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, ...style}}>{children}</div>
);

// Small secondary caption that rises in.
export const Caption: React.FC<{
  text: string;
  frame: number;
  start: number;
  size?: number;
  color?: string;
  align?: 'left' | 'center' | 'right';
  mono?: boolean;
}> = ({text, frame, start, size = 36, color = colors.secondary, align = 'center', mono}) => {
  const p = slam(frame, start, {damping: 16, stiffness: 160});
  return (
    <div
      style={{
        fontFamily: mono ? monoFont : hypeFont,
        fontWeight: 500,
        fontSize: size,
        color,
        textAlign: align,
        opacity: c01(p * 1.4),
        transform: `translateY(${(1 - p) * 24}px)`,
        letterSpacing: mono ? 0 : '-0.01em',
      }}
    >
      {text}
    </div>
  );
};
