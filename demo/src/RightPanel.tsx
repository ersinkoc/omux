import React from 'react';
import {interpolate} from 'remotion';
import {colors, fonts, T} from './theme';
import {clamp, fade, pop} from './anim';

type DiffLine = {n?: number; kind: 'ctx' | 'add' | 'del' | 'hunk'; text: string};

const diff: DiffLine[] = [
  {kind: 'hunk', text: '@@ -1,5 +1,24 @@'},
  {n: 1, kind: 'ctx', text: "import '@/styles/globals.css'"},
  {n: 2, kind: 'add', text: "import type { Metadata } from 'next'"},
  {n: 3, kind: 'add', text: "import { getDirection, getMessages } from '@/i18n'"},
  {n: 4, kind: 'add', text: "import { getRequestLocale } from '@/i18n/server'"},
  {n: 5, kind: 'ctx', text: ''},
  {n: 3, kind: 'del', text: 'export default function RootLayout({ children }) {'},
  {n: 4, kind: 'del', text: '  return <html lang="en"><body>{children}</body></html>'},
  {n: 6, kind: 'add', text: '// Lets the browser paint in the matching scheme'},
  {n: 7, kind: 'add', text: "export const viewport = { colorScheme: 'light dark' }"},
  {n: 8, kind: 'add', text: ''},
  {n: 9, kind: 'add', text: 'export async function generateMetadata(): Promise<Metadata> {'},
  {n: 10, kind: 'add', text: '  const t = getMessages(await getRequestLocale())'},
  {n: 11, kind: 'add', text: '  return { title: { default: t.app.name } }'},
  {n: 12, kind: 'add', text: '}'},
  {n: 13, kind: 'add', text: ''},
  {n: 14, kind: 'add', text: 'export default async function RootLayout({ children }) {'},
  {n: 15, kind: 'add', text: "  const locale = cookies().get('locale')?.value ?? 'en'"},
  {n: 16, kind: 'add', text: '  return ('},
  {n: 17, kind: 'add', text: '    <html lang={locale} dir={getDirection(locale)}>'},
  {n: 18, kind: 'add', text: '      <body>{children}</body>'},
  {n: 19, kind: 'add', text: '    </html>'},
  {n: 20, kind: 'add', text: '  )'},
  {n: 21, kind: 'add', text: '}'},
];

const NOTE_LINE = 17; // index into diff (line 15)

export const P = {
  reveal: T.panelStart + 14,
  note: T.panelStart + 48,
  send: T.panelStart + 66,
};

const Tab: React.FC<{label: string; active?: boolean; badge?: string; icon: React.ReactNode}> = ({label, active, badge, icon}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 7,
      padding: '4px 12px',
      borderRadius: 8,
      background: active ? '#2E2E33' : 'transparent',
      color: active ? colors.text : colors.secondary,
      fontSize: 15,
      fontWeight: active ? 600 : 500,
    }}
  >
    {icon}
    {label}
    {badge ? (
      <span style={{background: '#3B3B41', color: colors.text, borderRadius: 6, padding: '0 6px', fontSize: 13}}>{badge}</span>
    ) : null}
  </div>
);

