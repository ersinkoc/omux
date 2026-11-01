import React from 'react';
import {AbsoluteFill, Easing, interpolate} from 'remotion';
import {colors, T} from '../theme';
import {Dot, TerminalHeader, Transcript, timeLines} from '../Terminal';
import {RightPanel} from '../RightPanel';
import {Logo} from '../Logo';
import {codexTranscript, transcript} from '../script';
import {Abs, Caption, Kinetic, c01, hypeFont, monoFont, slam} from './Kinetic';

const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

// A status dot that flips through colours with a pop on every change.
const FlipDot: React.FC<{frame: number; states: {at: number; color: string}[]; size: number}> = ({frame, states, size}) => {
  let cur = states[0];
  for (const s of states) if (frame >= s.at) cur = s;
  const isFirst = cur === states[0];
  const p = isFirst ? 1 : c01(slam(frame, cur.at, {damping: 10, stiffness: 280}));
  const scale = isFirst ? 1 : 1 + (1 - p) * 1.1;
  return (
    <Dot
      color={cur.color}
      size={size}
      style={{
        transform: `scale(${scale})`,
        boxShadow: `0 0 ${size * 0.8}px ${cur.color}66, 0 0 0 ${(1 - p) * size}px ${cur.color}33`,
      }}
    />
  );
};

const Bell: React.FC<{size: number; color: string}> = ({size, color}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 2a6 6 0 0 0-6 6v4l-2 3v1h16v-1l-2-3V8a6 6 0 0 0-6-6zm0 20a3 3 0 0 0 3-3H9a3 3 0 0 0 3 3z" />
  </svg>
);

