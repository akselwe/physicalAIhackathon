// Generates the music bed (ElevenLabs Music, composition plan matched to the timeline)
// and the sound effects (ElevenLabs sound generation).
// Run: npx tsx scripts/generate-music-sfx.mts [music|sfx] [--only id1,id2]
import "dotenv/config";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { SCENES } from "../src/timing";

const API_KEY = process.env.ELEVENLABS_API_KEY;
if (!API_KEY) throw new Error("ELEVENLABS_API_KEY is missing (put it in .env)");
const FORMAT = process.env.ELEVEN_FORMAT ?? "mp3_44100_128";

const what = process.argv[2] ?? "all";
const only = process.argv.includes("--only")
  ? process.argv[process.argv.indexOf("--only") + 1].split(",")
  : null;

const post = async (url: string, body: unknown) => {
  const res = await fetch(url, {
    method: "POST",
    headers: { "xi-api-key": API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status} ${await res.text()}`);
  return Buffer.from(await res.arrayBuffer());
};

const ms = (id: string) => {
  const s = SCENES.find((x) => x.id === id)!;
  return Math.round((s.end - s.start) * 1000);
};

if (what === "all" || what === "music") {
  const dir = join(process.cwd(), "public", "audio", "music");
  mkdirSync(dir, { recursive: true });
  // One chunk per scene, matched to the timeline in src/timing.ts. Edit styles per scene.
  const styles = ["instrumental", "cinematic electronic", "128 bpm", "high production value"];
  const noVocals = ["vocals", "singing", "choir", "lyrics", "speech"];
  const audio = await post(`https://api.elevenlabs.io/v1/music?output_format=${FORMAT}`, {
    model_id: "music_v2_5",
    composition_plan: {
      chunks: SCENES.map((s) => ({
        // Text is sung as lyrics, so only an instrumental marker goes here; the mood lives in the styles.
        text: "[Instrumental]",
        duration_ms: ms(s.id),
        positive_styles: styles,
        negative_styles: noVocals,
        context_adherence: "high",
      })),
    },
  });
  writeFileSync(join(dir, process.env.MUSIC_OUT ?? "bed.mp3"), audio);
  console.log(`music: bed.mp3 ${(audio.length / 1024).toFixed(0)} kB`);
}

const SFX: { id: string; text: string; duration: number; influence?: number }[] = [
  { id: "swish", text: "Very fast clean whoosh swish for a video transition cut, short and punchy", duration: 0.5 },
  { id: "riser", text: "Short cinematic swoosh riser that ends in a soft punch", duration: 1.6 },
  { id: "boom", text: "Deep cinematic sub boom impact with a long dark tail, trailer logo hit", duration: 3.0 },
  { id: "pop", text: "Soft deep UI notification pop, short and clean, modern app", duration: 0.5 },
  { id: "chime", text: "Bright satisfying success chime, modern UI, short", duration: 1.0 },
  { id: "ping", text: "Single notification ping, short, clean, close", duration: 0.5 },
];

if (what === "all" || what === "sfx") {
  const dir = join(process.cwd(), "public", "audio", "sfx");
  mkdirSync(dir, { recursive: true });
  for (const s of SFX) {
    if (only && !only.includes(s.id)) continue;
    const audio = await post(`https://api.elevenlabs.io/v1/sound-generation?output_format=${FORMAT}`, {
      text: s.text,
      duration_seconds: s.duration,
      prompt_influence: s.influence ?? 0.6,
      model_id: "eleven_text_to_sound_v2",
    });
    writeFileSync(join(dir, `${s.id}.mp3`), audio);
    console.log(`sfx: ${s.id}.mp3 ${(audio.length / 1024).toFixed(0)} kB`);
  }
}