export const RightPanel: React.FC<{frame: number; width: number}> = ({frame, width}) => {
  const notePop = pop(frame, P.note, {damping: 12, stiffness: 160});
  const sendPop = pop(frame, P.send, {damping: 12, stiffness: 160});
  const lineH = 24;
  return (
    <div
      style={{
        width,
        height: '100%',
        background: colors.chrome,
        borderLeft: `1px solid ${colors.border}`,
        fontFamily: fonts.ui,
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      <div style={{height: 46, display: 'flex', alignItems: 'center', gap: 4, padding: '0 10px', borderBottom: `1px solid ${colors.border}`}}>
        <Tab
          label="Files"
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h6l2 2h8v14H4z" /></svg>}
        />
        <Tab
          label="Changes"
          badge="11"
          active
          icon={<span style={{fontWeight: 700}}>±</span>}
        />
        <Tab
          label="Browser"
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></svg>}
        />
      </div>
      <div style={{height: 40, display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px', fontSize: 15, borderBottom: `1px solid ${colors.border}`}}>
        <span style={{color: colors.text, fontWeight: 600}}>layout.tsx</span>
        <span style={{color: colors.dim}}>src/app</span>
        <div style={{flex: 1}} />
        <span style={{color: colors.green, fontFamily: fonts.mono, fontSize: 14}}>+29</span>
        <span style={{color: colors.red, fontFamily: fonts.mono, fontSize: 14}}>−2</span>
      </div>

      <div style={{flex: 1, background: colors.bg, fontFamily: fonts.mono, fontSize: 14.5, position: 'relative', padding: '6px 0', overflow: 'hidden'}}>
        {diff.map((l, i) => {
          const s = P.reveal + i * 2;
          const p = interpolate(frame, [s, s + 8], [0, 1], clamp);
          const bg = l.kind === 'add' ? colors.diffAdd : l.kind === 'del' ? colors.diffDel : l.kind === 'hunk' ? '#17171A' : 'transparent';
          const fg = l.kind === 'add' ? '#CDEFE0' : l.kind === 'del' ? '#F3C9C9' : l.kind === 'hunk' ? colors.dim : colors.text;
          const sign = l.kind === 'add' ? '+' : l.kind === 'del' ? '−' : ' ';
          const signColor = l.kind === 'add' ? colors.green : l.kind === 'del' ? colors.red : colors.dim;
          const noted = i === NOTE_LINE && frame >= P.note;
          const bubble =
            i === NOTE_LINE ? (
              <div key="note" style={{height: notePop * 46, overflow: 'visible', position: 'relative'}}>
                <div
                  style={{
                    position: 'absolute',
                    left: 70,
                    top: 5,
                    transform: `scale(${notePop})`,
                    transformOrigin: 'top left',
                    opacity: Math.min(1, notePop),
                    background: '#1F2A33',
                    border: `1px solid ${colors.cyan}88`,
                    borderRadius: 10,
                    padding: '6px 14px',
                    fontFamily: fonts.ui,
                    fontSize: 15,
                    color: colors.text,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    whiteSpace: 'nowrap',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.cyan} strokeWidth="2.2" strokeLinecap="round"><path d="M4 20l1-4 11-11 3 3-11 11z" /></svg>
                  use getRequestLocale here
                </div>
              </div>
            ) : null;
          return (
            <React.Fragment key={i}>
            <div
              style={{
                display: 'flex',
                height: lineH,
                lineHeight: `${lineH}px`,
                background: bg,
                color: fg,
                opacity: p,
                transform: `translateY(${(1 - p) * 8}px)`,
                whiteSpace: 'pre',
                boxShadow: noted ? `inset 3px 0 0 ${colors.cyan}` : 'none',
              }}
            >
              <span style={{width: 44, textAlign: 'right', paddingRight: 10, color: colors.dim, fontSize: 13}}>{l.n ?? ''}</span>
              <span style={{width: 18, color: signColor}}>{sign}</span>
              <span>{l.text}</span>
            </div>
            {bubble}
            </React.Fragment>
          );
        })}

      </div>

      <div style={{height: 56, display: 'flex', alignItems: 'center', padding: '0 16px', borderTop: `1px solid ${colors.border}`, gap: 12}}>
        <span style={{color: colors.dim, fontSize: 14, opacity: 1 - Math.min(1, sendPop)}}>Click a line to leave a note</span>
        <div style={{flex: 1}} />
        <div
          style={{
            transform: `scale(${sendPop})`,
            opacity: Math.min(1, sendPop),
            background: colors.cyan,
            color: '#06202A',
            fontWeight: 700,
            fontSize: 15,
            padding: '7px 16px',
            borderRadius: 9,
            whiteSpace: 'nowrap',
          }}
        >
          Send 1 note to Claude
        </div>
      </div>
    </div>
  );
};

export const panelFade = (frame: number) => fade(frame, 0, 1);
