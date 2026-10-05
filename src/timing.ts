// Single source of truth for the timeline, in seconds. Scenes play back to back.
export const FPS = 30;

export const SCENES = [{ id: "intro", start: 0.0, end: 5.0 }] as const;

export type SceneId = (typeof SCENES)[number]["id"];

export const TOTAL_SECONDS = SCENES[SCENES.length - 1].end;

// When each spoken line starts (absolute seconds). Durations come from the audio files.
export const VO_AT: Record<string, number> = {};

// Sound effects: absolute start time in seconds.
export const SFX_AT: { id: string; at: number; volume?: number }[] = [];

export const sec = (s: number) => Math.round(s * FPS);
export const sceneFrames = (id: SceneId) => {
  const s = SCENES.find((x) => x.id === id)!;
  return { from: sec(s.start), durationInFrames: sec(s.end) - sec(s.start) };
};
