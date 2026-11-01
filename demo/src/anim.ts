import {interpolate, spring} from 'remotion';
import {FPS} from './theme';

export const clamp = {
  extrapolateLeft: 'clamp' as const,
  extrapolateRight: 'clamp' as const,
};

export const fade = (frame: number, from: number, to: number) =>
  interpolate(frame, [from, to], [0, 1], clamp);

export const fadeOut = (frame: number, from: number, to: number) =>
  interpolate(frame, [from, to], [1, 0], clamp);

export const pop = (
  frame: number,
  start: number,
  config: {damping?: number; stiffness?: number; mass?: number} = {},
) =>
  spring({
    frame: frame - start,
    fps: FPS,
    config: {damping: 14, stiffness: 140, mass: 0.8, ...config},
  });

export const slide = (frame: number, start: number) =>
  spring({
    frame: frame - start,
    fps: FPS,
    config: {damping: 20, stiffness: 110, mass: 1},
  });
