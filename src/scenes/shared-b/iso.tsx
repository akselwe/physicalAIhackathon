import React from "react";
import { C, MONO } from "../../theme";
import { hexA } from "./hud";

export type IsoMarker = { x: number; y: number; z?: number; color: string; r?: number; a?: number; label?: string };
export type IsoBox = { x: number; y: number; w: number; d: number; h: number };

const COS = Math.cos(Math.PI / 6);
const SIN = 0.5;

// A small isometric model of the room: floor, the two back walls, pillars and optional condition markers.
export const IsoRoom: React.FC<{
  readonly w: number; // metres along x
  readonly d: number; // metres along y
  readonly height?: number;
  readonly boxes?: IsoBox[];
  readonly markers?: IsoMarker[];
  readonly width: number; // px box
  readonly boxH: number;
  readonly progress?: number; // 0..1 build-up
  readonly accent?: string;
  readonly frame?: number;
}> = ({ w, d, height = 2.7, boxes = [], markers = [], width, boxH, progress = 1, accent = C.lidar, frame = 0 }) => {
  const s = Math.min((width - 20) / ((w + d) * COS), (boxH - 20) / ((w + d) * SIN + height));
  const minX = -d * COS * s;
  const maxX = w * COS * s;
  const maxY = (w + d) * SIN * s;
  const ox = (width - (maxX - minX)) / 2 - minX;
  const oy = (boxH - (maxY + height * s)) / 2 + height * s;
  const P = (x: number, y: number, z = 0) => `${ox + (x - y) * COS * s},${oy + (x + y) * SIN * s - z * s}`;
  const pt = (x: number, y: number, z = 0) => ({ x: ox + (x - y) * COS * s, y: oy + (x + y) * SIN * s - z * s });
  const hh = height * progress;
  const wallFill = hexA(accent, 0.07);
  const edge = hexA(accent, 0.9);
  const grid: React.ReactNode[] = [];
  for (let i = 1; i < Math.floor(w); i++) grid.push(<polyline key={`gx${i}`} points={`${P(i, 0)} ${P(i, d)}`} stroke={hexA(accent, 0.14)} strokeWidth={1} fill="none" />);
  for (let j = 1; j < Math.floor(d); j++) grid.push(<polyline key={`gy${j}`} points={`${P(0, j)} ${P(w, j)}`} stroke={hexA(accent, 0.14)} strokeWidth={1} fill="none" />);
  return (
    <svg width={width} height={boxH} viewBox={`0 0 ${width} ${boxH}`} style={{ overflow: "visible" }}>
      <polygon points={`${P(0, 0)} ${P(w, 0)} ${P(w, d)} ${P(0, d)}`} fill={hexA(accent, 0.09)} stroke={edge} strokeWidth={2} />
      {grid}
      <polygon points={`${P(0, 0)} ${P(w, 0)} ${P(w, 0, hh)} ${P(0, 0, hh)}`} fill={wallFill} stroke={hexA(accent, 0.5)} strokeWidth={1.5} />
      <polygon points={`${P(0, 0)} ${P(0, d)} ${P(0, d, hh)} ${P(0, 0, hh)}`} fill={wallFill} stroke={hexA(accent, 0.5)} strokeWidth={1.5} />
      {boxes.map((b, i) => {
        const bh = b.h * progress;
        return (
          <g key={i}>
            <polygon points={`${P(b.x + b.w, b.y)} ${P(b.x + b.w, b.y + b.d)} ${P(b.x + b.w, b.y + b.d, bh)} ${P(b.x + b.w, b.y, bh)}`} fill={hexA(accent, 0.22)} stroke={edge} strokeWidth={1.2} />
            <polygon points={`${P(b.x, b.y + b.d)} ${P(b.x + b.w, b.y + b.d)} ${P(b.x + b.w, b.y + b.d, bh)} ${P(b.x, b.y + b.d, bh)}`} fill={hexA(accent, 0.12)} stroke={edge} strokeWidth={1.2} />
            <polygon points={`${P(b.x, b.y, bh)} ${P(b.x + b.w, b.y, bh)} ${P(b.x + b.w, b.y + b.d, bh)} ${P(b.x, b.y + b.d, bh)}`} fill={hexA(accent, 0.34)} stroke={edge} strokeWidth={1.2} />
          </g>
        );
      })}
      {markers.map((m, i) => {
        const p = pt(m.x, m.y, 0);
        const top = pt(m.x, m.y, m.z ?? 0);
        const pulse = 0.5 + 0.5 * Math.sin(frame * 0.2 + i);
        const r = (m.r ?? 26) * (0.9 + 0.2 * pulse);
        return (
          <g key={i} opacity={m.a ?? 1}>
            <ellipse cx={p.x} cy={p.y} rx={r * 1.5} ry={r * 0.75} fill={hexA(m.color, 0.22)} stroke={m.color} strokeWidth={2} />
            <ellipse cx={p.x} cy={p.y} rx={r * 0.7} ry={r * 0.35} fill={hexA(m.color, 0.7)} />
            {m.z ? <line x1={p.x} y1={p.y} x2={top.x} y2={top.y} stroke={m.color} strokeWidth={2} /> : null}
            {m.label ? (
              <text x={top.x + 10} y={top.y - 10} fill={m.color} fontFamily={MONO} fontSize={16} letterSpacing="0.1em">
                {m.label}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
};
