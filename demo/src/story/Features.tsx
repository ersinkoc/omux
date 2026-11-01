import React from 'react';
import {AbsoluteFill, Easing, interpolate} from 'remotion';
import {colors, T} from '../theme';
import {Sidebar} from '../Sidebar';
import {AgentsPill, Dot, TerminalHeader, Transcript, timeLines} from '../Terminal';
import {RightPanel} from '../RightPanel';
import {Logo} from '../Logo';
import {lineStart} from '../script';
import {Abs, Caption, Kinetic, c01, hypeFont, monoFont, slam} from '../hype/Kinetic';
import {FlipDot} from '../hype/UIScenes';

const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

// The real Sidebar, cropped and zoomed so its rows read at 1080p.
const ZoomSidebar: React.FC<{frame: number; scale?: number; h?: number}> = ({frame, scale = 2.05, h = 400}) => (
  <div
    style={{
      position: 'absolute',
      left: 90,
      top: 80,
      width: 320,
      height: h,
      transform: `scale(${scale})`,
      transformOrigin: 'top left',
      overflow: 'hidden',
      borderRadius: 10,
      border: `1px solid ${colors.border}`,
      boxShadow: '0 30px 80px rgba(0,0,0,0.55)',
    }}
  >
    {/* taller than the crop so the pinned usage footer stays out of view */}
    <div style={{height: 640}}>
      <Sidebar frame={frame} width={320} />
    </div>
  </div>
);

const Chip: React.FC<{frame: number; at: number; color: string; children: React.ReactNode; mono?: boolean}> = ({frame, at, color, children, mono}) => {
  const p = slam(frame, at, {damping: 12, stiffness: 240});
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 14,
        fontFamily: mono ? monoFont : hypeFont,
        fontSize: 34,
        fontWeight: 700,
        color,
        background: `${color}1A`,
        border: `2px solid ${color}55`,
        borderRadius: 16,
        padding: '14px 26px',
        whiteSpace: 'nowrap',
        transform: `scale(${Math.max(0, p)})`,
        opacity: c01(p * 1.5),
        transformOrigin: 'left center',
      }}
    >
      {children}
    </div>
  );
};

const Check: React.FC<{color: string; size?: number}> = ({color, size = 30}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12l5 5L20 7" />
  </svg>
);

// Beat 1: a session needs you; Allow from the sidebar; the Dock badge counts.
export const NeedsYouBeat: React.FC<{frame: number}> = ({frame}) => {
  const sidebarFrame = frame + T.approvalStart + 2; // needs-you at local 2, Allow pressed at 54, resolved at 66
  const waiting = frame >= 2 && frame < 66;
  const badgeIn = slam(frame, 2, {damping: 10, stiffness: 300});
  const badgeOut = interpolate(frame, [66, 72], [1, 0], {...clamp, easing: Easing.in(Easing.quad)});
  const badge = waiting ? c01(badgeIn) : frame >= 66 ? badgeOut : 0;
  return (
    <AbsoluteFill>
      <ZoomSidebar frame={sidebarFrame} />
      <Abs x={900} y={150} w={960}>
        <Kinetic text="see who" frame={frame} start={0} size={130} align="left" from="left" dist={120} />
      </Abs>
      <Abs x={900} y={300} w={960}>
        <Kinetic text="needs you." frame={frame} start={3} size={130} align="left" from="left" dist={120} unitColors={[colors.text, colors.amber]} />
      </Abs>
      <Abs x={900} y={500} w={960}>
        <Caption text="Allow or Deny from the sidebar. The Dock badge counts the ones waiting." frame={frame} start={14} size={30} align="left" />
      </Abs>
      <Abs x={920} y={600} style={{position: 'relative'}}>
        <div style={{position: 'relative', width: 230, height: 230}}>
          <Logo size={230} progress={1} id="story-dock" />
          <div
            style={{
              position: 'absolute',
              top: -12,
              right: -16,
              width: 92,
              height: 92,
              borderRadius: 92,
              background: '#FF3B30',
              border: '5px solid #0F0F0F',
              color: '#fff',
              fontFamily: hypeFont,
              fontWeight: 700,
              fontSize: 52,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: `scale(${badge})`,
              boxShadow: '0 10px 30px rgba(255,59,48,0.45)',
            }}
          >
            1
          </div>
        </div>
      </Abs>
    </AbsoluteFill>
  );
};

