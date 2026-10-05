import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Cam, lerpCam, project } from "../room/cam";
import { ParallaxRoom } from "../room/ParallaxRoom";
import { C, MONO } from "../theme";
import { clamp, ease, easeInOut } from "../ui/anim";
import { Rover } from "../three/Rover";
import { Tag } from "./shared-a/hud";

const FROM: Cam = { pos: [0.7, 0.3, 6.4], target: [0.6, -0.25, 0], fov: 38 };
const TO: Cam = { pos: [0.9, 0.45, 5.9], target: [0.7, -0.05, 0], fov: 38 };

const FLOOR = -1.05;
const SCALE = 1.2;
const YAW = 0.85; // rover heading, radians around Y (front is +z)
const END: [number, number, number] = [0.9, FLOOR, 1.3];
const HEADING: [number, number, number] = [Math.sin(YAW), 0, Math.cos(YAW)];

// Rover-local point -> world point (rotation around Y, uniform scale).
const toWorld = (pos: [number, number, number], l: [number, number, number]): [number, number, number] => {
  const c = Math.cos(YAW);
  const s = Math.sin(YAW);
  return [pos[0] + (l[0] * c + l[2] * s) * SCALE, pos[1] + l[1] * SCALE, pos[2] + (-l[0] * s + l[2] * c) * SCALE];
};

const WR = 0.13;

export const Meet: React.FC = () => {
  const frame = useCurrentFrame();
  const t = easeInOut(frame, 0, 144);
  const cam = lerpCam(FROM, TO, t);

  // Roll in, decelerating, stop at frame ~52.
  const roll = ease(frame, 0, 52); // 0..1
  const dist = (1 - roll) * 5.0;
  const pos: [number, number, number] = [END[0] - HEADING[0] * dist, END[1], END[2] - HEADING[2] * dist];
  const wheelAngle = -dist * 3.2 - frame * 0.02;
  const mast = easeInOut(frame, 62, 50);
  const spin = frame * 0.5;
  const rolling = frame < 52;
  const leds = rolling ? 0.6 : 0.6 + 0.4 * Math.sin(frame * 0.3);

  const headY = WR + 0.3 + 0.025 + (1.1 * mast * 3) / 4 + 0.4 + 0.05;
  const anchors = {
    lidar: toWorld(pos, [0, WR + 0.35, -0.12]),
    thermal: toWorld(pos, [0, WR + 0.19, 0.36]),
    laser: toWorld(pos, [0.2, WR + 0.19, 0.4]),
    mast: toWorld(pos, [0, headY, 0.1]),
  };
  const callouts = [
    { key: "lidar", text: "LIDAR + LASER", color: C.lidar, at: 78, dx: -300, dy: -150 },
    { key: "mast", text: "VERTICAL MAST · CAMERA", color: C.ok, at: 92, dx: 300, dy: -40 },
    { key: "thermal", text: "THERMAL CAM", color: C.heat, at: 106, dx: -330, dy: 70 },
    { key: "laser", text: "LASER RANGEFINDER", color: C.laser, at: 120, dx: 260, dy: 100 },
  ] as const;

  const shadowOpacity = 0.55;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <ParallaxRoom room="2185" cam={cam} look={{ dim: 0.5, sat: 0.7, tint: [0.9, 0.97, 1.08], disp: 0.5 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 6, 5]} intensity={2.4} />
        <directionalLight position={[-4, 3, -3]} intensity={1.6} color="#52e0ff" />
        <pointLight position={[pos[0] - 1.5, 1.2, pos[2] + 1]} intensity={8} color="#ffe2b8" />
        {/* contact shadow: stacked soft discs under the chassis */}
        {[1, 0.8, 0.6].map((k, i) => (
          <mesh key={i} position={[pos[0], FLOOR + 0.01 + i * 0.001, pos[2]]} rotation={[-Math.PI / 2, 0, YAW]}>
            <circleGeometry args={[0.95 * k * SCALE, 40]} />
            <meshBasicMaterial color="#000" transparent opacity={shadowOpacity * (0.25 + i * 0.12)} depthWrite={false} />
          </mesh>
        ))}
        {/* lidar pulse rings on the floor once parked */}
        {[0, 1, 2].map((i) => {
          const p = ((frame - 56 - i * 14) % 42) / 42;
          if (frame < 56 || p < 0) return null;
          const r = 0.5 + p * 2.6;
          return (
            <mesh key={i} position={[pos[0], FLOOR + 0.02, pos[2]]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[r, r + 0.02 + p * 0.02, 96]} />
              <meshBasicMaterial color={C.lidar} transparent opacity={(1 - p) * 0.55} depthWrite={false} />
            </mesh>
          );
        })}
        <Rover position={pos} rotationY={YAW} scale={SCALE} mast={mast} spin={spin} wheelAngle={wheelAngle} leds={leds} />
      </ParallaxRoom>

      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {callouts.map((c) => {
          const a = project(cam, anchors[c.key]);
          const k = ease(frame, c.at, 10);
          if (k <= 0) return null;
          const lx = a.x + c.dx;
          const ly = a.y + c.dy;
          const mx = a.x + (lx - a.x) * k;
          const my = a.y + (ly - a.y) * k;
          return (
            <g key={c.key} stroke={c.color} fill="none" strokeWidth={2.5}>
              <circle cx={a.x} cy={a.y} r={7 + 3 * Math.sin(frame * 0.3)} fill={c.color} fillOpacity={0.25} />
              <circle cx={a.x} cy={a.y} r={3.5} fill={c.color} stroke="none" />
              <line x1={a.x} y1={a.y} x2={mx} y2={my} />
              <line x1={mx} y1={my} x2={mx + Math.sign(c.dx) * 30 * k} y2={my} />
            </g>
          );
        })}
      </svg>
      {callouts.map((c) => {
        const a = project(cam, anchors[c.key]);
        const k = ease(frame, c.at + 4, 8);
        if (k <= 0) return null;
        const left = a.x + c.dx + Math.sign(c.dx) * 30;
        return (
          <div
            key={c.key}
            style={{
              position: "absolute",
              left,
              top: a.y + c.dy,
              transform: `translate(${c.dx < 0 ? "-100%" : "0"}, -50%)`,
              opacity: k,
            }}
          >
            <Tag text={c.text} color={c.color} size={26} />
          </div>
        );
      })}

      <div
        style={{
          position: "absolute",
          left: 72,
          top: 64,
          fontFamily: MONO,
          fontSize: 26,
          letterSpacing: "0.14em",
          color: C.ink2,
          opacity: interpolate(frame, [10, 24], [0, 1], clamp),
        }}
      >
        STUD · SURVEY ROVER
      </div>
    </AbsoluteFill>
  );
};
