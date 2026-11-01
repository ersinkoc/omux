// The transcript that types out in the main terminal pane, with per-line
// typing speed (characters per frame). Start frames are derived so other
// components (subagent rows, the "5 agents" pill) can sync to them.
import {colors} from './theme';

export type Line = {
  text: string;
  color?: string;
  cps?: number;
  gap?: number; // frames to wait after this line finishes
  key?: string;
};

export const TYPING_START = 112;

export const transcript: Line[] = [
  {
    text: '> Add locale detection to the settings page and make the layout honour it.',
    color: colors.text,
    cps: 7,
    gap: 6,
  },
  {text: '', gap: 0},
  {
    text: "● I'll read the i18n setup first, then split the work across agents.",
    cps: 8,
    gap: 4,
  },
  {text: '', gap: 0},
  {text: '● Read src/i18n/index.ts (84 lines)', color: colors.secondary, cps: 18, gap: 2},
  {text: '● Read src/app/layout.tsx (32 lines)', color: colors.secondary, cps: 18, gap: 4},
  {text: '', gap: 0},
  {text: '● Created src/i18n/server.ts (+26 −0)', color: colors.green, cps: 10, gap: 1},
  {text: '  20 + export async function getRequestLocale(): Promise<Locale> {', color: colors.green, cps: 22},
  {text: '  21 +   const stored = (await cookies()).get(LOCALE_COOKIE)?.value', color: colors.green, cps: 22},
  {text: '  22 +   if (isLocale(stored)) return stored', color: colors.green, cps: 22},
  {text: '  23 +   return matchAcceptLanguage(await headers()) ?? defaultLocale', color: colors.green, cps: 22},
  {text: '  24 + }', color: colors.green, cps: 22, gap: 4},
  {text: '', gap: 0},
  {text: '● Launching the five agents now in parallel.', cps: 9, gap: 3},
  {text: '', gap: 0},
  {text: '● 5 background agents launched (↓ to manage)', cps: 9, gap: 1, key: 'agents'},
  {text: '  ⎿ Extract strings into en/tr', cps: 12, key: 'agent-0'},
  {text: '  ⎿ Build LocaleSwitcher component', cps: 12, key: 'agent-1'},
  {text: '  ⎿ Set html lang/dir in layout', cps: 12, key: 'agent-2'},
  {text: '  ⎿ Add RTL-safe CSS rules', cps: 12, key: 'agent-3'},
  {text: '  ⎿ Write LocaleSwitcher vitest tests', cps: 12, gap: 4, key: 'agent-4'},
  {text: '', gap: 0},
  {
    text: "● All five agents are running. I'll wait for their notifications before integrating.",
    cps: 7,
    gap: 4,
  },
  {text: '', gap: 0},
  {text: '✳ Waiting for 5 background agents to finish', color: colors.secondary, cps: 8, key: 'waiting'},
];

export type TimedLine = Line & {start: number; end: number};

export const timedTranscript: TimedLine[] = (() => {
  let t = TYPING_START;
  return transcript.map((line) => {
    const cps = line.cps ?? 6;
    const frames = line.text.length === 0 ? 1 : Math.ceil(line.text.length / cps);
    const start = t;
    const end = start + frames;
    t = end + (line.gap ?? 0);
    return {...line, start, end};
  });
})();

export const lineStart = (key: string): number => {
  const l = timedTranscript.find((x) => x.key === key);
  return l ? l.start : 0;
};

export const lineEnd = (key: string): number => {
  const l = timedTranscript.find((x) => x.key === key);
  return l ? l.end : 0;
};

export const TYPING_END = timedTranscript[timedTranscript.length - 1].end;

// Second transcript, shown in the side-by-side pane (Codex session).
export const codexTranscript: Line[] = [
  {text: '> Add a token bucket rate limiter to the API middleware.', cps: 8, gap: 4},
  {text: '', gap: 0},
  {text: '• Reading src/middleware/index.ts', color: colors.secondary, cps: 14, gap: 2},
  {text: '• Reading src/lib/redis.ts', color: colors.secondary, cps: 14, gap: 4},
  {text: '', gap: 0},
  {text: '• Added src/middleware/rateLimit.ts (+48 −0)', color: colors.green, cps: 12, gap: 1},
  {text: '  export const rateLimit = (opts: Options) =>', color: colors.green, cps: 22},
  {text: '    bucket(opts.key, opts.capacity, opts.refill)', color: colors.green, cps: 22, gap: 4},
  {text: '', gap: 0},
  {text: '• Running vitest src/middleware …', cps: 10},
];
