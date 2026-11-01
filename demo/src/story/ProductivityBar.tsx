import React from 'react';
import {Easing, interpolate} from 'remotion';
import {colors} from '../theme';
import {c01, hypeFont, slam} from '../hype/Kinetic';

const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

// Story timeline anchors (global frames) the bar follows.
export const BAR = {
  topIn: 8,
  topOut: 262, // act 1 ends at 270
  bottomIn: 470, // panes beat, act 2
  full: 960, // hits 100 % in the "productivity: 100%." beat
  bottomOut: 996,
};

// Value 0..100 as a function of the global frame: drains in act 1, climbs from act 2 on.
export const barValue = (frame: number): number => {
  if (frame < 270) {
    return interpolate(frame, [20, 250], [94, 30], {...clamp, easing: Easing.inOut(Easing.quad)});
  }
  return interpolate(frame, [470, 600, 660, 730, 810, 860, 930, BAR.full], [30, 42, 52, 62, 74, 84, 94, 100], clamp);
};

const hex = (h: string) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mix = (a: string, b: string, t: number) => {
  const A = hex(a);
  const B = hex(b);
  const c = A.map((v, i) => Math.round(v + (B[i] - v) * c01(t)));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
};
export const barColor = (v: number) => (v >= 65 ? mix(colors.amber, colors.green, (v - 65) / 25) : mix(colors.red, colors.amber, (v - 30) / 35));

export const ProductivityBar: React.FC<{frame: number}> = ({frame}) => {
  const top = frame < 270;
  let y: number;
  let opacity = 1;
  if (top) {
    if (frame < BAR.topIn) return null;
    const p = slam(frame, BAR.topIn, {damping: 15, stiffness: 180});
    const out = interpolate(frame, [BAR.topOut, 270], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
    y = 40 - (1 - p) * 120 - out * 160;
  } else {
    if (frame < BAR.bottomIn || frame > BAR.bottomOut + 8) return null;
    const p = slam(frame, BAR.bottomIn, {damping: 15, stiffness: 180});
    opacity = interpolate(frame, [BAR.bottomOut, BAR.bottomOut + 8], [1, 0], clamp);
    y = 940 + (1 - p) * 140;
  }
  const v = barValue(frame);
  const color = barColor(v);
  const W = 1100;
  const pulse = frame >= BAR.full ? interpolate(frame, [BAR.full, BAR.full + 30], [0, 1], {...clamp, easing: Easing.out(Easing.quad)}) : 0;
  const ring = pulse > 0 && pulse < 1;
  return (
    <div style={{position: 'absolute', left: (1920 - W) / 2, top: y, width: W, opacity, fontFamily: hypeFont}}>
      <div style={{display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8}}>
        <span style={{fontSize: 28, fontWeight: 600, color: colors.secondary, letterSpacing: '-0.01em'}}>your productivity</span>
        <span style={{fontSize: 44, fontWeight: 800, color, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums'}}>{Math.round(v)}%</span>
      </div>
      <div style={{position: 'relative', height: 44, borderRadius: 22, background: '#232327', border: `2px solid ${colors.border}`, overflow: 'visible'}}>
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: `${v}%`,
            borderRadius: 22,
            background: color,
            boxShadow: `0 0 ${18 + pulse * 30}px ${color}88`,
          }}
        />
        {ring ? (
          <div
            style={{
              position: 'absolute',
              left: -8,
              top: -8,
              right: -8,
              bottom: -8,
              borderRadius: 30,
              border: `4px solid ${colors.green}`,
              transform: `scale(${1 + pulse * 0.12}, ${1 + pulse * 1.6})`,
              opacity: 1 - pulse,
            }}
          />
        ) : null}
      </div>
    </div>
  );
};
