import React from "react";
import { Composition, Folder } from "remotion";
import { Main } from "./Main";
import { Close } from "./scenes/Close";
import { Hook } from "./scenes/Hook";
import { Knock } from "./scenes/Knock";
import { Measure } from "./scenes/Measure";
import { Meet } from "./scenes/Meet";
import { Options } from "./scenes/Options";
import { Sense } from "./scenes/Sense";
import { Talk } from "./scenes/Talk";
import { FPS, SceneId, sceneFrames, sec, TOTAL_SECONDS } from "./timing";

const scene = (id: SceneId, component: React.FC) => (
  <Composition
    key={id}
    id={`Scene-${id}`}
    component={component}
    fps={FPS}
    durationInFrames={sceneFrames(id).durationInFrames}
    width={1920}
    height={1080}
  />
);

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Main" component={Main} fps={FPS} durationInFrames={sec(TOTAL_SECONDS)} width={1920} height={1080} />
    <Folder name="Scenes">
      {scene("hook", Hook)}
      {scene("meet", Meet)}
      {scene("measure", Measure)}
      {scene("sense", Sense)}
      {scene("knock", Knock)}
      {scene("talk", Talk)}
      {scene("options", Options)}
      {scene("close", Close)}
    </Folder>
  </>
);
