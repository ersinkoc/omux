import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {colors, T} from './theme';
import {Intro, Outro} from './Intro';
import {Window} from './Window';
import {Captions} from './Captions';

// Each <Sequence> passes the global frame down so that one continuous
// window animation spans beats 2–5 without any jump cuts.
const WithFrame: React.FC<{render: (frame: number) => React.ReactNode; offset: number}> = ({render, offset}) => {
  const local = useCurrentFrame();
  return <>{render(local + offset)}</>;
};

export const OmuxIntro: React.FC = () => {
  return (
    <AbsoluteFill style={{background: colors.bg}}>
      <Sequence from={T.windowStart} durationInFrames={T.outroStart + 24 - T.windowStart} name="Window">
        <WithFrame offset={T.windowStart} render={(f) => <Window frame={f} />} />
      </Sequence>
      <Sequence from={T.approvalStart} durationInFrames={T.outroStart - T.approvalStart} name="Captions">
        <WithFrame offset={T.approvalStart} render={(f) => <Captions frame={f} />} />
      </Sequence>
      <Sequence from={0} durationInFrames={T.windowStart + 20} name="Intro">
        <WithFrame offset={0} render={(f) => <Intro frame={f} />} />
      </Sequence>
      <Sequence from={T.outroStart + 10} durationInFrames={T.end - T.outroStart - 10} name="Outro">
        <WithFrame offset={T.outroStart + 10} render={(f) => <Outro frame={f} />} />
      </Sequence>
    </AbsoluteFill>
  );
};
