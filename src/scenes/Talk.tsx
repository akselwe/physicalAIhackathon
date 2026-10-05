import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, MONO, SANS } from "../theme";
import { clamp, ease, easeInOut, fadeIn } from "../ui/anim";
import { CBackdrop, panelStyle } from "./shared-c/cBackdrop";

const COMMAND = "Open the kitchen to the living room.";

// ---- geometry (metres) ------------------------------------------------------
const LW = 12.5; // living room
const LH = 8.2;
const WT = 0.22; // wall thickness
const KW = 4.4; // kitchen
const KH = 4.1; // 4.4 x 4.1 = 18 m2

type P = number; // wall-removal progress 0..1

// ---- 2D plan ----------------------------------------------------------------
const Plan: React.FC<{ p: P; hi: number; frame: number }> = ({ p, hi, frame }) => {
  const S = 30;
  const ox = 54;
  const oy = 64;
  const X = (m: number) => ox + m * S;
  const Y = (m: number) => oy + m * S;
  const wallC = "#b9bec8";
  const wallOpacity = 1 - p;
  const dim = (x1: number, y1: number, x2: number, y2: number, label: string, vertical = false) => (
    <g stroke={C.lineStrong} strokeWidth={1.2} fill="none">
      <line x1={x1} y1={y1} x2={x2} y2={y2} />
      <line x1={vertical ? x1 - 5 : x1} y1={vertical ? y1 : y1 - 5} x2={vertical ? x1 + 5 : x1} y2={vertical ? y1 : y1 + 5} />
      <line x1={vertical ? x2 - 5 : x2} y1={vertical ? y2 : y2 - 5} x2={vertical ? x2 + 5 : x2} y2={vertical ? y2 : y2 + 5} />
      <rect
        x={(x1 + x2) / 2 - (vertical ? 28 : 30)}
        y={(y1 + y2) / 2 - 10}
        width={vertical ? 56 : 60}
        height={20}
        rx={5}
        fill={C.surface}
        stroke="none"
      />
      <text
        x={(x1 + x2) / 2}
        y={(y1 + y2) / 2 + 4.5}
        fill={C.ink2}
        stroke="none"
        fontFamily={MONO}
        fontSize={13}
        textAnchor="middle"
      >
        {label}
      </text>
    </g>
  );
  return (
    <svg width={600} height={380} viewBox="0 0 600 380" style={{ display: "block" }}>
      {/* floors */}
      <rect x={X(0)} y={Y(0)} width={LW * S} height={LH * S} fill="rgba(139,170,255,0.06)" />
      <rect x={X(LW + WT)} y={Y(0)} width={KW * S} height={KH * S} fill="rgba(237,216,84,0.06)" />
      {/* removed wall footprint becomes open floor */}
      <rect x={X(LW)} y={Y(0)} width={WT * S} height={KH * S} fill={`rgba(70,230,164,${0.18 * p})`} />
      {/* kitchen counters */}
      <g stroke={C.lineStrong} strokeWidth={1} fill="rgba(255,255,255,0.05)">
        <rect x={X(LW + WT + 0.1)} y={Y(0.1)} width={(KW - 0.2) * S} height={0.6 * S} />
        <rect x={X(LW + WT + 1.1)} y={Y(2.75)} width={2 * S} height={0.8 * S} />
      </g>
      {/* columns */}
      {[
        [3.8, 3.4],
        [8.4, 3.4],
      ].map(([cx, cy], i) => (
        <rect key={i} x={X(cx) - 7} y={Y(cy) - 7} width={14} height={14} fill="#d2d6de" />
      ))}
      {/* living room furniture hint (rows of seats) */}
      <g fill="rgba(255,255,255,0.14)">
        {Array.from({ length: 5 }).flatMap((_, r) =>
          Array.from({ length: 6 }).map((__, c) => (
            <rect key={`${r}-${c}`} x={X(5.2 + c * 0.9)} y={Y(3.9 + r * 0.7)} width={9} height={9} rx={2} />
          )),
        )}
      </g>
      {/* outer walls */}
      <g fill={wallC}>
        <rect x={X(-WT)} y={Y(-WT)} width={(LW + WT) * S} height={WT * S} />
        <rect x={X(-WT)} y={Y(LH)} width={(LW + 2 * WT) * S} height={WT * S} />
        <rect x={X(-WT)} y={Y(0)} width={WT * S} height={LH * S} />
        <rect x={X(LW)} y={Y(KH)} width={(WT + KW + WT) * S} height={WT * S} />
        <rect x={X(LW + WT + KW)} y={Y(-WT)} width={WT * S} height={(KH + 2 * WT) * S} />
        <rect x={X(LW + WT)} y={Y(-WT)} width={(KW + WT) * S} height={WT * S} />
        <rect x={X(LW + WT)} y={Y(LH - 0.0)} width={0} height={0} />
        <rect x={X(LW)} y={Y(KH + WT)} width={WT * S} height={(LH - KH - WT) * S} />
      </g>
      {/* windows on the north wall and kitchen east wall */}
      {[1.6, 4.6, 7.6].map((w) => (
        <rect key={w} x={X(w)} y={Y(-WT) + 1} width={2.2 * S} height={WT * S - 2} fill={C.lidar} opacity={0.9} />
      ))}
      <rect x={X(LW + WT + KW)} y={Y(1.2)} width={WT * S} height={1.6 * S} fill={C.lidar} opacity={0.9} />
      {/* door in the south wall + swing */}
      <rect x={X(10.4)} y={Y(LH)} width={1.0 * S} height={WT * S} fill={C.void} />
      <path d={`M ${X(10.4)} ${Y(LH)} A ${S} ${S} 0 0 0 ${X(11.4)} ${Y(LH) - S}`} stroke={C.lineStrong} strokeWidth={1.2} fill="none" strokeDasharray="3 3" />
      {/* dividing wall (the one that goes) */}
      <g>
        <rect
          x={X(LW)}
          y={Y(0)}
          width={WT * S}
          height={KH * S}
          fill={hi > 0 ? C.warn : wallC}
          opacity={wallOpacity}
          style={{ filter: hi > 0 ? `drop-shadow(0 0 ${8 + 8 * hi}px ${C.warn})` : undefined }}
        />
        <rect
          x={X(LW) - 2}
          y={Y(0) - 2}
          width={WT * S + 4}
          height={KH * S + 4}
          fill="none"
          stroke={C.ok}
          strokeWidth={1.5}
          strokeDasharray="5 4"
          opacity={p}
        />
      </g>
      {/* dimension lines */}
      {dim(X(0), Y(-WT) - 16, X(LW), Y(-WT) - 16, "12.5 m")}
      {dim(X(-WT) - 14, Y(0), X(-WT) - 14, Y(LH), "8.2 m", true)}
      {dim(X(LW + WT), Y(KH) + 22, X(LW + WT + KW), Y(KH) + 22, "4.4 m")}
      {/* room labels */}
      <g fontFamily={SANS} textAnchor="middle">
        <text x={X(LW / 2) - 40} y={Y(1.9)} fill={C.ink} fontSize={19} fontWeight={700} opacity={1 - p}>
          LIVING ROOM
        </text>
        <text x={X(LW / 2) - 40} y={Y(1.9) + 20} fill={C.ink2} fontFamily={MONO} fontSize={14} opacity={1 - p}>
          102 m²
        </text>
        <text x={X(LW + WT + KW / 2)} y={Y(1.55)} fill={C.ink} fontSize={17} fontWeight={700} opacity={1 - p}>
          KITCHEN
        </text>
        <text x={X(LW + WT + KW / 2)} y={Y(1.55) + 18} fill={C.ink2} fontFamily={MONO} fontSize={14} opacity={1 - p}>
          18 m²
        </text>
        <text x={X(LW / 2) - 40} y={Y(1.9)} fill={C.ok} fontSize={19} fontWeight={700} opacity={p}>
          OPEN PLAN
        </text>
        <text x={X(LW / 2) - 40} y={Y(1.9) + 20} fill={C.ok} fontFamily={MONO} fontSize={14} opacity={p}>
          120 m² · +18 m²
        </text>
      </g>
      {/* opening arrow marker */}
      <g opacity={p} stroke={C.ok} strokeWidth={2} fill="none">
        <path d={`M ${X(LW) - 26} ${Y(KH / 2)} L ${X(LW) + 40} ${Y(KH / 2)}`} />
        <path d={`M ${X(LW) + 32} ${Y(KH / 2) - 6} L ${X(LW) + 42} ${Y(KH / 2)} L ${X(LW) + 32} ${Y(KH / 2) + 6}`} />
      </g>
      {/* scan sweep tick on mount */}
      <rect x={0} y={0} width={0} height={0} opacity={frame} />
    </svg>
  );
};