// S3: sidebar rows cascade in, dots flip grey -> blue -> amber/green.
export const SidebarScene: React.FC<{frame: number}> = ({frame}) => {
  type Row = {name: string; flips: {at: number; color: string; status: string}[]; selected?: boolean};
  const rows: Row[] = [
    {name: 'Settings i18n', selected: true, flips: [{at: 8, color: colors.blue, status: 'Working… · 5 subagents'}]},
    {name: 'Dark mode toggle', flips: [{at: 11, color: colors.blue, status: 'Working…'}, {at: 36, color: colors.green, status: 'Done · 11 files changed'}]},
    {name: 'Fix checkout bug', flips: [{at: 14, color: colors.blue, status: 'Working…'}, {at: 30, color: colors.amber, status: 'Needs you · approve Bash: npm test'}]},
    {name: 'Write API tests', flips: [{at: 17, color: colors.blue, status: 'Working…'}]},
    {name: 'Onboarding flow', flips: [{at: 20, color: colors.blue, status: 'Working…'}, {at: 42, color: colors.green, status: 'Done'}]},
    {name: 'Terraform upgrade', flips: [{at: 23, color: colors.blue, status: 'Working…'}]},
    {name: 'Rate limiting middleware', flips: [{at: 26, color: colors.blue, status: 'Codex · Working…'}, {at: 46, color: colors.amber, status: 'Needs you · approval'}]},
    {name: 'Auth token refresh', flips: [{at: 29, color: colors.blue, status: 'Working…'}]},
  ];
  const cardIn = slam(frame, 0, {damping: 16, stiffness: 160});
  return (
    <AbsoluteFill>
      <Abs
        x={110}
        y={120}
        w={840}
        h={840}
        style={{
          background: colors.chrome,
          border: `2px solid ${colors.border}`,
          borderRadius: 24,
          padding: '22px 18px',
          boxSizing: 'border-box',
          transform: `translateX(${(1 - cardIn) * -120}px)`,
          opacity: c01(cardIn * 1.5),
          overflow: 'hidden',
          boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{fontFamily: hypeFont, fontSize: 22, color: colors.dim, letterSpacing: 0.6, padding: '4px 14px 10px'}}>acme-web</div>
        {rows.map((r, i) => {
          const at = i * 3;
          const p = slam(frame, at, {damping: 15, stiffness: 220});
          let status = 'Starting…';
          let color = colors.dim;
          for (const f of r.flips) if (frame >= f.at) ({status, color} = f);
          const needsYou = color === colors.amber;
          const states = [{at: -1, color: colors.dim}, ...r.flips.map((f) => ({at: f.at, color: f.color}))];
          return (
            <div
              key={r.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                padding: '14px 16px',
                borderRadius: 16,
                marginBottom: 4,
                background: r.selected ? '#2B2B30' : 'transparent',
                opacity: c01(p * 1.5),
                transform: `translateX(${(1 - p) * -70}px)`,
              }}
            >
              <FlipDot frame={frame} states={states} size={20} />
              <div style={{flex: 1, minWidth: 0}}>
                <div style={{fontFamily: hypeFont, fontSize: 32, fontWeight: 600, color: colors.text, lineHeight: 1.15}}>{r.name}</div>
                <div
                  style={{
                    fontFamily: hypeFont,
                    fontSize: 23,
                    color: needsYou ? colors.amber : color === colors.green ? colors.green : colors.secondary,
                    marginTop: 2,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {status}
                </div>
              </div>
              {needsYou ? (
                <span style={{transform: `scale(${c01(slam(frame, r.flips[r.flips.length - 1].at, {damping: 9, stiffness: 300}))})`}}>
                  <Bell size={28} color={colors.amber} />
                </span>
              ) : null}
            </div>
          );
        })}
      </Abs>
      <Abs x={1010} y={330} w={860}>
        <Kinetic text="see who" frame={frame} start={2} size={150} align="left" from="left" dist={140} />
      </Abs>
      <Abs x={1010} y={500} w={860}>
        <Kinetic text="needs you." frame={frame} start={5} size={150} align="left" from="left" dist={140} unitColors={[colors.text, colors.amber]} />
      </Abs>
    </AbsoluteFill>
  );
};

// S4: a Dock shelf, the omux tile raised, its red badge counting 1 -> 3.
export const DockScene: React.FC<{frame: number}> = ({frame}) => {
  const shelfP = slam(frame, 0, {damping: 16, stiffness: 180});
  const tileP = slam(frame, 4, {damping: 11, stiffness: 220});
  const counts = [{at: 10, n: 1}, {at: 20, n: 2}, {at: 30, n: 3}];
  let cur = counts[0];
  let prev: {at: number; n: number} | null = null;
  for (const c of counts) if (frame >= c.at) { prev = cur === c ? prev : cur; cur = c; }
  const badgeIn = slam(frame, counts[0].at, {damping: 10, stiffness: 300});
  const flip = c01(slam(frame, cur.at, {damping: 12, stiffness: 300}));
  const badgeScale = frame < counts[0].at ? 0 : 1 + (1 - flip) * 0.45;
  const BH = 112;
  const generic = (i: number) => (
    <div
      key={i}
      style={{
        width: 150,
        height: 150,
        borderRadius: 34,
        background: ['#2A2F3A', '#2F2A3A', '#2A3A33', '#3A2F2A'][i % 4],
        opacity: 0.8,
        transform: `translateY(${(1 - shelfP) * 60}px)`,
      }}
    />
  );
  return (
    <AbsoluteFill>
      <Abs x={0} y={120} w={1920}>
        <Kinetic text="the Dock counts" frame={frame} start={0} size={130} from="down" dist={80} />
      </Abs>
      <Abs x={0} y={270} w={1920}>
        <Kinetic text="who's waiting." frame={frame} start={4} size={130} from="down" dist={80} unitColors={[colors.text, colors.red]} />
      </Abs>
      <Abs
        x={310}
        y={700}
        w={1300}
        h={210}
        style={{
          background: 'rgba(255,255,255,0.07)',
          border: '2px solid rgba(255,255,255,0.12)',
          borderRadius: 40,
          opacity: c01(shelfP * 1.5),
          transform: `translateY(${(1 - shelfP) * 120}px)`,
        }}
      />
      <Abs x={310} y={700} w={1300} h={210} style={{display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 36, padding: '0 0 30px', boxSizing: 'border-box'}}>
        {[0, 1].map(generic)}
        <div style={{position: 'relative', transform: `translateY(${-60 - (1 - c01(tileP)) * 40}px) scale(${Math.max(0, tileP)})`, transformOrigin: 'center bottom'}}>
          <Logo size={300} progress={1} id="hype-dock" />
          <div
            style={{
              position: 'absolute',
              top: -14,
              right: -22,
              width: BH,
              height: BH,
              borderRadius: BH,
              background: '#FF3B30',
              border: '5px solid #0F0F0F',
              color: '#fff',
              fontFamily: hypeFont,
              fontWeight: 700,
              fontSize: 66,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              transform: `scale(${Math.max(0, badgeIn < 1 ? badgeIn : badgeScale)})`,
              boxShadow: '0 10px 30px rgba(255,59,48,0.45)',
            }}
          >
            <div style={{position: 'relative', width: BH, height: BH}}>
              <span style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `translateY(${(1 - flip) * BH}px)`}}>{cur.n}</span>
              {prev ? (
                <span style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `translateY(${-flip * BH}px)`}}>{prev.n}</span>
              ) : null}
            </div>
          </div>
        </div>
        {[2, 3].map(generic)}
      </Abs>
    </AbsoluteFill>
  );
};

