import React from 'react';
import {AbsoluteFill, Easing, interpolate} from 'remotion';
import {colors} from '../theme';
import {Abs, Kinetic, c01, hypeFont, monoFont, slam} from '../hype/Kinetic';
import {Bell} from '../hype/UIScenes';

const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

export type ChaosWindow = {
  x: number;
  y: number;
  w: number;
  h: number;
  rot: number;
  title: string;
  lines: {t: string; c?: string}[];
  appearAt: number;
  frontAt: number;
  bell?: boolean;
};

const dim = '#8E9097';
const txt = '#C9CBD0';
const grn = '#7CC9A8';
const amb = '#E2B35A';
const red = '#E08383';

// Eight terminals, scattered. Shared with the gathering act so they can be pulled in.
export const chaosWindows: ChaosWindow[] = [
  {x: 60, y: 150, w: 620, h: 330, rot: -3, title: 'Settings i18n — claude', appearAt: 4, frontAt: 160, bell: true, lines: [
    {t: '> Add locale detection to the settings page.'},
    {t: '● Read src/i18n/index.ts (84 lines)', c: dim},
    {t: '● Created src/i18n/server.ts (+26 −0)', c: grn},
    {t: '⚠ Waiting for approval: Bash(npm test)', c: amb},
  ]},
  {x: 1180, y: 110, w: 560, h: 300, rot: 2, title: 'zsh — ~/code/api', appearAt: 20, frontAt: 196, lines: [
    {t: '$ npm test'},
    {t: 'PASS  src/auth.test.ts', c: grn},
    {t: 'FAIL  src/rate.test.ts', c: red},
    {t: '$ '},
  ]},
  {x: 430, y: 540, w: 600, h: 320, rot: 1.5, title: 'infra — claude', appearAt: 36, frontAt: 220, lines: [
    {t: '> Upgrade the Terraform providers.'},
    {t: '● Bash: terraform plan …', c: dim},
    {t: 'Plan: 4 to add, 1 to change, 0 to destroy.'},
    {t: '● Waiting for your approval', c: amb},
  ]},
  {x: 1330, y: 440, w: 640, h: 340, rot: -2, title: 'ios-app — codex', appearAt: 52, frontAt: 184, lines: [
    {t: '• Reading Onboarding.swift', c: dim},
    {t: '• Editing OnboardingView.swift', c: grn},
    {t: '• Running xcodebuild …'},
  ]},
  {x: -150, y: 650, w: 580, h: 310, rot: 3, title: 'Fix checkout bug — claude', appearAt: 68, frontAt: 232, lines: [
    {t: '● Read src/checkout.ts (212 lines)', c: dim},
    {t: '● Edited src/checkout.ts (+12 −3)', c: grn},
    {t: '✳ Waiting for 2 background agents', c: dim},
  ]},
  {x: 770, y: 270, w: 540, h: 290, rot: -1, title: 'zsh — ~/code/acme-web', appearAt: 84, frontAt: 172, lines: [
    {t: '$ git status'},
    {t: 'On branch feat/dark-mode', c: dim},
    {t: 'nothing to commit, working tree clean', c: dim},
    {t: '$ '},
  ]},
  {x: 1090, y: 770, w: 600, h: 300, rot: 2.5, title: 'Write API tests — claude', appearAt: 100, frontAt: 208, lines: [
    {t: '● Created tests/api.test.ts (+140 −0)', c: grn},
    {t: '● Bash: vitest run …', c: dim},
    {t: '✓ 34 passed', c: grn},
  ]},
  {x: 320, y: -30, w: 520, h: 280, rot: 1, title: 'Rate limiting — codex', appearAt: 116, frontAt: 244, lines: [
    {t: '• Added src/middleware/rateLimit.ts', c: grn},
    {t: '• Running vitest src/middleware …'},
  ]},
];

