import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Cam, lerpCam } from "../room/cam";
import { ParallaxRoom } from "../room/ParallaxRoom";
import { C, MONO, SANS } from "../theme";
import { clamp, ease, enter } from "../ui/anim";
import { Chip } from "./shared-a/hud";

const FROM: Cam = { pos: [0.3, 0.2, 6.2], target: [0, -0.1, 0], fov: 38 };
const TO: Cam = { pos: [-0.1, 0.0, 5.4], target: [-0.05, -0.1, 0], fov: 38 };

const LETTERS = ["S", "T", "U", "D"];
const DOTS = [C.laser, C.lidar, C.heat, C.ok];

export const Close: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cam = lerpCam(FROM, TO, ease(frame, 0, 180, 0, 1));
  const flash = interpolate(frame, [0, 3, 16], [1, 0.8, 0], clamp);
  const wave = interpolate(frame, [0, 40], [0, 1], clamp);
  const fadeOut = interpolate(frame, [168, 180], [1, 0.0], clamp);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <ParallaxRoom room="2185" cam={cam} look={{ dim: 0.22 + 0.5 * flash, sat: 0.35, tint: [0.75, 0.9, 1.15], disp: 0.6 }} />
      <AbsoluteFill
        style={{ background: "radial-gradient(ellipse at 50% 42%, rgba(4,8,14,0.15) 0%, rgba(2,4,8,0.85) 75%)" }}
      />
      {/* shockwave from the boom */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: 140 }}>
        <div
          style={{
            width: 300 + wave * 2400,
            height: 300 + wave * 2400,
            borderRadius: "50%",
            border: `3px solid ${C.lidar}`,
            opacity: (1 - wave) * 0.7,
            position: "absolute",
          }}
        />
      </AbsoluteFill>

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: 150, opacity: fadeOut }}>
        <div style={{ display: "flex", gap: 6 }}>
          {LETTERS.map((l, i) => {
            const s = spring({ frame: frame - 2 - i * 3, fps, config: { damping: 13, stiffness: 140, mass: 0.7 } });
            return (
              <div
                key={l}
                style={{
                  fontFamily: SANS,
                  fontWeight: 800,
                  fontSize: 360,
                  lineHeight: 1,
                  letterSpacing: "-0.04em",
                  color: C.ink,
                  textShadow: `0 0 80px ${C.lidar}55, 0 6px 40px rgba(0,0,0,0.8)`,
                  transform: `scale(${0.6 + 0.4 * s}) translateY(${(1 - s) * 60}px)`,
                  opacity: Math.min(1, s * 1.5),
                }}
              >
                {l}
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 22, marginTop: 6, marginBottom: 26 }}>
          {DOTS.map((c, i) => (
            <span
              key={c}
              style={{
                width: 20,
                height: 20,
                borderRadius: 99,
                background: c,
                boxShadow: `0 0 22px ${c}`,
                opacity: ease(frame, 14 + i * 4, 6),
              }}
            />
          ))}
        </div>
        <div
          style={{
            fontFamily: SANS,
            fontWeight: 600,
            fontSize: 54,
            color: C.ink,
            letterSpacing: "-0.01em",
            textAlign: "center",
            ...enter(frame, 20),
          }}
        >
          Know your house <span style={{ color: C.ok }}>before the contractor does.</span>
        </div>
        <div style={{ display: "flex", gap: 22, marginTop: 44 }}>
          {[
            { t: "Homeowners", c: C.lidar },
            { t: "Buyers & sellers", c: C.heat },
            { t: "Property managers", c: C.ok },
          ].map((x, i) => (
            <div key={x.t} style={enter(frame, 70 + i * 8, 14)}>
              <Chip text={x.t} color={x.c} />
            </div>
          ))}
        </div>
        <div
          style={{
            marginTop: 34,
            fontFamily: MONO,
            fontSize: 24,
            letterSpacing: "0.16em",
            color: C.ink2,
            ...enter(frame, 100, 10),
          }}
        >
          BUILT FOR TEK17 · RADON-AWARE
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#fff", opacity: flash * 0.85, mixBlendMode: "screen" }} />
      <AbsoluteFill style={{ background: "#000", opacity: 1 - fadeOut }} />
    </AbsoluteFill>
  );
};
