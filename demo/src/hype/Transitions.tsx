import React from 'react';
import {AbsoluteFill, Easing, interpolate} from 'remotion';
import {colors} from '../theme';

const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

export type Transition =
  | {type: 'cut'}
  | {type: 'wipe'; color: string; dir: 'right' | 'left' | 'down' | 'up'}
  | {type: 'flash'; color: string}
  | {type: 'scaleblur'}
  | {type: 'mask'; color: string}
  | {type: 'push'};

// Frames during which the outgoing and incoming scenes are both on screen.
export const overlapOf = (t: Transition) =>
  t.type === "wipe" ? WIPE_FRAMES : t.type === "mask" ? MASK_FRAMES : t.type === "push" ? PUSH_FRAMES : t.type === "scaleblur" ? SB_OVERLAP : 0;

export const WIPE_FRAMES = 10;
export const MASK_FRAMES = 12;
export const PUSH_FRAMES = 10;
const SB_OUT = 8;
const SB_IN = 10;
const SB_OVERLAP = 4; // blur-out and blur-in overlap so no frame is empty
const BAND = 30; // wipe band width, % of the screen
const DIAG = 1102; // half diagonal of 1920x1080, px: the circle radius that covers the frame

export type SceneInput = {
  id: string;
  dur: number;
  out: Transition; // how this scene hands over to the next one
  render: (frame: number, dur: number) => React.ReactNode;
};
export type SceneDef = SceneInput & {start: number};

// Lays scenes end to end; overlapping transitions start the next scene early.
export const schedule = (defs: SceneInput[]): SceneDef[] => {
  let t = 0;
  const out: SceneDef[] = [];
  defs.forEach((d, i) => {
    const prev = defs[i - 1];
    const start = t - (prev ? overlapOf(prev.out) : 0);
    out.push({...d, start});
    t = start + d.dur;
  });
  return out;
};

export const totalDuration = (scenes: SceneDef[]) => {
  const last = scenes[scenes.length - 1];
  return last.start + last.dur;
};

const snap = Easing.bezier(0.7, 0, 0.2, 1);

// Position of the wipe band's leading edge, 0..100+BAND, for progress p.
const wipeEdge = (p: number) => p * (100 + BAND);

// clip-path inset keeping the part of the screen ahead of (A) or behind (B) the band.
const wipeClip = (dir: 'right' | 'left' | 'down' | 'up', edge: number, side: 'ahead' | 'behind') => {
  // `from` is the % already passed by the band's trailing edge; `to` is the leading edge.
  const lead = Math.min(100, Math.max(0, edge));
  const trail = Math.min(100, Math.max(0, edge - BAND));
  // inset(top right bottom left)
  if (dir === 'right') return side === 'ahead' ? `inset(0 0 0 ${lead}%)` : `inset(0 ${100 - trail}% 0 0)`;
  if (dir === 'left') return side === 'ahead' ? `inset(0 ${lead}% 0 0)` : `inset(0 0 0 ${100 - trail}%)`;
  if (dir === 'down') return side === 'ahead' ? `inset(${lead}% 0 0 0)` : `inset(0 0 ${100 - trail}% 0)`;
  return side === 'ahead' ? `inset(0 0 ${lead}% 0)` : `inset(${100 - trail}% 0 0 0)`;
};

const maskRadius = (p: number) => interpolate(p, [0, 1], [0, DIAG], {...clamp, easing: Easing.inOut(Easing.quad)});