// Beat 2: subagents under a session, with their tools, one finishing.
export const AgentsBeat: React.FC<{frame: number}> = ({frame}) => {
  const sidebarFrame = frame + lineStart('agent-0') - 6; // subagent rows appear at local 6, 10, 14
  const pill = slam(frame, 10, {damping: 11, stiffness: 240});
  const rows = [
    {name: 'Extract strings into en/tr', tool: 'Bash', at: 16, doneAt: 46},
    {name: 'Build LocaleSwitcher component', tool: 'Edit', at: 20},
    {name: 'Set html lang/dir in layout', tool: 'Read', at: 24},
  ];
  return (
    <AbsoluteFill>
      <ZoomSidebar frame={sidebarFrame} />
      <Abs x={900} y={120} w={960}>
        <Kinetic text="agents," frame={frame} start={0} size={130} align="left" from="up" />
      </Abs>
      <Abs x={900} y={270} w={960}>
        <Kinetic text="tracked." frame={frame} start={3} size={130} align="left" from="up" unitColors={[colors.blue]} />
      </Abs>
      <Abs x={900} y={470} style={{transform: 'scale(2)', transformOrigin: 'left center'}}>
        <AgentsPill scale={Math.max(0, pill)} />
      </Abs>
      <Abs x={900} y={560} w={960}>
        {rows.map((r) => {
          const p = slam(frame, r.at, {damping: 14, stiffness: 220});
          const done = r.doneAt !== undefined && frame >= r.doneAt;
          return (
            <div
              key={r.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                marginBottom: 14,
                fontFamily: hypeFont,
                fontSize: 30,
                color: colors.text,
                opacity: c01(p * 1.5),
                transform: `translateX(${(1 - p) * 40}px)`,
              }}
            >
              <FlipDot frame={frame} states={[{at: -1, color: colors.blue}, ...(r.doneAt !== undefined ? [{at: r.doneAt, color: colors.green}] : [])]} size={18} />
              <span style={{flex: 1, whiteSpace: 'nowrap'}}>{r.name}</span>
              <span style={{fontFamily: monoFont, fontSize: 24, color: done ? colors.green : colors.secondary, background: colors.chromeRaised, border: `1px solid ${colors.border}`, borderRadius: 10, padding: '4px 14px'}}>
                {done ? 'done' : r.tool}
              </span>
            </div>
          );
        })}
      </Abs>
    </AbsoluteFill>
  );
};

// Beat 3: worktree branch, PR status and the Changes panel with a note.
export const GitBeat: React.FC<{frame: number}> = ({frame}) => {
  const MERGE = 52;
  const merged = frame >= MERGE;
  const flip = c01(slam(frame, MERGE, {damping: 11, stiffness: 260}));
  const pulse = !merged && frame > 20 ? 0.5 + 0.5 * Math.sin((frame / 12) * Math.PI * 2) : 0;
  const panelIn = slam(frame, 0, {damping: 16, stiffness: 170});
  return (
    <AbsoluteFill>
      <Abs x={100} y={80} w={880}>
        <Kinetic text="git, built in." frame={frame} start={0} size={120} align="left" from="left" dist={120} unitColors={[colors.violet, colors.text, colors.text]} />
      </Abs>
      <Abs x={100} y={280}>
        <Chip frame={frame} at={8} color={colors.violet} mono>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={colors.violet} strokeWidth="2.5" strokeLinecap="round"><circle cx="6" cy="5" r="2.5" /><circle cx="6" cy="19" r="2.5" /><circle cx="18" cy="9" r="2.5" /><path d="M6 7.5v9M18 11.5c0 3-3 4-6 4.5-2 .3-4 1-6 3" /></svg>
          feat/settings-i18n
        </Chip>
      </Abs>
      <Abs x={100} y={380}>
        <div style={{transform: `scale(${1 + (1 - flip) * 0.08})`, transformOrigin: 'left center'}}>
          <Chip frame={frame} at={14} color={merged ? colors.violet : colors.amber}>
            {merged ? <Check color={colors.violet} /> : <Dot color={colors.amber} size={18} style={{boxShadow: `0 0 0 ${pulse * 8}px ${colors.amber}33`}} />}
            {merged ? '#42 · merged' : '#42 · checks passing'}
          </Chip>
        </div>
      </Abs>
      <Abs x={100} y={500} w={860}>
        <Caption text="A worktree session gets its own branch and folder. The pull request lives next to it." frame={frame} start={22} size={30} align="left" />
      </Abs>
      <Abs x={100} y={640} w={860}>
        <Caption text="Read the diff, leave notes, send them as one message." frame={frame} start={60} size={30} align="left" />
      </Abs>
      <div
        style={{
          position: 'absolute',
          left: 1000,
          top: 70,
          width: 600,
          height: 600,
          transform: `translateX(${(1 - c01(panelIn)) * 500}px) scale(1.4)`,
          transformOrigin: 'top left',
          borderRadius: 14,
          overflow: 'hidden',
          border: `1px solid ${colors.border}`,
          boxShadow: '0 30px 80px rgba(0,0,0,0.55)',
          opacity: c01(panelIn * 1.5),
        }}
      >
        <RightPanel frame={frame + T.panelStart + 12} width={600} />
      </div>
    </AbsoluteFill>
  );
};

