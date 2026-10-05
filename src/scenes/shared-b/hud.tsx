import React from "react";
import { interpolate } from "remotion";
import { C, MONO, SANS } from "../../theme";
import { VO_AT } from "../../timing";
import { VO } from "../../vo";
import { clamp, ease } from "../../ui/anim";

export const mono: React.CSSProperties = {
  fontFamily: MONO,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
};

// Local frame (inside a scene that starts at `sceneStart` seconds) when the first word containing `needle` starts.
export const wordFrame = (id: string, needle: string, sceneStart: number) => {
  const w = VO[id].words.find((x) => x.text.toLowerCase().includes(needle.toLowerCase()));
  if (!w) throw new Error(`"${needle}" not found in ${id}`);
  return Math.round((VO_AT[id] - sceneStart + w.start) * 30);
};

export const hexA = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

export const Chip: React.FC<{
  readonly color: string;
  readonly children: React.ReactNode;
  readonly style?: React.CSSProperties;
  readonly size?: number;
}> = ({ color, children, style, size = 22 }) => (
  <div
    style={{
      ...mono,
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      fontSize: size,
      color,
      padding: "8px 16px",
      border: `1.5px solid ${hexA(color, 0.7)}`,
      background: "rgba(7,8,10,0.72)",
      borderRadius: 6,
      backdropFilter: "blur(6px)",
      ...style,
    }}
  >
    {children}
  </div>
);

// Camera-style corner brackets around the frame.
export const Corners: React.FC<{ readonly color?: string; readonly inset?: number }> = ({ color = C.lidar, inset = 44 }) => {
  const s = 54;
  const common: React.CSSProperties = { position: "absolute", width: s, height: s, borderColor: hexA(color, 0.85), borderStyle: "solid" };
  return (
    <>
      <div style={{ ...common, left: inset, top: inset, borderWidth: "3px 0 0 3px" }} />
      <div style={{ ...common, right: inset, top: inset, borderWidth: "3px 3px 0 0" }} />
      <div style={{ ...common, left: inset, bottom: inset + 150, borderWidth: "0 0 3px 3px" }} />
      <div style={{ ...common, right: inset, bottom: inset + 150, borderWidth: "0 3px 3px 0" }} />
    </>
  );
};

// A sensor readout tile that slides in at `start` and counts up to `value`.
export const Tile: React.FC<{
  readonly frame: number;
  readonly start: number;
  readonly label: string;
  readonly value: number;
  readonly decimals?: number;
  readonly unit: string;
  readonly sub: string;
  readonly color: string;
  readonly pulse?: boolean;
  readonly width?: number;
  readonly format?: (v: number) => string;
}> = ({ frame, start, label, value, decimals = 0, unit, sub, color, pulse = false, width = 420, format }) => {
  const a = ease(frame, start, 12);
  const count = ease(frame, start + 2, 26);
  const v = value * count;
  const glow = pulse ? 0.5 + 0.5 * Math.sin(Math.max(0, frame - start) * 0.32) : 0;
  const txt = format ? format(v) : v.toFixed(decimals);
  return (
    <div
      style={{
        width,
        height: 124,
        opacity: a,
        transform: `translateY(${interpolate(a, [0, 1], [-26, 0], clamp)}px)`,
        background: "linear-gradient(180deg, rgba(14,16,20,0.88), rgba(8,9,12,0.88))",
        border: `1.5px solid ${hexA(color, 0.55 + 0.45 * glow)}`,
        borderRadius: 10,
        boxShadow: `0 0 ${24 + 40 * glow}px ${hexA(color, 0.18 + 0.32 * glow)}, inset 0 0 30px ${hexA(color, 0.06)}`,
        padding: "14px 20px",
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ ...mono, fontSize: 18, color }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 4 }}>
        <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 56, color: C.ink, letterSpacing: "-0.02em", lineHeight: 1.05 }}>{txt}</span>
        <span style={{ fontFamily: SANS, fontWeight: 500, fontSize: 24, color: C.ink2 }}>{unit}</span>
      </div>
      <div style={{ ...mono, fontSize: 15, color: pulse ? color : C.ink2, marginTop: 2 }}>{sub}</div>
      <div style={{ position: "absolute", left: 0, bottom: 0, height: 3, width: `${100 * count}%`, background: color, opacity: 0.9 }} />
    </div>
  );
};