// S5: Allow / Deny spring in on a big session row and Allow gets pressed.
export const AllowDenyScene: React.FC<{frame: number}> = ({frame}) => {
  const BTN = 14;
  const PRESS = 38;
  const RESOLVED = 46;
  const cardIn = slam(frame, 0, {damping: 15, stiffness: 180});
  const allow = slam(frame, BTN, {damping: 10, stiffness: 240});
  const deny = slam(frame, BTN + 3, {damping: 10, stiffness: 240});
  const pulse = frame >= BTN + 10 && frame < PRESS ? 0.5 + 0.5 * Math.sin(((frame - BTN - 10) / 10) * Math.PI * 2 - Math.PI / 2) : 0;
  const press = interpolate(frame, [PRESS, PRESS + 3, PRESS + 9], [0, 1, 0], clamp);
  const ripple = interpolate(frame, [PRESS + 2, PRESS + 16], [0, 1], {...clamp, easing: Easing.out(Easing.quad)});
  const resolved = frame >= RESOLVED;
  const buttonsOut = interpolate(frame, [RESOLVED, RESOLVED + 6], [1, 0], clamp);
  const okIn = slam(frame, RESOLVED + 2, {damping: 11, stiffness: 260});
  const Btn: React.FC<{label: string; bg: string; fg: string; s: number; glow?: number; pressed?: number}> = ({label, bg, fg, s, glow = 0, pressed = 0}) => (
    <div
      style={{
        position: 'relative',
        padding: '16px 44px',
        borderRadius: 18,
        background: bg,
        color: fg,
        fontFamily: hypeFont,
        fontWeight: 700,
        fontSize: 34,
        transform: `scale(${Math.max(0, s) * (1 - pressed * 0.12)})`,
        opacity: c01(s * 1.5) * buttonsOut,
        boxShadow: glow > 0 ? `0 0 0 ${4 + glow * 8}px ${colors.blue}${Math.round(glow * 80 + 20).toString(16).padStart(2, '0')}` : 'none',
      }}
    >
      {label}
    </div>
  );
  return (
    <AbsoluteFill>
      <Abs x={0} y={110} w={1920}>
        <Kinetic text="answer without" frame={frame} start={0} size={140} from="up" />
      </Abs>
      <Abs x={0} y={270} w={1920}>
        <Kinetic text="switching." frame={frame} start={4} size={140} from="up" unitColors={[colors.cyan]} />
      </Abs>
      <Abs
        x={330}
        y={560}
        w={1260}
        style={{
          background: colors.chrome,
          border: `2px solid ${colors.border}`,
          borderRadius: 28,
          padding: '34px 44px 38px',
          boxSizing: 'border-box',
          transform: `translateY(${(1 - cardIn) * 160}px)`,
          opacity: c01(cardIn * 1.5),
          boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
          <FlipDot frame={frame} states={[{at: -1, color: colors.amber}, {at: RESOLVED, color: colors.blue}]} size={24} />
          <span style={{fontFamily: hypeFont, fontSize: 42, fontWeight: 600, color: colors.text, flex: 1}}>Fix checkout bug</span>
          {!resolved ? <Bell size={36} color={colors.amber} /> : null}
        </div>
        <div style={{fontFamily: hypeFont, fontSize: 30, color: resolved ? colors.secondary : colors.amber, marginLeft: 46, marginTop: 8}}>
          {resolved ? 'Working… · npm test' : 'Needs you · approve Bash: npm test'}
        </div>
        <div style={{display: 'flex', gap: 18, marginLeft: 46, marginTop: 26, height: 72, alignItems: 'center', position: 'relative'}}>
          <div style={{position: 'relative'}}>
            <Btn label="Allow" bg={colors.blue} fg="#0B1220" s={allow} glow={pulse} pressed={press} />
            {ripple > 0 && ripple < 1 ? (
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: 60,
                  height: 60,
                  marginLeft: -30,
                  marginTop: -30,
                  borderRadius: 999,
                  border: `4px solid ${colors.blue}`,
                  transform: `scale(${1 + ripple * 7})`,
                  opacity: 1 - ripple,
                  pointerEvents: 'none',
                }}
              />
            ) : null}
          </div>
          <Btn label="Deny" bg="#3A3A40" fg={colors.text} s={deny} />
          <div
            style={{
              position: 'absolute',
              left: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              fontFamily: hypeFont,
              fontSize: 30,
              fontWeight: 600,
              color: colors.green,
              transform: `scale(${Math.max(0, okIn)})`,
              transformOrigin: 'left center',
              opacity: c01(okIn * 1.5),
            }}
          >
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={colors.green} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12l5 5L20 7" />
            </svg>
            allowed. the agent keeps going.
          </div>
        </div>
      </Abs>
    </AbsoluteFill>
  );
};

