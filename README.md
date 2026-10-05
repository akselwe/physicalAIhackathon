# physicalAIhackathon

Video for the Physical AI hackathon. Built with Remotion, React Three Fiber and ElevenLabs.
Started from the `selger-video` setup: the same skills, scripts and building blocks, without the Selger content.

## Commands

```console
npm i                  # install
npm run dev            # Remotion Studio
npm run lint           # eslint + tsc
npx remotion render Main out/video.mp4
```

## Layout

- `src/timing.ts`: timeline (scenes, voice-over start times, sound effects). Single source of truth.
- `src/script.ts`: spoken lines and voices. `npx tsx scripts/generate-voice.mts` writes `public/audio/vo/`.
- `src/vo.ts`: word timings for generated lines (import each `vo/<id>.json` here).
- `src/AudioMix.tsx`, `src/Captions.tsx`: narration, music ducking, SFX and word-by-word captions.
- `src/three/`, `src/ui/`: 3D stage and glow, colour grade and animation helpers.
- `scripts/`: ElevenLabs voice, music and SFX generation, and narrator swap. Needs `ELEVENLABS_API_KEY` in `.env`.
- `.agents/skills` (symlinked from `.claude/skills`): Remotion and ElevenLabs skills.

`src/theme.ts` still has the Selger palette; change it to fit this project.
`scripts/generate-music-sfx.mts` still holds the Selger music plan and SFX prompts; rewrite them for this video.
