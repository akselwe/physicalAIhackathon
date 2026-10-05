// The spoken script. `text` is what captions show; `tts` (optional) is what the voice reads.
// Run `npx tsx scripts/generate-voice.mts` to generate public/audio/vo/<id>.mp3 + .json.
export const VOICES = {
  narrator: "nPczCjzI2devNBz1zQrb", // Brian: deep, resonant, comforting
} as const;

export type Line = {
  id: string;
  voiceId: string;
  text: string;
  tts?: string;
  seed?: number;
};

export const LINES: Line[] = [
  { id: "v1-guess", voiceId: VOICES.narrator, text: "Every renovation starts with a guess.", seed: 11 },
  { id: "v2-meet", voiceId: VOICES.narrator, text: "Meet Stud. A rover that checks your home's health, room by room.", seed: 11 },
  { id: "v3-laser", voiceId: VOICES.narrator, text: "Laser and lidar measure every wall. To the millimeter.", seed: 11 },
  {
    id: "v4-sense",
    voiceId: VOICES.narrator,
    text: "A thermal camera finds where the heat escapes. Sensors catch moisture, CO2, and radon.",
    tts: "A thermal camera finds where the heat escapes. Sensors catch moisture, C.O. two, and radon.",
    seed: 11,
  },
  { id: "v5-knock", voiceId: VOICES.narrator, text: "Closed door? It knocks. Politely.", seed: 11 },
  { id: "v6-talk", voiceId: VOICES.narrator, text: "Then just talk to it. Open the kitchen to the living room.", seed: 11 },
  {
    id: "v7-options",
    voiceId: VOICES.narrator,
    text: "Three options. Light, mid, full. Each with before, after, and cost.",
    seed: 11,
  },
  { id: "v8-close", voiceId: VOICES.narrator, text: "Stud. Know your house before the contractor does.", seed: 11 },
];
