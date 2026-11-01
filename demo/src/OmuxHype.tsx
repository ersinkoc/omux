import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {colors} from './theme';
import {Background} from './hype/Background';
import {Overlay, SceneShell, schedule, totalDuration} from './hype/Transitions';
import {BranchReviewMerge, EightAgents, FiveMB, NothingLost, OneWindow, Outro} from './hype/TextScenes';
import {AllowDenyScene, BranchesScene, DiffScene, DockScene, SidebarScene, SideBySideScene} from './hype/UIScenes';
import {hypeFont} from './hype/Kinetic';

// 24 s, 12 scenes, no two consecutive transitions alike.
export const hypeScenes = schedule([
  {id: 'eight-agents', dur: 42, out: {type: 'cut'}, render: (f) => <EightAgents frame={f} />},
  {id: 'one-window', dur: 48, out: {type: 'wipe', color: colors.cyan, dir: 'right'}, render: (f) => <OneWindow frame={f} />},
  {id: 'sidebar', dur: 66, out: {type: 'scaleblur'}, render: (f) => <SidebarScene frame={f} />},
  {id: 'dock', dur: 48, out: {type: 'wipe', color: colors.amber, dir: 'down'}, render: (f) => <DockScene frame={f} />},
  {id: 'allow-deny', dur: 66, out: {type: 'flash', color: colors.green}, render: (f) => <AllowDenyScene frame={f} />},
  {id: 'nothing-lost', dur: 54, out: {type: 'mask', color: colors.violet}, render: (f) => <NothingLost frame={f} />},
  {id: 'branches', dur: 78, out: {type: 'wipe', color: colors.violet, dir: 'left'}, render: (f) => <BranchesScene frame={f} />},
  {id: 'diff', dur: 60, out: {type: 'cut'}, render: (f) => <DiffScene frame={f} />},
  {id: 'branch-review-merge', dur: 48, out: {type: 'push'}, render: (f) => <BranchReviewMerge frame={f} />},
  {id: 'side-by-side', dur: 70, out: {type: 'wipe', color: colors.green, dir: 'up'}, render: (f) => <SideBySideScene frame={f} />},
  {id: 'five-mb', dur: 60, out: {type: 'flash', color: '#FFFFFF'}, render: (f) => <FiveMB frame={f} />},
  {id: 'outro', dur: 110, out: {type: 'cut'}, render: (f) => <Outro frame={f} />},
]);

export const HYPE_DURATION = totalDuration(hypeScenes);

export const OmuxHype: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: colors.bg, fontFamily: hypeFont, overflow: 'hidden'}}>
      <Background frame={frame} />
      {hypeScenes.map((s, i) => (
        <SceneShell key={s.id} scene={s} prevOut={hypeScenes[i - 1]?.out} frame={frame} />
      ))}
      {hypeScenes.map((s, i) =>
        i < hypeScenes.length - 1 ? <Overlay key={`${s.id}-out`} transition={s.out} at={hypeScenes[i + 1].start} frame={frame} /> : null,
      )}
    </AbsoluteFill>
  );
};