// S7: three worktree branches fan out from main.
export const BranchesScene: React.FC<{frame: number}> = ({frame}) => {
  const OX = 120;
  const OY = 440;
  const trunk = interpolate(frame, [0, 12], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const node = slam(frame, 10, {damping: 10, stiffness: 300});
  const branches = [
    {label: 'feat/settings-i18n', sub: 'Settings i18n · Claude Code', c: colors.violet, y: 80, at: 12},
    {label: 'fix/checkout-bug', sub: 'Fix checkout bug · Claude Code', c: colors.cyan, y: 270, at: 17},
    {label: 'feat/rate-limit', sub: 'Rate limiting middleware · Codex', c: colors.green, y: 460, at: 22},
  ];
  const X0 = 400;
  const X1 = 1080;
  return (
    <AbsoluteFill>
      <Abs x={0} y={100} w={1920}>
        <Kinetic text="every session" frame={frame} start={0} size={130} from="up" />
      </Abs>
      <Abs x={0} y={250} w={1920}>
        <Kinetic text="on its own branch." frame={frame} start={3} size={130} from="up" unitColors={[colors.text, colors.text, colors.text, colors.violet]} />
      </Abs>
      <svg width="1680" height="560" style={{position: 'absolute', left: OX, top: OY}}>
        <line x1={0} y1={270} x2={X0 * trunk} y2={270} stroke="#4A4A52" strokeWidth="10" strokeLinecap="round" />
        <text x={14} y={240} fontFamily={monoFont} fontSize="30" fontWeight="600" fill={colors.secondary} opacity={trunk}>
          main
        </text>
        {branches.map((b) => {
          const d = interpolate(frame, [b.at, b.at + 18], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
          const path = `M ${X0} 270 C ${X0 + 260} 270, ${X1 - 260} ${b.y}, ${X1} ${b.y}`;
          return (
            <g key={b.label}>
              <path d={path} fill="none" stroke={b.c} strokeWidth="10" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - d} opacity={0.95} />
              <circle cx={X1} cy={b.y} r={16 * c01(slam(frame, b.at + 14, {damping: 10, stiffness: 300}))} fill={b.c} />
            </g>
          );
        })}
        <circle cx={X0} cy={270} r={20 * c01(node)} fill="#0F0F0F" stroke="#9C9CA3" strokeWidth="8" />
      </svg>
      {branches.map((b) => {
        const p = slam(frame, b.at + 16, {damping: 12, stiffness: 240});
        return (
          <Abs key={b.label} x={OX + X1 + 44} y={OY + b.y - 44} style={{display: 'flex', alignItems: 'center', gap: 22, transform: `translateX(${(1 - p) * -40}px)`, opacity: c01(p * 1.5)}}>
            <span
              style={{
                fontFamily: monoFont,
                fontSize: 34,
                fontWeight: 700,
                color: b.c,
                background: `${b.c}1A`,
                border: `2px solid ${b.c}55`,
                borderRadius: 14,
                padding: '14px 24px',
                whiteSpace: 'nowrap',
              }}
            >
              {b.label}
            </span>
          </Abs>
        );
      })}
      {branches.map((b) => {
        const p = slam(frame, b.at + 22, {damping: 14, stiffness: 220});
        return (
          <Abs key={b.sub} x={OX + X1 + 46} y={OY + b.y + 40} style={{fontFamily: hypeFont, fontSize: 24, color: colors.secondary, opacity: c01(p * 1.5), transform: `translateY(${(1 - p) * 10}px)`, whiteSpace: 'nowrap'}}>
            {b.sub}
          </Abs>
        );
      })}
    </AbsoluteFill>
  );
};

// S8: the real RightPanel, zoomed, streaming its diff.
export const DiffScene: React.FC<{frame: number}> = ({frame}) => {
  const panelIn = slam(frame, 0, {damping: 16, stiffness: 170});
  return (
    <AbsoluteFill>
      <Abs x={120} y={300} w={860}>
        <Kinetic text="read the diff." frame={frame} start={0} size={130} align="left" from="left" dist={120} />
      </Abs>
      <Abs x={120} y={450} w={860}>
        <Kinetic text="leave notes." frame={frame} start={4} size={130} align="left" from="left" dist={120} unitColors={[colors.text, colors.cyan]} />
      </Abs>
      <Abs x={120} y={640} w={840}>
        <Caption text="send them to the agent as one message." frame={frame} start={30} size={34} align="left" />
      </Abs>
      <div
        style={{
          position: 'absolute',
          left: 1000,
          top: 90,
          width: 600,
          height: 620,
          transform: `translateX(${(1 - panelIn) * 500}px) scale(1.45)`,
          transformOrigin: 'top left',
          borderRadius: 14,
          overflow: 'hidden',
          border: `1px solid ${colors.border}`,
          boxShadow: '0 30px 80px rgba(0,0,0,0.55)',
          opacity: c01(panelIn * 1.5),
        }}
      >
        <RightPanel frame={frame + T.panelStart + 10} width={600} />
      </div>
    </AbsoluteFill>
  );
};

// S10: two sessions slam in from either side and snap side by side.
export const SideBySideScene: React.FC<{frame: number}> = ({frame}) => {
  const leftP = slam(frame, 8, {damping: 17, stiffness: 190, mass: 0.9});
  const rightP = slam(frame, 10, {damping: 17, stiffness: 190, mass: 0.9});
  const W = 860;
  const H = 580;
  const Y = 330;
  const fast = (ls: typeof transcript) => ls.map((l) => ({...l, cps: (l.cps ?? 6) * 3, gap: Math.min(2, l.gap ?? 0)}));
  const leftLines = timeLines(fast(transcript.slice(0, 15)), 14);
  const rightLines = timeLines(fast(codexTranscript), 16);
  const pane = (x: number, p: number, dir: number, title: string, provider: string, lines: ReturnType<typeof timeLines>, dot: string) => (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: Y,
        width: W,
        height: H,
        transform: `translateX(${(1 - p) * dir * 1100}px)`,
        background: colors.bg,
        border: `2px solid ${colors.border}`,
        borderRadius: 18,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 30px 80px rgba(0,0,0,0.55)',
      }}
    >
      <div style={{transform: 'scale(1.25)', transformOrigin: 'top left', width: W / 1.25, height: H / 1.25, display: 'flex', flexDirection: 'column'}}>
        <TerminalHeader title={title} provider={provider} status="Working…" dot={dot} />
        <div style={{padding: '14px 18px', flex: 1, overflow: 'hidden'}}>
          <Transcript frame={frame} lines={lines} fontSize={16} lineHeight={24} />
        </div>
      </div>
    </div>
  );
  return (
    <AbsoluteFill>
      <Abs x={0} y={120} w={1920}>
        <Kinetic text="side by side." frame={frame} start={0} size={140} from="down" dist={80} />
      </Abs>
      {pane(90, leftP, -1, 'Settings i18n', 'Claude Code', leftLines, colors.blue)}
      {pane(970, rightP, 1, 'Rate limiting middleware', 'Codex', rightLines, colors.blue)}
    </AbsoluteFill>
  );
};
