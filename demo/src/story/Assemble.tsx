import React from 'react';
import {AbsoluteFill, Easing, interpolate} from 'remotion';
import {colors, T} from '../theme';
import {Sidebar} from '../Sidebar';
import {TerminalHeader, Transcript, timeLines} from '../Terminal';
import {Line, codexTranscript, transcript} from '../script';
import {Logo} from '../Logo';
import {Abs, Kinetic, c01, slam} from '../hype/Kinetic';
import {ChaosTerminal, chaosWindows} from './Chaos';

const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

export const WIN = {x: 80, y: 200, w: 1760, h: 700};
export const SIDEBAR_W = 320;
export const SIDEBAR_SETTLED = 190; // a Sidebar frame with every row in place and nothing pending

// Transcripts typed three times faster than the intro so short beats fill up.
export const fast = (ls: Line[], factor = 3): Line[] => ls.map((l) => ({...l, cps: (l.cps ?? 6) * factor, gap: Math.min(2, l.gap ?? 0)}));

const WindowFrame: React.FC<{scale: number; opacity: number; children: React.ReactNode}> = ({scale, opacity, children}) => (
  <div
    style={{
      position: 'absolute',
      left: WIN.x,
      top: WIN.y,
      width: WIN.w,
      height: WIN.h,
      borderRadius: 14,
      background: colors.bg,
      border: `1px solid ${colors.border}`,
      boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
      overflow: 'hidden',
      display: 'flex',
      transform: `scale(${scale})`,
      transformOrigin: 'center',
      opacity,
    }}
  >
    {children}
  </div>
);

