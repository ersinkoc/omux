import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {colors, fonts, T} from './theme';
import {clamp, fade, pop} from './anim';
import {Logo} from './Logo';

// Beat 1: logo ring draws in, "omux" slides in beside it, tagline fades under.
export const Intro: React.FC<{frame: number}> = ({frame}) => {
  const ring = interpolate(frame, [4, 46], [0, 1], {
    ...clamp,
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });
  const logoScale = pop(frame, 2, {damping: 16, stiffness: 90});
  const wordIn = pop(frame, 30, {damping: 18, stiffness: 110});
  const tagIn = fade(frame, 50, 70);
  const out = interpolate(frame, [T.windowStart, T.windowStart + 18], [1, 0], clamp);
  const outScale = 1 + (1 - out) * 0.06;

  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: out}}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${outScale})`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 36}}>
          <div style={{transform: `scale(${logoScale})`, opacity: Math.min(1, logoScale)}}>
            <Logo size={200} progress={ring} id="intro" />
          </div>
          <div style={{width: 390, overflow: 'hidden'}}>
            <div
              style={{
                fontFamily: fonts.ui,
                fontSize: 150,
                fontWeight: 700,
                letterSpacing: -6,
                color: colors.text,
                lineHeight: '160px',
                transform: `translateX(${(1 - wordIn) * -80}px)`,
                opacity: Math.min(1, wordIn),
              }}
            >
              omux
            </div>
          </div>
        </div>
        <div
          style={{
            marginTop: 30,
            fontFamily: fonts.ui,
            fontSize: 34,
            color: colors.secondary,
            opacity: tagIn,
            transform: `translateY(${(1 - tagIn) * 10}px)`,
            letterSpacing: -0.2,
          }}
        >
          the terminal for running fleets of coding agents
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Beat 6: logo + "omux" return, with the closing line under them.
export const Outro: React.FC<{frame: number}> = ({frame}) => {
  const start = T.outroStart + 14;
  const inP = pop(frame, start, {damping: 18, stiffness: 90});
  const lineIn = fade(frame, start + 20, start + 38);
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          opacity: Math.min(1, inP),
          transform: `scale(${0.94 + 0.06 * inP})`,
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', gap: 36}}>
          <Logo size={200} progress={1} id="outro" />
          <div
            style={{
              fontFamily: fonts.ui,
              fontSize: 150,
              fontWeight: 700,
              letterSpacing: -6,
              color: colors.text,
              lineHeight: '160px',
            }}
          >
            omux
          </div>
        </div>
        <div
          style={{
            marginTop: 30,
            fontFamily: fonts.ui,
            fontSize: 30,
            color: colors.secondary,
            opacity: lineIn,
            transform: `translateY(${(1 - lineIn) * 10}px)`,
            display: 'flex',
            gap: 18,
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
