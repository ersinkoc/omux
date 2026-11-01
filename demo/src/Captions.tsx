import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {colors, fonts, T} from './theme';
import {clamp, pop} from './anim';

const captions: {text: string; from: number; to: number}[] = [
  {text: 'Answer without switching.', from: T.approvalStart + 6, to: T.panelStart},
  {text: 'Review the diff, leave notes.', from: T.panelStart + 6, to: T.splitStart},
  {text: 'Sessions side by side.', from: T.splitStart + 6, to: T.outroStart},
];

export const Captions: React.FC<{frame: number}> = ({frame}) => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    {captions.map((c) => {
      if (frame < c.from - 5 || frame > c.to + 5) return null;
      const inP = pop(frame, c.from, {damping: 16, stiffness: 120});
      const out = interpolate(frame, [c.to - 10, c.to], [1, 0], clamp);
      return (
        <div
          key={c.text}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 982,
            textAlign: 'center',
            fontFamily: fonts.ui,
            fontSize: 34,
            fontWeight: 600,
            color: colors.text,
            letterSpacing: -0.3,
            opacity: Math.min(1, inP) * out,
            transform: `translateY(${(1 - inP) * 16}px)`,
          }}
        >
          {c.text}
        </div>
      );
    })}
  </AbsoluteFill>
);