// ---- isometric 3D model -----------------------------------------------------
const Iso: React.FC<{ p: P; hi: number }> = ({ p, hi }) => {
  const s = 21;
  const ox = 198;
  const oy = 120;
  const c30 = Math.cos(Math.PI / 6);
  const pt = (x: number, y: number, z: number): [number, number] => [
    ox + (x - y) * c30 * s,
    oy + (x + y) * 0.5 * s - z * s,
  ];
  const poly = (pts: [number, number][]) => pts.map((q) => q.join(",")).join(" ");
  // an axis-aligned box from (x,y,z) with size (w,d,h)
  const Box: React.FC<{
    x: number;
    y: number;
    z?: number;
    w: number;
    d: number;
    h: number;
    top: string;
    left: string;
    right: string;
    opacity?: number;
    glow?: string;
  }> = ({ x, y, z = 0, w, d, h, top, left, right, opacity = 1, glow }) => (
    <g opacity={opacity} style={glow ? { filter: `drop-shadow(0 0 12px ${glow})` } : undefined}>
      <polygon points={poly([pt(x, y + d, z), pt(x + w, y + d, z), pt(x + w, y + d, z + h), pt(x, y + d, z + h)])} fill={left} />
      <polygon points={poly([pt(x + w, y, z), pt(x + w, y + d, z), pt(x + w, y + d, z + h), pt(x + w, y, z + h)])} fill={right} />
      <polygon points={poly([pt(x, y, z + h), pt(x + w, y, z + h), pt(x + w, y + d, z + h), pt(x, y + d, z + h)])} fill={top} />
    </g>
  );
  const H = 2.5;
  const wallTop = "#cfd4dc";
  const wallL = "#8f95a1";
  const wallR = "#6d737f";
  const wallHeight = H * (1 - p);
  const divOpacity = 1 - p * 0.7;
  return (
    <svg width={520} height={380} viewBox="0 0 520 380" style={{ display: "block" }}>
      {/* floors */}
      <polygon points={poly([pt(0, 0, 0), pt(LW, 0, 0), pt(LW, LH, 0), pt(0, LH, 0)])} fill="#262b36" stroke={C.line} />
      <polygon points={poly([pt(LW + WT, 0, 0), pt(LW + WT + KW, 0, 0), pt(LW + WT + KW, KH, 0), pt(LW + WT, KH, 0)])} fill="#2c2b22" stroke={C.line} />
      <polygon
        points={poly([pt(LW, 0, 0), pt(LW + WT, 0, 0), pt(LW + WT, KH, 0), pt(LW, KH, 0)])}
        fill={`rgba(70,230,164,${0.5 * p})`}
      />
      {/* floor grid */}
      <g stroke="rgba(255,255,255,0.05)">
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={i} x1={pt(i + 1, 0, 0)[0]} y1={pt(i + 1, 0, 0)[1]} x2={pt(i + 1, LH, 0)[0]} y2={pt(i + 1, LH, 0)[1]} />
        ))}
      </g>
      {/* back walls (north: y=0, west: x=0) */}
      <Box x={0} y={-WT} w={LW + WT + KW + WT} d={WT} h={H} top={wallTop} left={wallL} right={wallR} />
      <Box x={-WT} y={0} w={WT} d={LH} h={H} top={wallTop} left={wallL} right={wallR} />
      {/* windows in the north wall */}
      {[1.6, 4.6, 7.6].map((w) => (
        <polygon
          key={w}
          points={poly([pt(w, 0, 0.9), pt(w + 2.2, 0, 0.9), pt(w + 2.2, 0, 2.1), pt(w, 0, 2.1)])}
          fill={C.lidar}
          opacity={0.55}
        />
      ))}
      {/* kitchen counters + island */}
      <Box x={LW + WT + 0.1} y={0.1} w={KW - 0.2} d={0.6} h={0.9} top="#d9dce2" left="#7b808c" right="#5e636e" />
      <Box x={LW + WT + 1.1} y={2.2} w={2} d={0.9} h={0.9} top="#e4e7ec" left="#80858f" right="#626772" />
      {/* columns */}
      {[
        [3.8, 3.4],
        [8.4, 3.4],
      ].map(([cx, cy], i) => (
        <Box key={i} x={cx - 0.25} y={cy - 0.25} w={0.5} d={0.5} h={H} top="#e5e8ee" left="#9096a3" right="#737985" />
      ))}
      {/* the dividing wall: highlights then sinks away */}
      {wallHeight > 0.02 ? (
        <Box
          x={LW}
          y={0}
          w={WT}
          d={KH}
          h={wallHeight}
          top={hi > 0 ? C.warn : wallTop}
          left={hi > 0 ? "#b98a22" : wallL}
          right={hi > 0 ? "#8f6a18" : wallR}
          opacity={divOpacity}
          glow={hi > 0 && p < 1 ? C.warn : undefined}
        />
      ) : null}
      {/* front walls kept low (cutaway) */}
      <Box x={0} y={LH} w={LW} d={WT} h={0.35} top={wallTop} left={wallL} right={wallR} />
      <Box x={LW + WT} y={KH} w={KW + WT} d={WT} h={0.35} top={wallTop} left={wallL} right={wallR} />
      <Box x={LW} y={KH + WT} w={WT} d={LH - KH - WT} h={0.35} top={wallTop} left={wallL} right={wallR} />
      <Box x={LW + WT + KW} y={0} w={WT} d={KH} h={0.35} top={wallTop} left={wallL} right={wallR} />
      {/* new opening glow */}
      <polygon
        points={poly([pt(LW, 0, 0.02), pt(LW + WT, 0, 0.02), pt(LW + WT, KH, 0.02), pt(LW, KH, 0.02)])}
        fill="none"
        stroke={C.ok}
        strokeWidth={2}
        strokeDasharray="6 5"
        opacity={p}
      />
    </svg>
  );
};