export const SceneShell: React.FC<{scene: SceneDef; prevOut?: Transition; frame: number}> = ({scene, prevOut, frame}) => {
  const local = frame - scene.start;
  if (local < 0 || local >= scene.dur) return null;
  const end = scene.dur;

  let transform = '';
  let opacity = 1;
  let filter = '';
  let clipPath: string | undefined;
  let maskImage: string | undefined;

  // Entry effects, driven by the previous scene's out-transition.
  if (prevOut?.type === 'scaleblur') {
    const p = interpolate(local, [0, SB_IN], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.4))});
    const q = interpolate(local, [0, SB_IN], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
    transform += ` scale(${0.84 + 0.16 * p})`;
    filter += ` blur(${((1 - q) * 14).toFixed(1)}px)`;
    opacity *= interpolate(local, [0, 5], [0.35, 1], clamp);
  } else if (prevOut?.type === 'mask') {
    if (local < MASK_FRAMES) {
      const px = maskRadius(local / MASK_FRAMES);
      clipPath = `circle(${px.toFixed(1)}px at 50% 50%)`;
    }
  } else if (prevOut?.type === 'push') {
    const p = interpolate(local, [0, PUSH_FRAMES], [1, 0], {...clamp, easing: snap});
    transform += ` translateX(${p * 1920}px)`;
  } else if (prevOut?.type === 'wipe') {
    if (local < WIPE_FRAMES) {
      const p = interpolate(local, [0, WIPE_FRAMES], [0, 1], {...clamp, easing: snap});
      clipPath = wipeClip(prevOut.dir, wipeEdge(p), 'behind');
    }
  }

  // Exit effects, driven by this scene's own out-transition.
  if (scene.out.type === 'scaleblur') {
    const p = interpolate(local, [end - SB_OUT, end], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
    transform += ` scale(${1 + 0.22 * p})`;
    filter += ` blur(${(p * 14).toFixed(1)}px)`;
    opacity *= 1 - p;
  } else if (scene.out.type === 'push') {
    const p = interpolate(local, [end - PUSH_FRAMES, end], [0, 1], {...clamp, easing: snap});
    transform += ` translateX(${-p * 1920}px)`;
  } else if (scene.out.type === 'wipe') {
    if (local >= end - WIPE_FRAMES) {
      const p = interpolate(local, [end - WIPE_FRAMES, end], [0, 1], {...clamp, easing: snap});
      clipPath = wipeClip(scene.out.dir, wipeEdge(p), 'ahead');
    }
  } else if (scene.out.type === 'mask') {
    if (local >= end - MASK_FRAMES) {
      const px = maskRadius((local - (end - MASK_FRAMES)) / MASK_FRAMES);
      // Iris the outgoing scene out: transparent inside the circle, visible outside.
      maskImage = `radial-gradient(circle at 50% 50%, transparent ${px.toFixed(1)}px, #000 ${(px + 1).toFixed(1)}px)`;
    }
  }

  return (
    <AbsoluteFill
      style={{
        transform: transform || undefined,
        opacity,
        filter: filter.trim() || undefined,
        clipPath,
        WebkitMaskImage: maskImage,
        maskImage,
        transformOrigin: 'center',
        overflow: 'hidden',
      }}
    >
      {scene.render(local, scene.dur)}
    </AbsoluteFill>
  );
};

// Full-screen overlays drawn above all scenes around the boundary frame `at`
// (the first frame of the next scene).
export const Overlay: React.FC<{transition: Transition; at: number; frame: number}> = ({transition, at, frame}) => {
  const d = frame - at;
  if (transition.type === 'flash') {
    // Three frames on the outgoing scene only, never opaque; the cut itself is the hit.
    if (d < -3 || d >= 0) return null;
    const o = interpolate(d, [-3, -2, -1, 0], [0, 0.18, 0.38, 0], clamp);
    return <AbsoluteFill style={{background: transition.color, opacity: o}} />;
  }
  if (transition.type === 'mask') {
    // Ring on the edge of the iris.
    if (d < 0 || d >= MASK_FRAMES) return null;
    const px = maskRadius(d / MASK_FRAMES);
    return (
      <div
        style={{
          position: 'absolute',
          left: 960 - px,
          top: 540 - px,
          width: px * 2,
          height: px * 2,
          borderRadius: '50%',
          border: `8px solid ${transition.color}`,
          boxShadow: `0 0 40px ${transition.color}88`,
          boxSizing: 'border-box',
        }}
      />
    );
  }
  if (transition.type === 'wipe') {
    // A colour band sweeping across; the next scene is already visible behind it.
    if (d < 0 || d >= WIPE_FRAMES) return null;
    const p = interpolate(d, [0, WIPE_FRAMES], [0, 1], {...clamp, easing: snap});
    const edge = wipeEdge(p); // leading edge, % along the travel axis
    const horizontal = transition.dir === 'right' || transition.dir === 'left';
    const size = horizontal ? 1920 : 1080;
    const bandPx = (BAND / 100) * size;
    const leadPx = (edge / 100) * size;
    const forward = transition.dir === 'right' || transition.dir === 'down';
    // Band occupies [lead - band, lead] along the axis, measured from the start side.
    const startPx = forward ? leadPx - bandPx : size - leadPx;
    const style: React.CSSProperties = horizontal
      ? {left: startPx, top: 0, width: bandPx, height: 1080}
      : {left: 0, top: startPx, width: 1920, height: bandPx};
    return (
      <>
        <div style={{position: 'absolute', ...style, background: transition.color}} />
        <div
          style={{
            position: 'absolute',
            ...style,
            background: colors.chrome,
            transform: horizontal ? `translateX(${forward ? -bandPx * 0.5 : bandPx * 0.5}px)` : `translateY(${forward ? -bandPx * 0.5 : bandPx * 0.5}px)`,
            opacity: 0.9,
          }}
        />
        <div style={{position: 'absolute', ...style, background: transition.color}} />
      </>
    );
  }
  return null;
};
