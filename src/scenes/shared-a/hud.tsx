import React from "react";
import { C, MONO, SANS } from "../../theme";

// Small mono label with a coloured tick, used for on-screen sensor tags.
export const Tag: React.FC<{
  readonly text: string;
  readonly color?: string;
  readonly size?: number;
  readonly filled?: boolean;
  readonly style?: React.CSSProperties;
}> = ({ text, color = C.lidar, size = 22, filled = false, style }) => (
  <div
    style={{
      fontFamily: MONO,
      fontSize: size,
      letterSpacing: "0.08em",
      color: filled ? "#04080c" : color,
      background: filled ? color : "rgba(6,10,14,0.72)",
      border: `1.5px solid ${color}`,
      borderRadius: 6,
      padding: `${size * 0.28}px ${size * 0.6}px`,
      whiteSpace: "nowrap",
      backdropFilter: "blur(6px)",
      boxShadow: `0 0 24px ${color}33`,
      ...style,
    }}
  >
    {text}
  </div>
);

export const Chip: React.FC<{ readonly text: string; readonly color: string; readonly style?: React.CSSProperties }> = ({
  text,
  color,
  style,
}) => (
  <div
    style={{
      fontFamily: SANS,
      fontWeight: 600,
      fontSize: 30,
      color: C.ink,
      padding: "14px 30px",
      borderRadius: 999,
      border: `1.5px solid ${color}88`,
      background: "rgba(255,255,255,0.05)",
      display: "flex",
      alignItems: "center",
      gap: 14,
      ...style,
    }}
  >
    <span style={{ width: 12, height: 12, borderRadius: 99, background: color, boxShadow: `0 0 14px ${color}` }} />
    {text}
  </div>
);
