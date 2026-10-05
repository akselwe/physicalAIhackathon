import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { AudioMix } from "./AudioMix";
import { Captions } from "./Captions";
import { Close } from "./scenes/Close";
import { Hook } from "./scenes/Hook";
import { Knock } from "./scenes/Knock";
import { Measure } from "./scenes/Measure";
import { Meet } from "./scenes/Meet";
import { Options } from "./scenes/Options";
import { Sense } from "./scenes/Sense";
import { Talk } from "./scenes/Talk";
import { SceneId, sceneFrames } from "./timing";
import { Grade } from "./ui/Grade";

const SCENE_COMPONENTS: Record<SceneId, React.FC> = {
  hook: Hook,
  meet: Meet,
  measure: Measure,
  sense: Sense,
  knock: Knock,
  talk: Talk,
  options: Options,
  close: Close,
};

// Each scene gets its own Sequence, so inside a scene useCurrentFrame() starts at 0.
export const Main: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    {(Object.keys(SCENE_COMPONENTS) as SceneId[]).map((id) => {
      const Scene = SCENE_COMPONENTS[id];
      return (
        <Sequence key={id} name={id} {...sceneFrames(id)}>
          <Scene />
        </Sequence>
      );
    })}
    <Grade />
    <Captions />
    <AudioMix music />
  </AbsoluteFill>
);