// Act 2a: the logo lands, the scattered terminals are pulled into it, the omux window assembles.
export const GatherScene: React.FC<{frame: number}> = ({frame}) => {
  const logoP = slam(frame, -4, {damping: 12, stiffness: 170, mass: 0.9});
  const ring = interpolate(frame, [0, 24], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const logoOut = interpolate(frame, [74, 88], [1, 0], {...clamp, easing: Easing.in(Easing.cubic)});
  const winIn = slam(frame, 86, {damping: 16, stiffness: 140});
  const sidebarFrame = frame - 96 + T.windowStart + 18; // row cascade starts at local 96
  const mainLines = timeLines(fast(transcript.slice(0, 12)), 122);
  return (
    <AbsoluteFill>
      {chaosWindows.map((w, i) => {
        const s = 12 + i * 6;
        const p = interpolate(frame, [s, s + 18], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
        if (p >= 1) return null;
        const cx = w.x + w.w / 2;
        const cy = w.y + w.h / 2;
        return (
          <ChaosTerminal
            key={w.title}
            w={w}
            frame={frame}
            style={{
              zIndex: 5 + i,
              opacity: 1 - p,
              transform: `translate(${(960 - cx) * p}px, ${(540 - cy) * p}px) rotate(${w.rot * (1 - p)}deg) scale(${1 - 0.95 * p})`,
              transformOrigin: 'center',
              filter: 'saturate(0.6)',
            }}
          />
        );
      })}

      <Abs x={960 - 130} y={540 - 130} style={{zIndex: 40, transform: `scale(${Math.max(0, logoP) * logoOut})`, transformOrigin: 'center', opacity: c01(logoP * 1.5)}}>
        <Logo size={260} progress={ring} id="story-gather" />
      </Abs>

      {frame >= 86 ? (
        <WindowFrame scale={0.92 + 0.08 * c01(winIn)} opacity={c01(winIn * 1.6)}>
          <Sidebar frame={sidebarFrame} width={SIDEBAR_W} />
          <div style={{flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', opacity: interpolate(frame, [112, 124], [0, 1], clamp)}}>
            <TerminalHeader title="Settings i18n" provider="Claude Code" status="Working…" dot={colors.blue} />
            <div style={{padding: '14px 18px', flex: 1, overflow: 'hidden'}}>
              <Transcript frame={frame} lines={mainLines} fontSize={17} lineHeight={26} />
            </div>
          </div>
        </WindowFrame>
      ) : null}

      <Abs x={0} y={56} w={1920}>
        <Kinetic text="one window. every agent." frame={frame} start={98} size={104} from="up" unitColors={[colors.text, colors.text, colors.text, colors.cyan]} />
      </Abs>
    </AbsoluteFill>
  );
};

type PaneSpec = {title: string; provider: string; lines: Line[]; dot: string; at: number};

// Act 2b: the main area becomes a pane canvas; sessions snap into a bento.
export const PanesScene: React.FC<{frame: number}> = ({frame}) => {
  const MAIN_W = WIN.w - SIDEBAR_W;
  const right = c01(slam(frame, 20, {damping: 18, stiffness: 170}));
  const rightBottom = c01(slam(frame, 50, {damping: 18, stiffness: 170}));
  const leftBottom = c01(slam(frame, 80, {damping: 18, stiffness: 170}));
  const rightW = (MAIN_W / 2) * right;
  const leftW = MAIN_W - rightW;
  const panes: Record<string, PaneSpec> = {
    a: {title: 'Settings i18n', provider: 'Claude Code', lines: transcript.slice(0, 12), dot: colors.blue, at: 0},
    b: {title: 'Rate limiting middleware', provider: 'Codex', lines: codexTranscript, dot: colors.blue, at: 22},
    c: {title: 'Fix checkout bug', provider: 'Claude Code', lines: transcript.slice(2, 9), dot: colors.amber, at: 52},
    d: {title: 'Write API tests', provider: 'Claude Code', lines: transcript.slice(4, 13), dot: colors.green, at: 82},
  };
  const Pane: React.FC<{id: keyof typeof panes; w: number; h: number; borderLeft?: boolean; borderTop?: boolean}> = ({id, w, h, borderLeft, borderTop}) => {
    const p = panes[id];
    const lines = timeLines(fast(p.lines), p.at + 6);
    return (
      <div
        style={{
          width: w,
          height: h,
          overflow: 'hidden',
          flexShrink: 0,
          borderLeft: borderLeft ? `1px solid ${colors.border}` : undefined,
          borderTop: borderTop ? `1px solid ${colors.border}` : undefined,
          display: 'flex',
          flexDirection: 'column',
          opacity: c01(slam(frame, p.at, {damping: 16, stiffness: 220}) * 1.5),
        }}
      >
        <TerminalHeader title={p.title} provider={p.provider} status="Working…" dot={p.dot} slim />
        <div style={{padding: '10px 16px', flex: 1, overflow: 'hidden'}}>
          <Transcript frame={frame} lines={lines} fontSize={15} lineHeight={23} />
        </div>
      </div>
    );
  };
  return (
    <AbsoluteFill>
      <WindowFrame scale={1} opacity={1}>
        <Sidebar frame={SIDEBAR_SETTLED} width={SIDEBAR_W} />
        <div style={{width: MAIN_W, height: '100%', display: 'flex', overflow: 'hidden'}}>
          <div style={{width: leftW, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0}}>
            <Pane id="a" w={leftW} h={WIN.h - (WIN.h / 2) * leftBottom} />
            <Pane id="d" w={leftW} h={(WIN.h / 2) * leftBottom} borderTop />
          </div>
          <div style={{width: rightW, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0}}>
            <Pane id="b" w={MAIN_W / 2} h={WIN.h - (WIN.h / 2) * rightBottom} borderLeft />
            <Pane id="c" w={MAIN_W / 2} h={(WIN.h / 2) * rightBottom} borderLeft borderTop />
          </div>
        </div>
      </WindowFrame>
      <Abs x={0} y={56} w={1920}>
        <Kinetic text="panes. your layout, saved." frame={frame} start={0} size={100} from="down" dist={70} unitColors={[colors.cyan, colors.text, colors.text, colors.text]} />
      </Abs>
    </AbsoluteFill>
  );
};
