import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Cam, lerpCam, projectUV } from "../room/cam";
import { ParallaxRoom, Blob } from "../room/ParallaxRoom";
import { C, MONO } from "../theme";
import { clamp, ease, easeInOut } from "../ui/anim";
import { Chip, Corners, hexA, mono, Tile, wordFrame } from "./shared-b/hud";
import { IsoRoom } from "./shared-b/iso";

const ROOM = "2185" as const;
const DISP = 1.5;
const START: Cam = { pos: [0.25, 0.15, 6.0], target: [0, 0.1, 0], fov: 38 };
const END: Cam = { pos: [0.0, 0.1, 5.4], target: [0.0, 0.1, 0], fov: 38 };
const SCENE_START = 12.2;

const camAt = (f: number) => lerpCam(START, END, easeInOut(f, 0, 192));

// Heat sources and leaks in photo uv.
const BLOBS = (f: number): Blob[] => {
  const k = 1 + 0.12 * Math.sin(f * 0.15);
  return [
    { u: 0.12, v: 0.47, r: 0.085, heat: 0.62 * k }, // glass doors, left
    { u: 0.935, v: 0.55, r: 0.11, heat: 0.66 * k }, // window, right
    { u: 0.72, v: 0.12, r: 0.06, heat: 0.34 },
    { u: 0.6, v: 0.45, r: 0.05, heat: 0.4 }, // screens
  ];
};

const Pin: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly dx: number;
  readonly dy: number;
  readonly t: number;
  readonly color: string;
  readonly title: string;
  readonly value: string;
}> = ({ x, y, dx, dy, t, color, title, value }) => {
  const lx = x + dx;
  const ly = y + dy;
  const w = 300;
  const bx = dx > 0 ? lx : lx - w;
  return (
    <g opacity={t}>
      <circle cx={x} cy={y} r={34 + 14 * (1 - t)} fill="none" stroke={color} strokeWidth={2.5} />
      <circle cx={x} cy={y} r={7} fill={color} />
      <line x1={x} y1={y} x2={lx} y2={ly + 36} stroke={hexA(color, 0.9)} strokeWidth={2} />
      <rect x={bx} y={ly} width={w} height={74} rx={8} fill="rgba(7,8,10,0.86)" stroke={hexA(color, 0.9)} strokeWidth={1.8} />
      <text x={bx + 16} y={ly + 26} fill={color} fontFamily={MONO} fontSize={16} letterSpacing="0.1em">
        {title}
      </text>
      <text x={bx + 16} y={ly + 58} fill={C.ink} fontFamily={MONO} fontSize={30}>
        {value}
      </text>
    </g>
  );
};

export const Sense: React.FC = () => {
  const f = useCurrentFrame();
  const cam = camAt(f);
  const thermal = ease(f, 14, 36);
  const tHeat = wordFrame("v4-sense", "heat", SCENE_START);
  const tMoist = wordFrame("v4-sense", "moisture", SCENE_START);
  const tCo2 = 132; // alert SFX lands at local 4.4 s: the CO₂ warning
  const tRadon = wordFrame("v4-sense", "radon", SCENE_START) - 6;
  const door = projectUV(cam, ROOM, 0.12, 0.47, DISP);
  const win = projectUV(cam, ROOM, 0.935, 0.55, DISP);
  const radonPulse = 0.5 + 0.5 * Math.sin(Math.max(0, f - tRadon) * 0.35);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <ParallaxRoom
        room={ROOM}
        cam={cam}
        look={{ dim: 0.7 - 0.2 * thermal, sat: 1 - 0.7 * thermal, thermal: 0.92 * thermal, blobs: BLOBS(f), disp: DISP }}
      />
      {/* scanning bar while the thermal camera sweeps in */}
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: `${interpolate(f, [8, 52], [-5, 105], clamp)}%`,
            width: 6,
            background: C.heat,
            boxShadow: `0 0 50px 14px ${hexA(C.heat, 0.55)}`,
            opacity: f > 8 && f < 52 ? 0.9 : 0,
          }}
        />
      </AbsoluteFill>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <Pin x={Math.max(130, door.x)} y={door.y} dx={70} dy={90} t={ease(f, tHeat, 10)} color={C.heat} title="Heat loss · glass doors" value="−7.4 °C ΔT" />
        <Pin x={Math.min(1790, win.x)} y={win.y} dx={-20} dy={-270} t={ease(f, tHeat + 14, 10)} color={C.heat} title="Heat loss · window" value="−5.1 °C ΔT" />
      </svg>
      <Corners color={C.heat} />
      <div style={{ position: "absolute", left: 90, bottom: 210, opacity: ease(f, 6, 10) }}>
        <Chip color={C.heat}>
          <span style={{ width: 12, height: 12, borderRadius: 6, background: C.heat }} />
          Thermal camera · 640 × 480
        </Chip>
      </div>
      {/* sensor tiles */}
      <div style={{ position: "absolute", left: 90, right: 90, top: 56, display: "flex", gap: 20 }}>
        <Tile frame={f} start={tHeat} label="Heat loss" value={7.4} decimals={1} unit="°C ΔT" sub="north wall · exterior" color={C.heat} format={(v) => `−${v.toFixed(1)}`} />
        <Tile frame={f} start={tMoist} label="Humidity" value={68} unit="% RH" sub="bathroom wall · high" color={C.lidar} />
        <Tile frame={f} start={tCo2} label="CO₂" value={1140} unit="ppm" sub="poor ventilation" color={C.warn} format={(v) => Math.round(v).toLocaleString("en-US").replace(/,/g, " ")} />
        <Tile frame={f} start={tRadon} label="Radon" value={214} unit="Bq/m³" sub="above 200 · act now" color={C.laser} pulse />
      </div>
      {/* condition layer on the 3D model */}
      <div
        style={{
          position: "absolute",
          right: 90,
          bottom: 190,
          width: 400,
          height: 260,
          opacity: ease(f, tMoist, 14),
          transform: `translateY(${interpolate(ease(f, tMoist, 16), [0, 1], [30, 0], clamp)}px)`,
          borderRadius: 12,
          border: `1.5px solid ${hexA(C.lidar, 0.45)}`,
          background: "rgba(7,9,12,0.82)",
          overflow: "hidden",
        }}
      >
        <div style={{ ...mono, position: "absolute", left: 14, top: 10, fontSize: 14, color: C.ink2 }}>Condition layer · 3D model</div>
        <div style={{ position: "absolute", left: 0, top: 22 }}>
          <IsoRoom
            w={12.48}
            d={8.2}
            width={400}
            boxH={236}
            frame={f}
            boxes={[
              { x: 3.1, y: 2.0, w: 0.5, d: 0.5, h: 2.7 },
              { x: 9.4, y: 2.0, w: 0.5, d: 0.5, h: 2.7 },
              { x: 3.1, y: 5.9, w: 0.5, d: 0.5, h: 2.7 },
              { x: 9.4, y: 5.9, w: 0.5, d: 0.5, h: 2.7 },
            ]}
            markers={[
              { x: 0.6, y: 2.4, color: C.heat, r: 16, a: ease(f, tHeat, 8) },
              { x: 12.0, y: 4.9, color: C.heat, r: 16, a: ease(f, tHeat + 14, 8) },
              { x: 1.2, y: 7.2, color: C.lidar, r: 14, a: ease(f, tMoist, 8) },
              { x: 6.2, y: 4.2, color: C.warn, r: 14, a: ease(f, tCo2, 8) },
              { x: 8.0, y: 1.0, color: C.laser, r: 18 + 6 * radonPulse, a: ease(f, tRadon, 8) },
            ]}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
