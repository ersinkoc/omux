import React from 'react';
import {AbsoluteFill, Easing, interpolate} from 'remotion';
import {colors} from '../theme';
import {Dot} from '../Terminal';
import {Logo} from '../Logo';
import {Abs, Caption, Kinetic, c01, hypeFont, monoFont, slam} from './Kinetic';

const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

// S1: "eight agents." letters slam in, eight status dots fire in below.
export const EightAgents: React.FC<{frame: number}> = ({frame}) => {
  const dotColors = [colors.blue, colors.blue, colors.green, colors.amber, colors.blue, colors.green, colors.blue, colors.amber];
  return (
    <AbsoluteFill>
      <Abs x={0} y={370} w={1920}>
        <Kinetic text="eight agents." frame={frame} start={0} size={210} split="letters" from="up" dist={110} />
      </Abs>
      <Abs x={0} y={660} w={1920} style={{display: 'flex', justifyContent: 'center', gap: 34}}>
        {dotColors.map((c, i) => {
          const p = slam(frame, 10 + i * 2, {damping: 10, stiffness: 300});
          return <Dot key={i} color={c} size={34} style={{transform: `scale(${Math.max(0, p)})`}} />;
        })}
      </Abs>
    </AbsoluteFill>
  );
};

// S2: a window outline draws itself around "one window." while eight tiny
// session rows cascade into its sidebar.
export const OneWindow: React.FC<{frame: number}> = ({frame}) => {
  const draw = interpolate(frame, [-2, 20], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const W = 1480;
  const H = 760;
  const x = (1920 - W) / 2;
  const y = (1080 - H) / 2;
  const divider = interpolate(frame, [10, 24], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const lightsP = slam(frame, 14, {damping: 10, stiffness: 300});
  return (
    <AbsoluteFill>
      <svg width="1920" height="1080" style={{position: 'absolute', inset: 0}}>
        <rect
          x={x}
          y={y}
          width={W}
          height={H}
          rx="26"
          fill={`${colors.chrome}66`}
          stroke={colors.border}
          strokeWidth="3"
          pathLength={1}
          strokeDasharray="1"
          strokeDashoffset={1 - draw}
          opacity={0.9}
        />
        <line x1={x + 300} y1={y + 3} x2={x + 300} y2={y + 3 + (H - 6) * divider} stroke={colors.border} strokeWidth="3" />
        <line x1={x + 3} y1={y + 58} x2={x + 3 + (W - 6) * divider} y2={y + 58} stroke={colors.border} strokeWidth="2" opacity={0.7} />
      </svg>
      <Abs x={x + 26} y={y + 20} style={{display: 'flex', gap: 12, transform: `scale(${Math.max(0, lightsP)})`, transformOrigin: 'left center'}}>
        {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
          <span key={c} style={{width: 18, height: 18, borderRadius: 18, background: c}} />
        ))}
      </Abs>
      {Array.from({length: 8}).map((_, i) => {
        const p = slam(frame, 14 + i * 2, {damping: 14, stiffness: 220});
        const dc = [colors.blue, colors.green, colors.amber, colors.blue, colors.blue, colors.dim, colors.green, colors.blue][i];
        return (
          <Abs
            key={i}
            x={x + 28}
            y={y + 90 + i * 74}
            style={{display: 'flex', alignItems: 'center', gap: 16, opacity: c01(p * 1.5), transform: `translateX(${(1 - p) * -60}px)`}}
          >
            <Dot color={dc} size={16} />
            <span style={{width: 150 + (i % 3) * 30, height: 14, borderRadius: 8, background: '#3A3A41'}} />
          </Abs>
        );
      })}
      <Abs x={x + 300} y={y + 58 + 170} w={W - 300}>
        <Kinetic text="one window." frame={frame} start={-1} size={200} split="none" from="scale" damping={14} stiffness={200} />
      </Abs>
    </AbsoluteFill>
  );
};

// S6: "nothing gets lost." words alternate in from left and right.
export const NothingLost: React.FC<{frame: number}> = ({frame}) => {
  const chips = [
    {t: 'quit', c: colors.secondary, at: 24},
    {t: 'relaunch', c: colors.secondary, at: 30},
    {t: 'resumed.', c: colors.green, at: 36},
  ];
  return (
    <AbsoluteFill>
      <Abs x={0} y={360} w={1920}>
        <Kinetic text="nothing gets lost." frame={frame} start={-3} size={190} split="words" stagger={3} from={["left", "right", "left"]} dist={160} damping={14} />
      </Abs>
      <Abs x={0} y={640} w={1920} style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 26}}>
        {chips.map((ch, i) => {
          const p = slam(frame, ch.at, {damping: 11, stiffness: 260});
          return (
            <React.Fragment key={ch.t}>
              {i > 0 ? (
                <span style={{color: colors.dim, fontSize: 40, fontFamily: hypeFont, opacity: c01(p * 2)}}>→</span>
              ) : null}
              <span
                style={{
                  fontFamily: monoFont,
                  fontSize: 34,
                  fontWeight: 600,
                  color: ch.c,
                  background: colors.chromeRaised,
                  border: `2px solid ${ch.c === colors.green ? colors.green : colors.border}`,
                  borderRadius: 16,
                  padding: '12px 28px',
                  transform: `scale(${Math.max(0, p)})`,
                  opacity: c01(p * 1.5),
                }}
              >
                {ch.t}
              </span>
            </React.Fragment>
          );
        })}
      </Abs>
      <Abs x={0} y={760} w={1920}>
        <Caption text="every session keeps its exact conversation across restarts." frame={frame} start={40} size={34} />
      </Abs>
    </AbsoluteFill>
  );
};

