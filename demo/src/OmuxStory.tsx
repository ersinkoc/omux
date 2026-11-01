import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {colors} from './theme';
import {Background} from './hype/Background';
import {Overlay, SceneShell, schedule, totalDuration} from './hype/Transitions';
import {Outro} from './hype/TextScenes';
import {hypeFont} from './hype/Kinetic';
import {ChaosScene} from './story/Chaos';
import {GatherScene, PanesScene} from './story/Assemble';
import {AgentsBeat, CommandBeat, GitBeat, HundredBeat, NeedsYouBeat, UsageBeat} from './story/Features';
import {ProductivityBar} from './story/ProductivityBar';

// Pain to solution in four acts; the productivity bar is driven by the global frame.
export const storyScenes = schedule([
  {id: 'chaos', dur: 270, out: {type: 'flash', color: '#FFFFFF'}, render: (f) => <ChaosScene frame={f} />},
  {id: 'gather', dur: 180, out: {type: 'cut'}, render: (f) => <GatherScene frame={f} />},
  {id: 'panes', dur: 150, out: {type: 'wipe', color: colors.cyan, dir: 'right'}, render: (f) => <PanesScene frame={f} />},
  {id: 'needs-you', dur: 76, out: {type: 'scaleblur'}, render: (f) => <NeedsYouBeat frame={f} />},
  {id: 'agents', dur: 70, out: {type: 'wipe', color: colors.violet, dir: 'left'}, render: (f) => <AgentsBeat frame={f} />},
  {id: 'git', dur: 90, out: {type: 'push'}, render: (f) => <GitBeat frame={f} />},
  {id: 'usage', dur: 60, out: {type: 'wipe', color: colors.amber, dir: 'down'}, render: (f) => <UsageBeat frame={f} />},
  {id: 'command', dur: 80, out: {type: 'flash', color: colors.green}, render: (f) => <CommandBeat frame={f} />},
  {id: 'hundred', dur: 70, out: {type: 'scaleblur'}, render: (f) => <HundredBeat frame={f} />},
  {id: 'outro', dur: 120, out: {type: 'cut'}, render: (f) => <Outro frame={f} />},
]);

export const STORY_DURATION = totalDuration(storyScenes);

export const OmuxStory: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: colors.bg, fontFamily: hypeFont, overflow: 'hidden'}}>
      <Background frame={frame} />
      {storyScenes.map((s, i) => (
        <SceneShell key={s.id} scene={s} prevOut={storyScenes[i - 1]?.out} frame={frame} />
      ))}
      <ProductivityBar frame={frame} />
      {storyScenes.map((s, i) =>
        i < storyScenes.length - 1 ? <Overlay key={`${s.id}-out`} transition={s.out} at={storyScenes[i + 1].start} frame={frame} /> : null,
      )}
    </AbsoluteFill>
  );
};