// ---- chat panel -------------------------------------------------------------
const Wave: React.FC<{ frame: number; active: number }> = ({ frame, active }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 4, height: 56 }}>
    {Array.from({ length: 34 }).map((_, i) => {
      const amp = 0.25 + 0.75 * Math.abs(Math.sin(i * 1.7 + frame * 0.45) * Math.cos(i * 0.6 - frame * 0.21));
      const h = 4 + active * amp * 50;
      return <div key={i} style={{ width: 5, height: h, borderRadius: 3, background: C.agent, opacity: 0.35 + 0.65 * active }} />;
    })}
  </div>
);

export const Talk: React.FC = () => {
  const frame = useCurrentFrame();
  const sceneIn = fadeIn(frame, 0, 6);
  // wall removal: highlight from 1.9 s, gone by ~3.1 s (wall SFX at 2.4 s)
  const hi = ease(frame, 57, 12);
  const p = easeInOut(frame, 72, 24);
  const speak = interpolate(frame, [3, 9, 66, 75], [0, 1, 1, 0], clamp);
  const typed = Math.floor(interpolate(frame, [18, 66], [0, COMMAND.length], clamp));
  const caret = Math.floor(frame / 8) % 2 === 0 && typed < COMMAND.length + 1;
  const replyIn = ease(frame, 84, 10);
  const flagIn = ease(frame, 48, 10);
  const chipPulse = 0.75 + 0.25 * Math.sin(frame * 0.5);

  return (
    <AbsoluteFill style={{ fontFamily: SANS, color: C.ink, opacity: sceneIn }}>
      <CBackdrop glow={0.6 + p * 0.4} />

      {/* title strip */}
      <div style={{ position: "absolute", left: 80, top: 56, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 14, height: 14, background: C.agent, borderRadius: 3, boxShadow: `0 0 18px ${C.agent}` }} />
        <span style={{ fontFamily: MONO, fontSize: 18, letterSpacing: "0.14em", color: C.ink2 }}>STUD · EDIT BY TALKING</span>
      </div>

      {/* chat panel */}
      <div style={{ ...panelStyle, position: "absolute", left: 80, top: 150, width: 480, height: 640, padding: 28, boxSizing: "border-box" }}>
        <div style={{ fontFamily: MONO, fontSize: 15, letterSpacing: "0.12em", color: C.ink2, marginBottom: 20 }}>VOICE COMMAND</div>
        <div
          style={{
            background: C.sunken,
            border: `1px solid ${C.line}`,
            borderRadius: 16,
            padding: "20px 22px 12px",
            marginBottom: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 6 }}>
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 23,
                background: C.agentDeep,
                boxShadow: `0 0 ${10 + 24 * speak}px ${C.agent}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round">
                <rect x={9} y={3} width={6} height={12} rx={3} fill="#fff" />
                <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
              </svg>
            </div>
            <Wave frame={frame} active={speak} />
          </div>
        </div>

        {/* user bubble with typewriter */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 22, opacity: fadeIn(frame, 16, 6) }}>
          <div
            style={{
              maxWidth: 410,
              background: C.agentDeep,
              borderRadius: "20px 20px 4px 20px",
              padding: "18px 22px",
              fontSize: 28,
              fontWeight: 600,
              lineHeight: 1.25,
              minHeight: 40,
            }}
          >
            {COMMAND.slice(0, typed)}
            <span style={{ opacity: caret ? 1 : 0, color: C.mark }}>▍</span>
          </div>
        </div>

        {/* Stud reply */}
        <div style={{ opacity: replyIn, transform: `translateY(${(1 - replyIn) * 16}px)` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ width: 12, height: 12, background: C.agent, borderRadius: 2 }} />
            <span style={{ fontFamily: MONO, fontSize: 15, letterSpacing: "0.12em", color: C.ink2 }}>STUD</span>
          </div>
          <div
            style={{
              background: C.surface,
              border: `1px solid ${C.line}`,
              borderRadius: "4px 20px 20px 20px",
              padding: "18px 22px",
              fontSize: 25,
              lineHeight: 1.35,
            }}
          >
            <span style={{ color: C.ok, fontWeight: 700 }}>Done.</span> Wall removed ·{" "}
            <span style={{ color: C.warn }}>load-bearing check ⚠</span> verify with structural engineer.
          </div>
        </div>
      </div>

      {/* plan card */}
      <div style={{ ...panelStyle, position: "absolute", left: 600, top: 150, width: 640, height: 640, padding: 20, boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px 0" }}>
          <span style={{ fontFamily: MONO, fontSize: 15, letterSpacing: "0.12em", color: C.ink2 }}>2D PLAN · MEASURED</span>
          <span style={{ fontFamily: MONO, fontSize: 15, color: p > 0.5 ? C.ok : C.ink2 }}>{p > 0.5 ? "REV B · UPDATED" : "REV A"}</span>
        </div>
        <div style={{ marginTop: 6 }}>
          <Plan p={p} hi={hi} frame={frame} />
        </div>
        <div style={{ position: "absolute", left: 24, right: 24, bottom: 24, display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
          <div
            style={{
              opacity: p,
              padding: "12px 20px",
              borderRadius: 14,
              background: "rgba(70,230,164,0.12)",
              border: `1px solid ${C.ok}`,
              color: C.ok,
              fontFamily: MONO,
              fontSize: 21,
              fontWeight: 600,
            }}
          >
            +18 m² open plan · 120 m² total
          </div>
          <div
            style={{
              opacity: flagIn,
              transform: `translateY(${(1 - flagIn) * 14}px)`,
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 20px",
              borderRadius: 14,
              border: `1px solid ${C.warn}`,
              background: "rgba(255,194,71,0.10)",
              boxShadow: `0 0 ${18 * chipPulse}px rgba(255,194,71,0.35)`,
              fontSize: 23,
              fontWeight: 600,
            }}
          >
            <span style={{ color: C.warn, fontSize: 28 }}>⚠</span>
            Possible load-bearing wall
          </div>
        </div>
      </div>

      {/* 3D card */}
      <div style={{ ...panelStyle, position: "absolute", left: 1280, top: 150, width: 560, height: 640, padding: 20, boxSizing: "border-box", overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px 0" }}>
          <span style={{ fontFamily: MONO, fontSize: 15, letterSpacing: "0.12em", color: C.ink2 }}>3D MODEL</span>
          <span style={{ fontFamily: MONO, fontSize: 15, color: p > 0.5 ? C.ok : C.ink2 }}>{p > 0.5 ? "SYNCED" : "LIVE"}</span>
        </div>
        <div style={{ marginTop: 40 }}>
          <Iso p={p} hi={hi} />
        </div>
        <div style={{ position: "absolute", left: 28, bottom: 28, fontFamily: MONO, fontSize: 16, color: C.ink2, lineHeight: 1.5 }}>
          Plan and model edit together.
          <br />
          <span style={{ color: p > 0.5 ? C.ok : C.ink2 }}>Everything stays measured.</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
