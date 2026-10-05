// Single source of truth for the timeline, in seconds. Scenes play back to back.
export const FPS = 30;

export const SCENES = [
  { id: "hook", start: 0.0, end: 3.0 },
  { id: "meet", start: 3.0, end: 7.8 },
  { id: "measure", start: 7.8, end: 12.2 },
  { id: "sense", start: 12.2, end: 18.6 },
  { id: "knock", start: 18.6, end: 21.9 },
  { id: "talk", start: 21.9, end: 25.9 },
  { id: "options", start: 25.9, end: 33.0 },
  { id: "close", start: 33.0, end: 39.0 },
] as const;

export type SceneId = (typeof SCENES)[number]["id"];

export const TOTAL_SECONDS = SCENES[SCENES.length - 1].end;

// When each spoken line starts (absolute seconds). Durations come from the audio files.
export const VO_AT: Record<string, number> = {
  "v1-guess": 0.4,
  "v2-meet": 3.1,
  "v3-laser": 7.9,
  "v4-sense": 12.3,
  "v5-knock": 18.7,
  "v6-talk": 22.0,
  "v7-options": 26.0,
  "v8-close": 33.5,
};

// Sound effects: absolute start time in seconds.
export const SFX_AT: { id: string; at: number; volume?: number }[] = [
  { id: "boot", at: 0.15, volume: 0.7 },
  { id: "swish", at: 2.95, volume: 0.6 },
  { id: "servo", at: 5.2, volume: 0.7 },
  { id: "lidar", at: 7.8, volume: 0.7 },
  { id: "tick", at: 9.4, volume: 0.6 },
  { id: "tick", at: 10.3, volume: 0.6 },
  { id: "tick", at: 11.2, volume: 0.6 },
  { id: "swish", at: 12.1, volume: 0.6 },
  { id: "scan", at: 12.9, volume: 0.6 },
  { id: "alert", at: 17.8, volume: 0.6 },
  { id: "swish", at: 18.5, volume: 0.6 },
  { id: "knock", at: 19.5, volume: 0.9 },
  { id: "knock", at: 20.35, volume: 0.9 },
  { id: "pop", at: 21.3, volume: 0.6 },
  { id: "swish", at: 21.8, volume: 0.6 },
  { id: "pop", at: 22.7, volume: 0.5 },
  { id: "wall", at: 24.3, volume: 0.7 },
  { id: "swish", at: 25.8, volume: 0.6 },
  { id: "pop", at: 27.4, volume: 0.5 },
  { id: "pop", at: 28.1, volume: 0.5 },
  { id: "pop", at: 28.8, volume: 0.5 },
  { id: "chime", at: 31.2, volume: 0.6 },
  { id: "riser", at: 31.6, volume: 0.7 },
  { id: "boom", at: 33.0, volume: 0.9 },
  { id: "chime", at: 35.2, volume: 0.5 },
];

export const sec = (s: number) => Math.round(s * FPS);
export const sceneFrames = (id: SceneId) => {
  const s = SCENES.find((x) => x.id === id)!;
  return { from: sec(s.start), durationInFrames: sec(s.end) - sec(s.start) };
};
