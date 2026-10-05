import { Audio } from "@remotion/media";
import React from "react";
import { interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { SFX_AT, sec, VO_AT } from "./timing";
import { VO } from "./vo";

const MUSIC_BASE = 0.55;
const MUSIC_DUCKED = 0.2;
const MUSIC_FILE = "audio/music/bed.mp3"; // generate with scripts/generate-music-sfx.mts
const clampOpts = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Music level per frame: ducked under narration.
const useMusicLevel = () => {
  const t = useCurrentFrame() / 30;
  let duck = 0;
  for (const [id, at] of Object.entries(VO_AT)) {
    const end = at + VO[id].duration;
    duck = Math.max(duck, interpolate(t, [at - 0.15, at, end, end + 0.35], [0, 1, 1, 0], clampOpts));
  }
  return MUSIC_BASE + (MUSIC_DUCKED - MUSIC_BASE) * duck;
};

export const AudioMix: React.FC<{ readonly music?: boolean }> = ({ music = false }) => {
  const level = useMusicLevel();
  return (
    <>
      {music ? <Audio src={staticFile(MUSIC_FILE)} volume={level} /> : null}
      {Object.entries(VO_AT).map(([id, at]) => (
        <Sequence key={id} from={sec(at)} name={`VO ${id}`} layout="none">
          <Audio src={staticFile(`audio/vo/${id}.mp3`)} />
        </Sequence>
      ))}
      {SFX_AT.map((s, i) => (
        <Sequence key={`${s.id}-${i}`} from={sec(s.at)} name={`SFX ${s.id}`} layout="none">
          <Audio src={staticFile(`audio/sfx/${s.id}.mp3`)} volume={s.volume ?? 0.7} />
        </Sequence>
      ))}
    </>
  );
};
