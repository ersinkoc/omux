import React from 'react';
import {interpolate} from 'remotion';
import {colors, fonts, T} from './theme';
import {clamp, fade, pop} from './anim';
import {Dot} from './Terminal';
import {lineStart} from './script';

type Session = {
  name: string;
  status: string;
  dot: string;
  selected?: boolean;
  subagents?: {name: string; tool: string}[];
  approval?: boolean;
  unread?: boolean;
};
type Project = {name: string; sessions: Session[]};

// Beat 3 timing (approval on "Fix checkout bug").
export const A = {
  needsYou: T.approvalStart + 4, // dot turns orange
  buttons: T.approvalStart + 14, // Allow / Deny spring in
  pulseFrom: T.approvalStart + 26,
  press: T.approvalStart + 56, // Allow pressed
  resolved: T.approvalStart + 68, // dot blue again
};

const projects = (frame: number): Project[] => {
  const inApproval = frame >= A.needsYou && frame < A.resolved;
  const afterApproval = frame >= A.resolved;
  return [
    {
      name: 'acme-web',
      sessions: [
        {
          name: 'Settings i18n',
          status: 'Working…',
          dot: colors.blue,
          selected: true,
          subagents: [
            {name: 'Extract strings into en/tr', tool: 'Bash'},
            {name: 'Build LocaleSwitcher co…', tool: 'Bash'},
            {name: 'Set html lang/dir in layout', tool: 'Bash'},
          ],
        },
        {name: 'Dark mode toggle', status: 'Settings page dark mode toggle', dot: colors.green},
        {
          name: 'Fix checkout bug',
          status: inApproval
            ? 'Needs you · approve Bash: npm test'
            : afterApproval
              ? 'Working…'
              : 'Working…',
          dot: inApproval ? colors.amber : colors.blue,
          approval: inApproval,
          unread: inApproval,
        },
        {name: 'Write API tests', status: 'Claude Code', dot: colors.green},
      ],
    },
    {
      name: 'ios-app',
      sessions: [
        {name: 'Onboarding flow', status: 'Onboarding flow | ios-app', dot: colors.dim},
        {name: 'Shell', status: 'Stopped', dot: colors.dim},
      ],
    },
    {
      name: 'infra',
      sessions: [{name: 'Terraform upgrade', status: 'Stopped', dot: colors.dim}],
    },
    {
      name: 'api',
      sessions: [
        {name: 'Rate limiting middleware', status: 'Rate limiting middleware | api', dot: colors.blue},
        {name: 'Shell', status: 'Stopped', dot: colors.dim},
      ],
    },
  ];
};

const TrafficLights: React.FC = () => (
  <div style={{display: 'flex', gap: 8}}>
    {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
      <span key={c} style={{width: 13, height: 13, borderRadius: 13, background: c}} />
    ))}
  </div>
);