// One scattered terminal window, cold grey chrome.
export const ChaosTerminal: React.FC<{w: ChaosWindow; frame: number; style?: React.CSSProperties}> = ({w, frame, style}) => {
  const cursorOn = Math.floor(frame / 14) % 2 === 0;
  const last = w.lines[w.lines.length - 1];
  const bellOn = w.bell && Math.floor(frame / 10) % 2 === 0;
  return (
    <div
      style={{
        position: 'absolute',
        left: w.x,
        top: w.y,
        width: w.w,
        height: w.h,
        borderRadius: 12,
        background: '#1A1B1E',
        border: '1px solid #3A3B40',
        boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
        overflow: 'hidden',
        fontFamily: monoFont,
        ...style,
      }}
    >
      <div style={{height: 36, display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', background: '#2A2B2F', borderBottom: '1px solid #3A3B40'}}>
        <span style={{display: 'flex', gap: 7}}>
          {['#5A5B60', '#5A5B60', '#5A5B60'].map((c, i) => (
            <span key={i} style={{width: 12, height: 12, borderRadius: 12, background: c}} />
          ))}
        </span>
        <span style={{flex: 1, textAlign: 'center', fontFamily: hypeFont, fontSize: 15, color: dim, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{w.title}</span>
        {w.bell ? <span style={{opacity: bellOn ? 1 : 0.35}}><Bell size={16} color={amb} /></span> : <span style={{width: 16}} />}
      </div>
      <div style={{padding: '12px 16px', fontSize: 16, lineHeight: '26px', color: txt, whiteSpace: 'pre'}}>
        {w.lines.map((l, i) => (
          <div key={i} style={{color: l.c ?? txt}}>
            {l.t}
            {i === w.lines.length - 1 && last.t.endsWith('$ ') ? null : null}
          </div>
        ))}
        <span style={{display: 'inline-block', width: 10, height: 20, background: txt, opacity: cursorOn ? 0.9 : 0, verticalAlign: 'text-bottom'}} />
      </div>
    </div>
  );
};

const beats = [
  {text: 'eight terminals.', from: 22, to: 104, color: colors.text},
  {text: 'which one needs you?', from: 112, to: 194, color: colors.text},
  {text: 'productivity: 30%', from: 202, to: 270, color: '#F28B8B'},
];

// Act 1: terminals pile up, drift and fight for the front; headlines over them.
export const ChaosScene: React.FC<{frame: number}> = ({frame}) => {
  const badge = slam(frame, 150, {damping: 10, stiffness: 300});
  return (
    <AbsoluteFill style={{filter: 'saturate(0.6)'}}>
      <AbsoluteFill style={{background: 'rgba(150,155,165,0.07)'}} />
      {chaosWindows.map((w, i) => {
        const p = slam(frame, w.appearAt, {damping: 14, stiffness: 200});
        if (p <= 0) return null;
        const drift = Math.sin(frame * 0.025 + i * 1.7) * 7;
        const driftY = Math.cos(frame * 0.021 + i * 0.9) * 5;
        const z = frame >= w.frontAt ? 20 + Math.floor(w.frontAt / 5) : 5 + i;
        const bump = c01(slam(frame, w.frontAt, {damping: 12, stiffness: 240}));
        const lift = frame >= w.frontAt ? (1 - bump) * 0.04 : 0;
        return (
          <ChaosTerminal
            key={w.title}
            w={w}
            frame={frame}
            style={{
              zIndex: z,
              opacity: c01(p * 1.4),
              transform: `translate(${drift}px, ${driftY + (1 - p) * 80}px) rotate(${w.rot}deg) scale(${0.9 + 0.1 * p + lift})`,
              transformOrigin: 'center',
            }}
          />
        );
      })}

      {/* dock tile with a badge that keeps growing */}
      <Abs x={1700} y={880} style={{zIndex: 90, transform: `scale(${Math.max(0, badge)})`, transformOrigin: 'center'}}>
        <div style={{position: 'relative', width: 130, height: 130, borderRadius: 30, background: '#2A2B2F', border: '2px solid #3A3B40', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: monoFont, fontSize: 44, fontWeight: 700, color: '#B8BAC0'}}>
          {'>_'}
          <div style={{position: 'absolute', top: -16, right: -18, minWidth: 56, height: 56, padding: '0 10px', borderRadius: 28, background: '#FF3B30', border: '4px solid #0F0F0F', color: '#fff', fontFamily: hypeFont, fontWeight: 700, fontSize: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box'}}>
            {frame < 190 ? 9 : frame < 230 ? 11 : 12}
          </div>
        </div>
      </Abs>

      {beats.map((b) => {
        if (frame < b.from - 4 || frame > b.to) return null;
        const out = interpolate(frame, [b.to - 8, b.to], [1, 0], {...clamp, easing: Easing.in(Easing.quad)});
        const backdrop = c01(slam(frame, b.from, {damping: 16, stiffness: 160})) * out;
        return (
          <AbsoluteFill key={b.text} style={{zIndex: 100, justifyContent: 'center', alignItems: 'center', opacity: out}}>
            <AbsoluteFill style={{background: 'radial-gradient(ellipse 900px 420px at 50% 50%, rgba(8,8,10,0.92), rgba(8,8,10,0) 70%)', opacity: backdrop}} />
            <Abs x={0} y={420} w={1920}>
              <Kinetic text={b.text} frame={frame} start={b.from} size={150} from="up" color={b.color} damping={14} stiffness={300} />
            </Abs>
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};