// S9: "branch. review. merge." punch in as a staircase, each in its own colour.
export const BranchReviewMerge: React.FC<{frame: number}> = ({frame}) => {
  const words = [
    {t: "branch.", c: colors.violet, x: 200, y: 180, at: -2},
    {t: 'review.', c: colors.cyan, x: 480, y: 360, at: 6},
    {t: 'merge.', c: colors.green, x: 760, y: 540, at: 12},
  ];
  const pills = [
    {t: "checks passed", at: 22},
    {t: "review approved", at: 26},
    {t: "merged", at: 30},
  ];
  return (
    <AbsoluteFill>
      {words.map((w) => (
        <Abs key={w.t} x={w.x} y={w.y}>
          <Kinetic text={w.t} frame={frame} start={w.at} size={180} split="none" from="scale" color={w.c} align="left" damping={12} stiffness={260} />
        </Abs>
      ))}
      <Abs x={0} y={820} w={1920} style={{display: 'flex', justifyContent: 'center', gap: 22}}>
        {pills.map((p) => {
          const s = slam(frame, p.at, {damping: 11, stiffness: 260});
          return (
            <span
              key={p.t}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 12,
                fontFamily: hypeFont,
                fontWeight: 600,
                fontSize: 30,
                color: colors.green,
                background: `${colors.green}1A`,
                border: `2px solid ${colors.green}66`,
                borderRadius: 999,
                padding: '10px 26px',
                transform: `scale(${Math.max(0, s)})`,
                opacity: c01(s * 1.5),
              }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={colors.green} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12l5 5L20 7" />
              </svg>
              {p.t}
            </span>
          );
        })}
      </Abs>
    </AbsoluteFill>
  );
};

// S11: three rapid-fire beats, hard cuts between them.
export const FiveMB: React.FC<{frame: number}> = ({frame}) => {
  const beats = [
    {t: '5 MB.', sub: 'the whole app.', c: colors.cyan},
    {t: 'native.', sub: 'Swift and SwiftTerm. no Electron.', c: colors.green},
    {t: 'no telemetry.', sub: 'launches instantly.', c: colors.violet},
  ];
  const BEAT = 20;
  const i = Math.min(beats.length - 1, Math.floor(frame / BEAT));
  const local = frame - i * BEAT;
  const b = beats[i];
  const tint = interpolate(local, [0, 3], [0.28, 0], clamp);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: b.c, opacity: tint}} />
      <Abs x={0} y={380} w={1920}>
        <Kinetic text={b.t} frame={local} start={0} size={i === 2 ? 200 : 230} split="none" from="scale" color={b.c} damping={12} stiffness={300} />
      </Abs>
      <Abs x={0} y={660} w={1920}>
        <Caption text={b.sub} frame={local} start={3} size={40} color={colors.text} />
      </Abs>
    </AbsoluteFill>
  );
};

// S12: logo slams in, ring draws, "omux" letters land, tagline, hold.
export const Outro: React.FC<{frame: number}> = ({frame}) => {
  const logoP = slam(frame, -6, {damping: 12, stiffness: 170, mass: 0.9});
  const ring = interpolate(frame, [2, 28], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const tag = slam(frame, 26, {damping: 16, stiffness: 150});
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: -20}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 48}}>
          <div style={{transform: `scale(${Math.max(0, logoP)})`, opacity: c01(logoP * 1.5)}}>
            <Logo size={230} progress={ring} id="hype-outro" />
          </div>
          <Kinetic text="omux" frame={frame} start={-2} size={200} split="letters" stagger={2} from="up" dist={120} weight={700} tracking={-0.04} align="left" damping={12} stiffness={220} />
        </div>
        <div
          style={{
            marginTop: 44,
            fontFamily: hypeFont,
            fontSize: 36,
            fontWeight: 500,
            color: colors.secondary,
            opacity: c01(tag * 1.4),
            transform: `translateY(${(1 - tag) * 20}px)`,
            display: 'flex',
            gap: 20,
            alignItems: 'center',
          }}
        >
          <span style={{color: colors.text}}>omux.app</span>
          <span style={{color: colors.dim}}>·</span>
          <span>free</span>
          <span style={{color: colors.dim}}>·</span>
          <span>open source</span>
          <span style={{color: colors.dim}}>·</span>
          <span>macOS</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
