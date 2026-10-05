import React from "react";
import { AbsoluteFill } from "remotion";
import { AudioMix } from "./AudioMix";
import { Captions } from "./Captions";
import { C, SANS } from "./theme";
import { Stage } from "./three/Stage";
import { Grade } from "./ui/Grade";

// Starting point: a 3D stage, captions, audio mix and colour grade. Replace the placeholder with scenes.
export const Main: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.void }}>
    <Stage>
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={C.agent} />
      </mesh>
    </Stage>
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", fontFamily: SANS, color: C.ink, fontSize: 64 }}>
      physicalAIhackathon
    </AbsoluteFill>
    <Grade />
    <Captions />
    <AudioMix />
  </AbsoluteFill>
);
