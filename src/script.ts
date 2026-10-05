// The spoken script. `text` is what captions show; `tts` (optional) is what the voice reads.
// Run `npx tsx scripts/generate-voice.mts` to generate public/audio/vo/<id>.mp3 + .json.
export const VOICES = {
  narrator: "TX3LPaxmHKxFdv7VOQHJ", // Liam: energetic, young American
} as const;

export type Line = {
  id: string;
  voiceId: string;
  text: string;
  tts?: string;
  seed?: number;
};

export const LINES: Line[] = [];
