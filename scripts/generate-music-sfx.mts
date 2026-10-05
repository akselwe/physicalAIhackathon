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
  // One chunk per scene, matched to the timeline in src/timing.ts.
  const noVocals = ["vocals", "singing", "choir", "lyrics", "speech"];
  const base = ["instrumental", "cinematic electronic", "128 bpm", "high production value", "tech product launch"];
  const SCENE_STYLES: Record<string, string[]> = {
    hook: ["sparse", "tense", "low sub drone", "single ticking pulse", "dark"],
    meet: ["kick drum enters", "pulsing bass", "rising energy", "confident", "futuristic"],
    measure: ["fast arpeggiated synth", "precise", "rolling bass", "driving"],
    sense: ["full drums", "driving four on the floor", "building intensity", "scanning synth sweeps"],
    knock: ["drums drop out", "playful plucked pizzicato", "light and polite", "short comedic pause"],
    talk: ["warm", "uplifting pads", "groove returns", "optimistic"],
    options: ["peak energy", "big synth stabs", "triumphant", "driving", "riser at the end"],
    close: ["one huge cinematic impact hit", "then warm hopeful resolve", "inspiring", "short reverb tail"],
  };
  const audio = await post(`https://api.elevenlabs.io/v1/music?output_format=${FORMAT}`, {
    model_id: "music_v2_5",
    composition_plan: {
      chunks: SCENES.map((s, i) => ({
        // Text is sung as lyrics, so only an instrumental marker goes here; the mood lives in the styles.
        text: "[Instrumental]",
        duration_ms: ms(s.id),
        positive_styles: i === 0 ? [...base, ...SCENE_STYLES[s.id]] : SCENE_STYLES[s.id],
        negative_styles: noVocals,
        context_adherence: "high",
      })),
    },
  });
  writeFileSync(join(dir, process.env.MUSIC_OUT ?? "bed.mp3"), audio);
  console.log(`music: bed.mp3 ${(audio.length / 1024).toFixed(0)} kB`);
}

const SFX: { id: string; text: string; duration: number; influence?: number }[] = [
  { id: "boot", text: "Futuristic robot power-up, rising electronic hum with a soft digital chirp, short", duration: 1.8 },
  { id: "swish", text: "Very fast clean whoosh swish for a video transition cut, short and punchy", duration: 0.5 },
  { id: "servo", text: "Small precise electric motor servo extending a telescopic mast upward, smooth mechanical whirr, close", duration: 2.2 },
  { id: "lidar", text: "Sci-fi lidar scanner sweep, rising electronic ping with a short shimmering decay", duration: 1.6 },
  { id: "tick", text: "Single crisp digital laser measurement beep, high pitched, very short, clean UI", duration: 0.5 },
  { id: "scan", text: "Thermal camera scanning sound, low electronic sweep with soft data blips", duration: 1.8 },
  { id: "alert", text: "Subtle two-tone warning alert from a sensor, clean digital, not alarming, short", duration: 1.0 },
  { id: "knock", text: "Two polite knocks on a wooden office door, close, dry, soft", duration: 0.9 },
  { id: "pop", text: "Soft deep UI notification pop, short and clean, modern app", duration: 0.5 },
  { id: "wall", text: "Smooth futuristic architectural wall sliding away, digital sweep with a soft thud, short", duration: 1.5 },
  { id: "riser", text: "Cinematic riser building tension for two seconds, ends abruptly", duration: 2.0 },
  { id: "boom", text: "Deep cinematic sub boom impact with a long dark tail, trailer logo hit", duration: 3.0 },
  { id: "chime", text: "Bright satisfying success chime, modern UI, short", duration: 1.0 },
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
