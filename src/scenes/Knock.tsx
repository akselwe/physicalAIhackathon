import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Cam, lerpCam, projectUV } from "../room/cam";
import { ParallaxRoom } from "../room/ParallaxRoom";
import { C, MONO } from "../theme";
import { clamp, ease, easeInOut } from "../ui/anim";
import { Chip, Corners, hexA, mono } from "./shared-b/hud";

const ROOM = "2185" as const;
const DISP = 1.5;
const START: Cam = { pos: [-0.5, 0.15, 5.4], target: [-0.7, 0.1, 0], fov: 38 };
const END: Cam = { pos: [-1.3, 0.05, 3.9], target: [-1.55, 0.1, 0], fov: 38 };
const KNOCKS = [27, 52];
const GRANT = 80;
const MESSAGE = "Excuse me — may I come in?";

const camAt = (f: number) => lerpCam(START, END, easeInOut(f, 0, 78));

export const Knock: React.FC = () => {
  const f = useCurrentFrame();
  const cam = camAt(f);
  const door = projectUV(cam, ROOM, 0.1, 0.46, DISP);
  const panel = projectUV(cam, ROOM, 0.07, 0.5, DISP);
  const granted = ease(f, GRANT, 10);
  const chars = Math.floor(interpolate(f, [34, 72], [0, MESSAGE.length], clamp));
  const typing = f >= 34 && f < 76;
  const caret = Math.floor(f / 6) % 2 === 0;
  const text = MESSAGE.slice(0, chars);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <ParallaxRoom
        room={ROOM}
        cam={cam}
        look={{ dim: 0.6 + 0.4 * granted, sat: 0.85, tint: [0.9, 0.97, 1.05], disp: DISP }}
      />
      {/* warm light flooding through the door when access is granted */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(600px 520px at ${door.x}px ${door.y}px, ${hexA("#fff1c9", 0.55 * granted)}, ${hexA(C.ok, 0.18 * granted)} 45%, transparent 75%)`,
          mixBlendMode: "screen",
        }}
      />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {/* target reticle on the door */}
        <g opacity={ease(f, 4, 10)}>
          {[0, 1, 2, 3].map((i) => {
            const sx = i % 2 === 0 ? -1 : 1;
            const sy = i < 2 ? -1 : 1;
            const w = 120;
            const h = 190;
            const cx = door.x + sx * w;
            const cy = door.y + sy * h;
            return <path key={i} d={`M ${cx} ${cy - sy * 36} V ${cy} H ${cx - sx * 36}`} fill="none" stroke={granted > 0.5 ? C.ok : C.warn} strokeWidth={3.5} />;
          })}
        </g>
        {/* key panel / handle focus */}
        <circle cx={panel.x} cy={panel.y} r={9} fill={hexA(C.warn, 0.9)} opacity={ease(f, 8, 8) * (1 - granted)} />
        {/* knock ripples */}
        {KNOCKS.map((k) =>
          [0, 6, 12].map((d) => {
            const t = (f - k - d) / 22;
            if (t < 0 || t > 1) return null;
            return <circle key={`${k}-${d}`} cx={door.x} cy={door.y + 20} r={30 + 300 * t} fill="none" stroke={C.lidar} strokeWidth={4 * (1 - t) + 1} opacity={0.9 * (1 - t)} />;
          }),
        )}
      </svg>
      <Corners color={granted > 0.5 ? C.ok : C.warn} />
      {/* door status */}
      <div style={{ position: "absolute", left: door.x + 150, top: door.y - 250, opacity: ease(f, 5, 10) }}>
        <Chip color={granted > 0.5 ? C.ok : C.laser} size={26}>
          <span style={{ width: 12, height: 12, borderRadius: 6, background: granted > 0.5 ? C.ok : C.laser }} />
          {granted > 0.5 ? "Door open" : "Door closed"}
        </Chip>
      </div>
      <div style={{ position: "absolute", left: 90, top: 78, opacity: ease(f, 0, 8) }}>
        <Chip color={C.lidar}>
          <span style={{ width: 12, height: 12, borderRadius: 6, background: C.lidar }} />
          Stud · entry protocol
        </Chip>
      </div>
      {/* rover display with typewriter message */}
      <div
        style={{
          position: "absolute",
          left: 610,
          top: 690,
          width: 820,
          opacity: ease(f, 30, 8),
          transform: `translateY(${interpolate(ease(f, 30, 12), [0, 1], [24, 0], clamp)}px)`,
        }}
      >
        <div
          style={{
            border: `2px solid ${hexA(C.lidar, 0.8)}`,
            background: "rgba(5,7,10,0.92)",
            borderRadius: 14,
            padding: "22px 30px",
            boxShadow: `0 0 50px ${hexA(C.lidar, 0.25)}, inset 0 0 30px ${hexA(C.lidar, 0.08)}`,
          }}
        >
          <div style={{ ...mono, fontSize: 16, color: C.lidar, marginBottom: 8 }}>Stud · display</div>
          <div style={{ fontFamily: MONO, fontSize: 46, color: C.ink, minHeight: 58, whiteSpace: "nowrap" }}>
            {text}
            <span style={{ opacity: typing && caret ? 1 : 0, color: C.lidar }}>▍</span>
          </div>
        </div>
        <div style={{ width: 0, height: 0, marginLeft: 70, borderLeft: "16px solid transparent", borderRight: "16px solid transparent", borderTop: `20px solid ${hexA(C.lidar, 0.8)}` }} />
      </div>
      {/* access granted */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 90,
          top: 150,
          display: "flex",
          justifyContent: "flex-end",
          opacity: granted,
          transform: `scale(${interpolate(granted, [0, 1], [0.85, 1], clamp)})`,
        }}
      >
        <Chip color={C.ok} size={44} style={{ padding: "16px 34px", boxShadow: `0 0 60px ${hexA(C.ok, 0.45)}` }}>
          Access granted ✓
        </Chip>
      </div>
    </AbsoluteFill>
  );
};