const IconGlyph: React.FC<{d: string}> = ({d}) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={colors.secondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const Button: React.FC<{
  label: string;
  bg: string;
  color: string;
  scale: number;
  glow?: number;
  press?: number;
}> = ({label, bg, color, scale, glow = 0, press = 0}) => (
  <div
    style={{
      padding: '4px 14px',
      borderRadius: 8,
      background: bg,
      color,
      fontSize: 15,
      fontWeight: 600,
      fontFamily: fonts.ui,
      transform: `scale(${scale * (1 - press * 0.14)})`,
      opacity: Math.min(1, scale),
      boxShadow: glow > 0 ? `0 0 0 ${3 + glow * 4}px ${colors.blue}${Math.round(glow * 90 + 20).toString(16).padStart(2, '0')}` : 'none',
      transformOrigin: 'center',
    }}
  >
    {label}
  </div>
);

export const Sidebar: React.FC<{frame: number; width: number}> = ({frame, width}) => {
  const data = projects(frame);
  // Sessions appear one by one after the sidebar has slid in.
  let order = 0;
  const base = T.windowStart + 18;
  const stagger = 5;

  const allowScale = pop(frame, A.buttons, {damping: 11, stiffness: 180});
  const denyScale = pop(frame, A.buttons + 3, {damping: 11, stiffness: 180});
  const pulse =
    frame >= A.pulseFrom && frame < A.press
      ? 0.5 + 0.5 * Math.sin(((frame - A.pulseFrom) / 12) * Math.PI * 2 - Math.PI / 2)
      : 0;
  // Press: quick down then up.
  const press = interpolate(frame, [A.press, A.press + 4, A.press + 10], [0, 1, 0], clamp);
  const buttonsOut = interpolate(frame, [A.resolved - 6, A.resolved], [1, 0], clamp);

  const subagentStart = lineStart('agent-0');

  return (
    <div
      style={{
        width,
        height: '100%',
        background: colors.chrome,
        borderRight: `1px solid ${colors.border}`,
        fontFamily: fonts.ui,
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}
    >
      <div style={{height: 46, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 14}}>
        <TrafficLights />
        <div style={{flex: 1}} />
        <IconGlyph d="M12 5v14M5 12h14" />
        <IconGlyph d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <IconGlyph d="M12 8v4l3 3M21 12a9 9 0 1 1-9-9" />
        <IconGlyph d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 12a7 7 0 0 1-.1 1.2l2 1.6-2 3.4-2.4-1a7 7 0 0 1-2 1.2L14 21h-4l-.5-2.6a7 7 0 0 1-2-1.2l-2.4 1-2-3.4 2-1.6A7 7 0 0 1 5 12a7 7 0 0 1 .1-1.2l-2-1.6 2-3.4 2.4 1a7 7 0 0 1 2-1.2L10 3h4l.5 2.6a7 7 0 0 1 2 1.2l2.4-1 2 3.4-2 1.6A7 7 0 0 1 19 12z" />
      </div>

      <div style={{padding: '4px 10px', flex: 1, overflow: 'hidden'}}>
        {data.map((p) => {
          const pIndex = order;
          const pStart = base + pIndex * stagger;
          const pIn = fade(frame, pStart, pStart + 8);
          order += 1;
          return (
            <div key={p.name} style={{marginBottom: 10}}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '6px 8px 4px',
                  fontSize: 13,
                  letterSpacing: 0.4,
                  color: colors.dim,
                  textTransform: 'lowercase',
                  opacity: pIn,
                }}
              >
                <span style={{flex: 1}}>{p.name}</span>
                <span style={{fontSize: 16, lineHeight: '12px'}}>+</span>
              </div>
              {p.sessions.map((s) => {
                const i = order;
                order += 1;
                const start = base + i * stagger;
                const prog = pop(frame, start, {damping: 16, stiffness: 150});
                const dotScale = pop(frame, start + 4, {damping: 9, stiffness: 220});
                return (
                  <div
                    key={s.name}
                    style={{
                      opacity: Math.min(1, prog),
                      transform: `translateX(${(1 - prog) * -20}px)`,
                      background: s.selected ? '#2B2B30' : 'transparent',
                      borderRadius: 10,
                      padding: '8px 10px',
                      marginBottom: 2,
                    }}
                  >
                    <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                      <Dot color={s.dot} size={11} style={{transform: `scale(${dotScale})`}} />
                      <span style={{fontSize: 17, color: colors.text, fontWeight: 500, flex: 1}}>{s.name}</span>
                      {s.unread ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill={colors.amber}>
                          <path d="M12 2a6 6 0 0 0-6 6v4l-2 3v1h16v-1l-2-3V8a6 6 0 0 0-6-6zm0 20a3 3 0 0 0 3-3H9a3 3 0 0 0 3 3z" />
                        </svg>
                      ) : null}
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        color: s.approval ? colors.amber : colors.secondary,
                        marginLeft: 21,
                        marginTop: 2,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {s.status}
                    </div>
                    {s.approval ? (
                      <div style={{display: 'flex', gap: 8, marginLeft: 21, marginTop: 8, opacity: buttonsOut}}>
                        <Button label="Allow" bg={colors.blue} color="#0B1220" scale={allowScale} glow={pulse} press={press} />
                        <Button label="Deny" bg="#3A3A40" color={colors.text} scale={denyScale} />
                      </div>
                    ) : null}
                    {s.subagents
                      ? s.subagents.map((a, k) => {
                          const aStart = subagentStart + k * 4;
                          if (frame < aStart) return null;
                          const ap = pop(frame, aStart, {damping: 13, stiffness: 170});
                          return (
                            <div
                              key={a.name}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                marginLeft: 21,
                                marginTop: k === 0 ? 8 : 3,
                                fontSize: 14,
                                opacity: Math.min(1, ap),
                                transform: `translateY(${(1 - ap) * 6}px) scale(${0.9 + 0.1 * ap})`,
                                transformOrigin: 'left center',
                              }}
                            >
                              <span style={{width: 8, height: 8, borderRadius: 8, border: `1.5px solid ${colors.blue}`}} />
                              <span style={{color: colors.text, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{a.name}</span>
                              <span style={{color: colors.dim}}>{a.tool}</span>
                            </div>
                          );
                        })
                      : null}
                    {s.subagents && frame >= subagentStart + 14 ? (
                      <div
                        style={{
                          marginLeft: 37,
                          marginTop: 3,
                          fontSize: 13,
                          color: colors.dim,
                          opacity: fade(frame, subagentStart + 14, subagentStart + 22),
                        }}
                      >
                        +2 more
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <div style={{padding: '10px 18px 14px', display: 'flex', gap: 22, fontSize: 13, color: colors.secondary, borderTop: `1px solid ${colors.border}`}}>
        {[['5h', '13%'], ['Week', '4%'], ['Fable', '6%']].map(([k, v]) => (
          <div key={k} style={{flex: 1}}>
            <div style={{display: 'flex', justifyContent: 'space-between'}}><span>{k}</span><span>{v}</span></div>
            <div style={{height: 3, background: '#2F2F34', borderRadius: 3, marginTop: 5}}>
              <div style={{height: 3, width: v, background: colors.secondary, borderRadius: 3}} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
