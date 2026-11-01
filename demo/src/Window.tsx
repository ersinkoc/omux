import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {colors, fonts, T} from './theme';
import {clamp, fade, pop, slide} from './anim';
import {Sidebar} from './Sidebar';
import {AgentsPill, TerminalHeader, Transcript, timeLines} from './Terminal';
import {RightPanel} from './RightPanel';
import {codexTranscript, lineStart, timedTranscript} from './script';

const WIN = {x: 80, y: 40, w: 1760, h: 920, r: 14};
const SIDEBAR_W = 320;
const PANEL_W = 600;

export const Window: React.FC<{frame: number}> = ({frame}) => {
  // Window frame itself: scale + fade in at the start, fade out at the end.
  const winIn = pop(frame, T.windowStart, {damping: 18, stiffness: 90, mass: 1});
  const winOut = interpolate(frame, [T.outroStart, T.outroStart + 22], [1, 0], clamp);
  const winScale = 0.96 + 0.04 * winIn - 0.02 * (1 - winOut);
  const winOpacity = Math.min(1, winIn) * winOut;

  const sidebarSlide = slide(frame, T.windowStart + 6);
  const termIn = fade(frame, T.windowStart + 30, T.windowStart + 48);

  // Right panel slides in at beat 4, out at beat 5.
  const panelIn = slide(frame, T.panelStart);
  const panelOut = slide(frame, T.splitStart);
  const panelOffset = (1 - panelIn) * PANEL_W + panelOut * PANEL_W; // px hidden to the right
  const panelVisibleW = Math.max(0, PANEL_W - panelOffset);

  // Side by side at beat 5.
  const split = slide(frame, T.splitStart + 6);
  const middleW = WIN.w - SIDEBAR_W - panelVisibleW;
  const pane2W = split * (middleW / 2);
  const pane1W = middleW - pane2W;

  const agentsPill = pop(frame, lineStart('agents') + 6, {damping: 12, stiffness: 180});
  const codexLines = timeLines(codexTranscript, T.splitStart + 22);

  const mainTranscript = (
    <div style={{padding: '14px 18px', flex: 1, overflow: 'hidden'}}>
      <Transcript frame={frame} lines={timedTranscript} />
    </div>
  );

  return (
    <AbsoluteFill style={{opacity: winOpacity}}>
      <div
        style={{
          position: 'absolute',
          left: WIN.x,
          top: WIN.y,
          width: WIN.w,
          height: WIN.h,
          borderRadius: WIN.r,
          background: colors.bg,
          border: `1px solid ${colors.border}`,
          boxShadow: '0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03)',
          overflow: 'hidden',
          display: 'flex',
          transform: `scale(${winScale})`,
          transformOrigin: 'center',
        }}
      >
        <div style={{transform: `translateX(${(1 - sidebarSlide) * -SIDEBAR_W}px)`, height: '100%', flexShrink: 0}}>
          <Sidebar frame={frame} width={SIDEBAR_W} />
        </div>

        {/* Middle: one terminal pane, splitting into two at beat 5 */}
        <div style={{width: middleW, height: '100%', display: 'flex', opacity: termIn, flexShrink: 0, overflow: 'hidden'}}>
          <div style={{width: pane1W, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0}}>
            <TerminalHeader
              title="Settings i18n"
              provider="Claude Code"
              status="Working…"
              dot={colors.blue}
              right={
                <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
                  <AgentsPill scale={agentsPill} />
                  <span style={{color: colors.dim, fontSize: 14, fontFamily: fonts.mono}}>~/code/acme-web</span>
                </div>
              }
            />
            {mainTranscript}
          </div>
          <div
            style={{
              width: pane2W,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              flexShrink: 0,
              borderLeft: `1px solid ${colors.border}`,
              opacity: Math.min(1, split * 1.5),
            }}
          >
            <div style={{width: middleW / 2, display: 'flex', flexDirection: 'column', height: '100%'}}>
              <TerminalHeader
                title="Rate limiting middleware"
                provider="Codex"
                status="Working…"
                dot={colors.blue}
                right={<span style={{color: colors.dim, fontSize: 14, fontFamily: fonts.mono}}>~/code/api</span>}
              />
              <div style={{padding: '14px 18px', flex: 1, overflow: 'hidden'}}>
                <Transcript frame={frame} lines={codexLines} />
              </div>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div style={{width: panelVisibleW, height: '100%', overflow: 'hidden', flexShrink: 0}}>
          <div style={{width: PANEL_W, height: '100%'}}>
            <RightPanel frame={frame} width={PANEL_W} />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
