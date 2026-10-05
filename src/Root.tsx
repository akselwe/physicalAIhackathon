import React from "react";
import { Composition } from "remotion";
import { Main } from "./Main";
import { FPS, sec, TOTAL_SECONDS } from "./timing";

export const RemotionRoot: React.FC = () => (
  <Composition id="Main" component={Main} fps={FPS} durationInFrames={sec(TOTAL_SECONDS)} width={1920} height={1080} />
);
