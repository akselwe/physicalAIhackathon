import React from "react";
import { AbsoluteFill } from "remotion";
import { C } from "../../theme";

// Dark UI backdrop: soft cool glow plus a faint blueprint grid.
export const CBackdrop: React.FC<{ readonly glow?: number }> = ({ glow = 0.5 }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(1200px 700px at 70% 30%, rgba(82,224,255,${0.1 * glow + 0.04}) 0%, rgba(0,0,0,0) 60%), radial-gradient(900px 600px at 10% 90%, rgba(45,73,201,0.18) 0%, rgba(0,0,0,0) 60%), ${C.void}`,
    }}
  >
    <AbsoluteFill
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
        maskImage: "radial-gradient(ellipse at center, black 30%, transparent 85%)",
      }}
    />
  </AbsoluteFill>
);

export const panelStyle: React.CSSProperties = {
  background: "linear-gradient(180deg, rgba(26,28,31,0.92), rgba(14,15,18,0.92))",
  border: `1px solid ${C.line}`,
  borderRadius: 22,
  boxShadow: "0 30px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.05)",
};
