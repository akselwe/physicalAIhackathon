import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Cam, lerpCam, metersAt, projectUV } from "../room/cam";
import { ParallaxRoom } from "../room/ParallaxRoom";
import { C, MONO, SANS } from "../theme";
import { clamp, ease, easeInOut } from "../ui/anim";
import { Chip, Corners, hexA, mono } from "./shared-b/hud";
import { IsoRoom } from "./shared-b/iso";

const ROOM = "2186" as const;
const DISP = 1.5;
const START: Cam = { pos: [-0.1, 0.05, 6.0], target: [0, 0.1, 0], fov: 38 };
const END: Cam = { pos: [0.25, 0.0, 4.9], target: [0.1, 0.1, 0], fov: 38 };

// Laser hits: photo uv, frame it fires, label side.
const HITS = [
  { u: 0.17, v: 0.4, at: 12, side: 1 },
  { u: 0.42, v: 0.4, at: 26, side: 1 },
  { u: 0.74, v: 0.42, at: 38, side: -1 },
  { u: 0.62, v: 0.37, at: 48, side: -1 },
  { u: 0.8, v: 0.17, at: 58, side: -1 },
] as const;

const PLAN_AT = 72; // frame where the 2D plan takes over
const W_M = 12.48;
const D_M = 8.2;
const PILLARS = [
  { x: 3.1, y: 2.0 },
  { x: 9.4, y: 2.0 },
  { x: 3.1, y: 5.9 },
  { x: 9.4, y: 5.9 },
];

const camAt = (f: number) => lerpCam(START, END, easeInOut(f, 0, 110));

const Pov: React.FC<{ readonly f: number }> = ({ f }) => {
  const cam = camAt(f);
  const scan = interpolate(f, [0, 62], [0, 1], clamp);
  const origin = { x: 960, y: 1130 };
  return (
    <AbsoluteFill>
      <ParallaxRoom
        room={ROOM}
        cam={cam}
        look={{ dim: 0.85, sat: 0.8, tint: [0.85, 0.95, 1.05], scan: scan >= 1 ? -1 : scan, scanColor: "#2aa6cc", mesh: 0.32 * (1 - ease(f, 56, 14)) + 0.08, disp: DISP }}
      />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <filter id="mglow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {HITS.map((h, i) => {
          const p = projectUV(cam, ROOM, h.u, h.v, DISP);
          const t = ease(f, h.at, 7);
          const lab = ease(f, h.at + 4, 10);
          const m = metersAt(ROOM, h.u, h.v);
          const shown = (m * (0.4 + 0.6 * ease(f, h.at + 4, 12))).toFixed(3);
          const lx = p.x + h.side * 40;
          const ly = p.y - 62;
          const boxW = 210;
          const bx = h.side > 0 ? lx : lx - boxW;
          return (
            <g key={i}>
              <line x1={origin.x} y1={origin.y} x2={origin.x + (p.x - origin.x) * t} y2={origin.y + (p.y - origin.y) * t} stroke={hexA(C.laser, 0.9)} strokeWidth={2.5} filter="url(#mglow)" />
              <circle cx={p.x} cy={p.y} r={7 + 26 * (1 - lab)} fill="none" stroke={C.laser} strokeWidth={2} opacity={t * (1 - 0.4 * lab)} />
              <circle cx={p.x} cy={p.y} r={6} fill="#fff" opacity={t} filter="url(#mglow)" />
              <circle cx={p.x} cy={p.y} r={10} fill={hexA(C.laser, 0.55)} opacity={t} />
              <g opacity={lab}>
                <line x1={p.x} y1={p.y} x2={lx} y2={ly + 22} stroke={hexA(C.laser, 0.8)} strokeWidth={1.5} />
                <rect x={bx} y={ly} width={boxW} height={44} rx={6} fill="rgba(7,8,10,0.82)" stroke={hexA(C.laser, 0.85)} strokeWidth={1.5} />
                <text x={bx + boxW / 2} y={ly + 31} textAnchor="middle" fill={C.ink} fontFamily={MONO} fontSize={26}>
                  {shown} m
                </text>
              </g>
            </g>
          );
        })}
      </svg>
      <Corners />
      <div style={{ position: "absolute", left: 90, top: 78, opacity: ease(f, 0, 8) }}>
        <Chip color={C.lidar}>
          <span style={{ width: 12, height: 12, borderRadius: 6, background: C.lidar }} />
          Stud · LiDAR + laser
        </Chip>
      </div>
      <div style={{ position: "absolute", right: 90, top: 78, opacity: ease(f, 4, 8), textAlign: "right" }}>
        <div style={{ ...mono, fontSize: 18, color: C.ink2 }}>Points captured</div>
        <div style={{ fontFamily: MONO, fontSize: 40, color: C.ink }}>{Math.round(2481902 * ease(f, 0, 70)).toLocaleString("en-US").replace(/,/g, " ")}</div>
      </div>
    </AbsoluteFill>
  );
};

