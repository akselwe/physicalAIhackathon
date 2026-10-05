import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { Cam, lerpCam, projectUV } from "../room/cam";
import { ParallaxRoom } from "../room/ParallaxRoom";
import { C, MONO } from "../theme";
import { clamp, ease } from "../ui/anim";
import { Tag } from "./shared-a/hud";

const FROM: Cam = { pos: [0.2, 0.0, 6.6], target: [0, -0.1, 0], fov: 38 };
const TO: Cam = { pos: [-0.15, -0.1, 5.7], target: [-0.1, -0.15, 0], fov: 38 };

// A guessed measurement drawn between two photo points, flickering like an unreliable estimate.
const GUESSES = [
  { a: [0.3, 0.78], b: [0.66, 0.78], text: "~4 m?", at: 8 },
  { a: [0.27, 0.34], b: [0.27, 0.7], text: "~3 m?", at: 22 },
  { a: [0.5, 0.3], b: [0.8, 0.3], text: "ESTIMATE", at: 36 },
] as const;

export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const t = Math.min(1, frame / 90);
  const cam = lerpCam(FROM, TO, t * t * (3 - 2 * t));
  const glitch = frame >= 82;
  const jitter = glitch ? (random(`j${frame}`) - 0.5) * 36 : 0;
  const flash = interpolate(frame, [84, 86, 89], [0, 0.9, 0.2], clamp);
  const open = interpolate(frame, [0, 10], [0, 1], clamp);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", transform: `translateX(${jitter}px)`, opacity: open }}>
      <ParallaxRoom room="2186" cam={cam} look={{ dim: 0.55, sat: 0.25, tint: [0.9, 0.95, 1.05], disp: 0.8 }} />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {GUESSES.map((g, i) => {
          const p = projectUV(cam, "2186", g.a[0], g.a[1], 0.8);
          const q = projectUV(cam, "2186", g.b[0], g.b[1], 0.8);
          const on = frame >= g.at;
          // unreliable: drops out randomly
          const vis = on ? (random(`f${i}-${Math.floor(frame / 2)}`) > 0.28 ? 1 : 0.15) : 0;
          const grow = ease(frame, g.at, 10);
          const ex = p.x + (q.x - p.x) * grow;
          const ey = p.y + (q.y - p.y) * grow;
          return (
            <g key={i} opacity={vis} stroke={C.warn} strokeWidth={3} strokeDasharray="14 10" fill="none">
              <line x1={p.x} y1={p.y} x2={ex} y2={ey} />
              <line x1={p.x} y1={p.y - 14} x2={p.x} y2={p.y + 14} strokeDasharray="0" />
              <line x1={ex} y1={ey - 14} x2={ex} y2={ey + 14} strokeDasharray="0" />
            </g>
          );
        })}
      </svg>
      {GUESSES.map((g, i) => {
        const p = projectUV(cam, "2186", g.a[0], g.a[1], 0.8);
        const q = projectUV(cam, "2186", g.b[0], g.b[1], 0.8);
        const vis = frame >= g.at + 6 ? (random(`f${i}-${Math.floor(frame / 2)}`) > 0.28 ? 1 : 0.2) : 0;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: (p.x + q.x) / 2,
              top: (p.y + q.y) / 2,
              transform: "translate(-50%, -50%)",
              opacity: vis,
            }}
          >
            <Tag text={g.text} color={C.warn} size={30} />
          </div>
        );
      })}
      {frame >= 58 ? (
        <div
          style={{
            position: "absolute",
            left: 72,
            top: 64,
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontFamily: MONO,
            fontSize: 26,
            letterSpacing: "0.14em",
            color: C.ok,
            opacity: Math.floor(frame / 5) % 2 === 0 ? 1 : 0.35,
          }}
        >
          <span style={{ width: 14, height: 14, borderRadius: 99, background: C.ok, boxShadow: `0 0 16px ${C.ok}` }} />
          STUD · POWER ON
        </div>
      ) : null}
      <AbsoluteFill style={{ background: "#fff", opacity: flash, mixBlendMode: "screen" }} />
      {glitch ? (
        <AbsoluteFill
          style={{
            background: `repeating-linear-gradient(0deg, rgba(82,224,255,0.14) 0 3px, transparent 3px 9px)`,
            opacity: 0.8,
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};