// Beat 4: the plan limits at the bottom of the sidebar, bars filling.
export const UsageBeat: React.FC<{frame: number}> = ({frame}) => {
  const rows = [
    {k: '5h', v: 13, at: 8},
    {k: 'Week', v: 24, at: 14},
    {k: 'Fable', v: 36, at: 20},
  ];
  const cardIn = slam(frame, 0, {damping: 15, stiffness: 180});
  return (
    <AbsoluteFill>
      <Abs x={120} y={290} w={760} style={{background: colors.chrome, border: `2px solid ${colors.border}`, borderRadius: 24, padding: '34px 40px', boxSizing: 'border-box', transform: `translateX(${(1 - c01(cardIn)) * -120}px)`, opacity: c01(cardIn * 1.5), boxShadow: '0 30px 80px rgba(0,0,0,0.5)'}}>
        <div style={{fontFamily: hypeFont, fontSize: 24, color: colors.dim, marginBottom: 22, letterSpacing: 0.4}}>plan limits · Claude Code</div>
        {rows.map((r) => {
          const p = c01(slam(frame, r.at, {damping: 17, stiffness: 110}));
          const n = Math.round(p * r.v);
          return (
            <div key={r.k} style={{marginBottom: 26, fontFamily: hypeFont}}>
              <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 30, color: colors.text, marginBottom: 10}}>
                <span>{r.k}</span>
                <span style={{fontVariantNumeric: 'tabular-nums', color: colors.secondary}}>{n}%</span>
              </div>
              <div style={{height: 14, background: '#2F2F34', borderRadius: 7}}>
                <div style={{height: 14, width: `${n}%`, background: colors.cyan, borderRadius: 7, boxShadow: `0 0 14px ${colors.cyan}66`}} />
              </div>
            </div>
          );
        })}
      </Abs>
      <Abs x={1000} y={330} w={880}>
        <Kinetic text="usage," frame={frame} start={0} size={130} align="left" from="up" />
      </Abs>
      <Abs x={1000} y={480} w={880}>
        <Kinetic text="in sight." frame={frame} start={3} size={130} align="left" from="up" unitColors={[colors.text, colors.cyan]} />
      </Abs>
      <Abs x={1000} y={660} w={860}>
        <Caption text="the selected provider's limits, at the bottom of the sidebar." frame={frame} start={16} size={30} align="left" />
      </Abs>
    </AbsoluteFill>
  );
};

// Beat 5: the omux command, typed in a shell, a session started and waited on.
export const CommandBeat: React.FC<{frame: number}> = ({frame}) => {
  const DONE = 62;
  const lines = timeLines(
    [
      {text: '$ omux new --name Tests --provider claude', cps: 2.4, gap: 3},
      {text: '✓ started session "Tests" · claude · acme-web', color: colors.green, cps: 14, gap: 5},
      {text: '', gap: 0},
      {text: '$ omux wait Tests', cps: 2.4, gap: 3},
      {text: '… Tests is working', color: colors.secondary, cps: 14},
    ],
    4,
  );
  const cardIn = slam(frame, 0, {damping: 15, stiffness: 180});
  const doneP = slam(frame, DONE, {damping: 12, stiffness: 240});
  return (
    <AbsoluteFill>
      <Abs x={0} y={70} w={1920}>
        <Kinetic text="the omux command." frame={frame} start={0} size={110} from="down" dist={70} unitColors={[colors.text, colors.green, colors.text]} />
      </Abs>
      <div style={{position: 'absolute', left: 210, top: 260, width: 1500, height: 600, borderRadius: 18, overflow: 'hidden', border: `2px solid ${colors.border}`, background: colors.bg, boxShadow: '0 30px 80px rgba(0,0,0,0.55)', transform: `translateY(${(1 - c01(cardIn)) * 120}px)`, opacity: c01(cardIn * 1.5), display: 'flex', flexDirection: 'column'}}>
        <div style={{transform: 'scale(1.35)', transformOrigin: 'top left', width: 1500 / 1.35}}>
          <TerminalHeader title="Shell" provider="zsh" status="~/code/acme-web" dot={colors.dim} />
        </div>
        <div style={{padding: '22px 30px', flex: 1}}>
          <Transcript frame={frame} lines={lines} fontSize={26} lineHeight={40} />
          {frame >= DONE ? (
            <div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 8, fontFamily: monoFont, fontSize: 26, color: colors.green, opacity: c01(doneP * 1.5), transform: `translateX(${(1 - c01(doneP)) * 30}px)`}}>
              <FlipDot frame={frame} states={[{at: -1, color: colors.blue}, {at: DONE, color: colors.green}]} size={18} />
              Tests · done · 3 files changed
            </div>
          ) : null}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Beat 6: the bar hits 100 %.
export const HundredBeat: React.FC<{frame: number}> = ({frame}) => {
  const glow = interpolate(frame, [26, 44], [0, 1], {...clamp, easing: Easing.out(Easing.quad)});
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: `radial-gradient(ellipse 1100px 520px at 50% 50%, ${colors.green}2E, transparent 70%)`, opacity: glow}} />
      <Abs x={0} y={400} w={1920}>
        <Kinetic text="productivity: 100%." frame={frame} start={-2} size={150} from="scale" color={colors.green} damping={12} stiffness={280} />
      </Abs>
      <Abs x={0} y={620} w={1920}>
        <Caption text="many agents, one window, nothing lost." frame={frame} start={22} size={36} />
      </Abs>
    </AbsoluteFill>
  );
};