// Dimension line with end ticks along an axis, drawn in with `t`.
const Dim: React.FC<{
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
  readonly t: number;
  readonly label: string;
  readonly vertical?: boolean;
}> = ({ x1, y1, x2, y2, t, label, vertical }) => {
  const ex = x1 + (x2 - x1) * t;
  const ey = y1 + (y2 - y1) * t;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const tick = 14;
  return (
    <g opacity={t > 0 ? 1 : 0}>
      <line x1={x1} y1={y1} x2={ex} y2={ey} stroke={C.laser} strokeWidth={2.5} />
      {vertical ? (
        <>
          <line x1={x1 - tick} y1={y1} x2={x1 + tick} y2={y1} stroke={C.laser} strokeWidth={2.5} />
          <line x1={x2 - tick} y1={y2} x2={x2 + tick} y2={y2} stroke={C.laser} strokeWidth={2.5} opacity={t >= 1 ? 1 : 0} />
        </>
      ) : (
        <>
          <line x1={x1} y1={y1 - tick} x2={x1} y2={y1 + tick} stroke={C.laser} strokeWidth={2.5} />
          <line x1={x2} y1={y2 - tick} x2={x2} y2={y2 + tick} stroke={C.laser} strokeWidth={2.5} opacity={t >= 1 ? 1 : 0} />
        </>
      )}
      <g opacity={ease(t, 0.6, 0.4)}>
        <rect x={mx - 82} y={my - 20} width={164} height={40} rx={6} fill={C.ground} stroke={hexA(C.laser, 0.9)} strokeWidth={1.5} />
        <text x={mx} y={my + 9} textAnchor="middle" fill={C.ink} fontFamily={MONO} fontSize={24}>
          {label}
        </text>
      </g>
    </g>
  );
};

const Plan: React.FC<{ readonly f: number }> = ({ f }) => {
  const S = 70; // px per metre
  const X0 = 150;
  const Y0 = 250;
  const px = (m: number) => X0 + m * S;
  const py = (m: number) => Y0 + m * S;
  const g = f - PLAN_AT;
  const wall = ease(g, 2, 26);
  const outline = `M ${px(0)} ${py(0)} H ${px(W_M)} V ${py(D_M)} H ${px(0)} Z`;
  const rows: React.ReactNode[] = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 8; c++) {
      rows.push(<rect key={`${r}-${c}`} x={px(4.6 + c * 0.55)} y={py(1.1 + r * 0.7)} width={S * 0.38} height={S * 0.38} rx={3} fill="none" stroke={hexA(C.ink2, 0.45)} strokeWidth={1.5} />);
    }
  }
  const furnitureA = ease(g, 22, 16);
  const path = "M 150 800 L 480 770 L 470 540 L 700 520 L 690 330";
  const roverT = ease(g, 14, 40);
  return (
    <AbsoluteFill style={{ opacity: ease(g, 0, 12) }}>
      <AbsoluteFill style={{ background: `radial-gradient(1200px 700px at 38% 55%, #14181d, ${C.void})` }} />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {/* drafting grid */}
        {Array.from({ length: 14 }, (_, i) => (
          <line key={`v${i}`} x1={px(i)} y1={py(0)} x2={px(i)} y2={py(D_M)} stroke={hexA(C.lidar, 0.07)} strokeWidth={1} />
        ))}
        {Array.from({ length: 9 }, (_, i) => (
          <line key={`h${i}`} x1={px(0)} y1={py(i)} x2={px(W_M)} y2={py(i)} stroke={hexA(C.lidar, 0.07)} strokeWidth={1} />
        ))}
        <rect x={px(0)} y={py(0)} width={W_M * S} height={D_M * S} fill={hexA(C.lidar, 0.045 * ease(g, 14, 20))} />
        <g opacity={furnitureA}>
          {rows}
          <rect x={px(0.7)} y={py(4.8)} width={S * 1.9} height={S * 0.8} rx={3} fill="none" stroke={hexA(C.ink2, 0.45)} strokeWidth={1.5} />
          <rect x={px(0.7)} y={py(6.2)} width={S * 1.9} height={S * 0.8} rx={3} fill="none" stroke={hexA(C.ink2, 0.45)} strokeWidth={1.5} />
        </g>
        {/* walls drawn in */}
        <path d={outline} fill="none" stroke={C.ink} strokeWidth={9} strokeLinejoin="miter" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - wall} />
        <path d={outline} fill="none" stroke={C.lidar} strokeWidth={2} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - wall} opacity={0.9} />
        {/* door openings (left wall) and windows (top wall) */}
        <g opacity={ease(g, 16, 10)}>
          <rect x={px(0) - 6} y={py(1.3)} width={12} height={S * 1.0} fill={C.void} />
          <path d={`M ${px(0)} ${py(1.3)} A ${S} ${S} 0 0 1 ${px(1)} ${py(2.3)}`} fill="none" stroke={C.lidar} strokeWidth={2} strokeDasharray="6 6" />
          <rect x={px(0) - 6} y={py(3.1)} width={12} height={S * 1.0} fill={C.void} />
          <path d={`M ${px(0)} ${py(3.1)} A ${S} ${S} 0 0 1 ${px(1)} ${py(4.1)}`} fill="none" stroke={C.lidar} strokeWidth={2} strokeDasharray="6 6" />
          <rect x={px(1.2)} y={py(0) - 6} width={S * 2.0} height={12} fill={C.void} />
          <line x1={px(1.2)} y1={py(0) - 2} x2={px(3.2)} y2={py(0) - 2} stroke={C.lidar} strokeWidth={2} />
          <line x1={px(1.2)} y1={py(0) + 2} x2={px(3.2)} y2={py(0) + 2} stroke={C.lidar} strokeWidth={2} />
          <rect x={px(W_M) - 6} y={py(3.4)} width={12} height={S * 3} fill={C.void} />
          <line x1={px(W_M) - 2} y1={py(3.4)} x2={px(W_M) - 2} y2={py(6.4)} stroke={C.lidar} strokeWidth={2} />
          <line x1={px(W_M) + 2} y1={py(3.4)} x2={px(W_M) + 2} y2={py(6.4)} stroke={C.lidar} strokeWidth={2} />
        </g>
        {PILLARS.map((p, i) => {
          const a = ease(g, 18 + i * 3, 8);
          return <rect key={i} x={px(p.x)} y={py(p.y)} width={S * 0.5} height={S * 0.5} fill={C.ink} opacity={a} />;
        })}
        {/* rover track */}
        <path d={path} fill="none" stroke={hexA(C.lidar, 0.9)} strokeWidth={3} strokeDasharray="3 10" strokeLinecap="round" opacity={ease(g, 12, 10)} />
        <g opacity={ease(g, 14, 8)} transform={`translate(${interpolate(roverT, [0, 0.3, 0.45, 0.7, 1], [150, 480, 470, 700, 690], clamp)} ${interpolate(roverT, [0, 0.3, 0.45, 0.7, 1], [800, 770, 540, 520, 330], clamp)})`}>
          <circle r={30} fill={hexA(C.lidar, 0.18)} stroke={C.lidar} strokeWidth={2} />
          <rect x={-10} y={-8} width={20} height={16} rx={4} fill={C.ink} />
          <circle cx={7} cy={0} r={3} fill={C.laser} />
        </g>
        <Dim x1={px(0)} y1={py(0) - 46} x2={px(W_M)} y2={py(0) - 46} t={ease(g, 3, 16)} label={`${W_M.toFixed(2)} m`} />
        <Dim x1={px(W_M) + 52} y1={py(0)} x2={px(W_M) + 52} y2={py(D_M)} t={ease(g, 30, 16)} label={`${D_M.toFixed(2)} m`} vertical />
      </svg>
      <div style={{ position: "absolute", left: 150, top: 82, opacity: ease(g, 4, 10) }}>
        <div style={{ ...mono, fontSize: 18, color: C.ink2 }}>Measured floor plan</div>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 52, color: C.ink, letterSpacing: "-0.02em" }}>
          {W_M.toFixed(2)} × {D_M.toFixed(2)} m <span style={{ color: C.ink2, fontWeight: 500 }}>· {(W_M * D_M).toFixed(1)} m²</span>
        </div>
      </div>
      {/* right column: 3D model preview + accuracy chips */}
      <div
        style={{
          position: "absolute",
          left: 1230,
          top: 150,
          width: 600,
          height: 470,
          borderRadius: 14,
          border: `1.5px solid ${hexA(C.lidar, 0.5)}`,
          background: "rgba(8,10,13,0.85)",
          opacity: ease(g, 14, 12),
          transform: `translateX(${interpolate(ease(g, 14, 16), [0, 1], [60, 0], clamp)}px)`,
          boxShadow: `0 0 50px ${hexA(C.lidar, 0.12)}`,
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", left: 22, top: 18 }}>
          <Chip color={C.lidar} size={17}>
            3D model · auto-built
          </Chip>
        </div>
        <div style={{ position: "absolute", left: 10, top: 56 }}>
          <IsoRoom
            w={W_M}
            d={D_M}
            width={580}
            boxH={400}
            progress={ease(g, 20, 34)}
            boxes={PILLARS.map((p) => ({ x: p.x, y: p.y, w: 0.5, d: 0.5, h: 2.7 }))}
          />
        </div>
      </div>
      <div style={{ position: "absolute", left: 1230, top: 660, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ opacity: ease(g, 34, 10), transform: `translateY(${interpolate(ease(g, 34, 12), [0, 1], [20, 0], clamp)}px)` }}>
          <Chip color={C.laser} size={26}>
            <span style={{ width: 12, height: 12, borderRadius: 6, background: C.laser }} />
            Laser-verified
          </Chip>
        </div>
        <div style={{ opacity: ease(g, 42, 10), transform: `translateY(${interpolate(ease(g, 42, 12), [0, 1], [20, 0], clamp)}px)` }}>
          <Chip color={C.ok} size={26}>
            Accuracy ± 1 mm
          </Chip>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Measure: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Pov f={f} />
      {f >= PLAN_AT ? <Plan f={f} /> : null}
    </AbsoluteFill>
  );
};
