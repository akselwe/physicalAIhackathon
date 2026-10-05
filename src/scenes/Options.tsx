import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, MONO, SANS } from "../theme";
import { clamp, ease, easeInOut, fadeIn } from "../ui/anim";
import { CBackdrop, panelStyle } from "./shared-c/cBackdrop";

type Tier = {
  key: string;
  label: string;
  n: string;
  photo: string;
  pos: string;
  scope: string[];
  cost: number;
  costFmt: (v: number) => string;
  materials: string;
  tek: { ok: boolean; text: string };
  accent: string;
  after: string; // CSS filter for the "after" look
  inAt: number; // frame the card enters
  sweepAt: number;
};

const nok = (v: number) => `NOK ${Math.round(v).toLocaleString("en-US").replace(/,/g, " ")}`;

const TIERS: Tier[] = [
  {
    key: "light",
    label: "LIGHT REFRESH",
    n: "01",
    photo: "room/photo-2185.jpg",
    pos: "50% 62%",
    scope: ["Seal the north wall", "Add ventilation", "Radon vent + sensor"],
    cost: 48000,
    costFmt: nok,
    materials: "Sealant · vapour barrier · vent fan",
    tek: { ok: true, text: "TEK17 ✓" },
    accent: C.lidar,
    after: "brightness(1.28) saturate(1.18) sepia(0.22) contrast(1.04)",
    inAt: 12,
    sweepAt: 40,
  },
  {
    key: "mid",
    label: "MID-RANGE",
    n: "02",
    photo: "room/photo-2186.jpg",
    pos: "50% 55%",
    scope: ["Insulate the north wall", "New windows", "Balanced ventilation"],
    cost: 310000,
    costFmt: nok,
    materials: "Mineral wool 100 mm · triple glazing · HRV",
    tek: { ok: true, text: "TEK17 ✓" },
    accent: C.ok,
    after: "brightness(1.35) saturate(1.22) sepia(0.28) contrast(1.06)",
    inAt: 20,
    sweepAt: 56,
  },
  {
    key: "full",
    label: "FULL REMODEL",
    n: "03",
    photo: "room/photo-2185.jpg",
    pos: "35% 70%",
    scope: ["Open plan, new layout", "New floor and HVAC", "Wet room upgrade"],
    cost: 1200000,
    costFmt: (v) => `NOK\u00a0${(v / 1_000_000).toFixed(1)}M`,
    materials: "Oak floor · steel beam · heat pump",
    tek: { ok: false, text: "⚠ TEK17 check" },
    accent: C.warn,
    after: "brightness(1.4) saturate(1.3) sepia(0.34) contrast(1.08) hue-rotate(-6deg)",
    inAt: 28,
    sweepAt: 72,
  },
];

const Overlay: React.FC<{ tier: Tier; show: number }> = ({ tier, show }) => {
  if (tier.key === "light")
    return (
      <>
        <div style={{ position: "absolute", left: "58%", top: "10%", opacity: show, display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 10, background: "rgba(0,0,0,0.6)", border: `1px solid ${C.lidar}`, fontFamily: MONO, fontSize: 15, color: C.lidar }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={C.lidar} strokeWidth={2}>
            <circle cx={12} cy={12} r={3} />
            <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
          </svg>
          VENT
        </div>
      </>
    );
  if (tier.key === "mid")
    return (
      <div
        style={{
          position: "absolute",
          left: "4%",
          top: "6%",
          width: "34%",
          height: "78%",
          opacity: show * 0.9,
          backgroundImage: `repeating-linear-gradient(45deg, rgba(70,230,164,0.35) 0 6px, transparent 6px 14px)`,
          border: `2px dashed ${C.ok}`,
          borderRadius: 6,
          mixBlendMode: "screen",
        }}
      >
        <span style={{ position: "absolute", left: 8, top: 8, fontFamily: MONO, fontSize: 14, color: C.ok, background: "rgba(0,0,0,0.65)", padding: "3px 8px", borderRadius: 6 }}>+100 mm</span>
      </div>
    );
  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: "auto 0 0 0",
          height: "42%",
          opacity: show * 0.8,
          background: "linear-gradient(180deg, rgba(190,130,70,0) 0%, rgba(190,130,70,0.75) 100%)",
          mixBlendMode: "multiply",
        }}
      />
      <div style={{ position: "absolute", left: "44%", top: "8%", width: 4, height: "70%", opacity: show, background: C.warn, boxShadow: `0 0 14px ${C.warn}` }} />
    </>
  );
};

const Thumb: React.FC<{ tier: Tier; frame: number }> = ({ tier, frame }) => {
  // the divider: reveals "after" left of the line; sweeps right, then settles in the middle
  const t = frame - tier.sweepAt;
  const d = interpolate(t, [0, 26, 48], [0.04, 0.96, 0.52], { ...clamp, easing: (x) => x * x * (3 - 2 * x) });
  const show = ease(frame, tier.sweepAt + 6, 12);
  const imgStyle: React.CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: tier.pos };
  return (
    <div style={{ position: "relative", height: 250, borderRadius: 14, overflow: "hidden", border: `1px solid ${C.line}`, background: "#000" }}>
      <Img src={staticFile(tier.photo)} style={{ ...imgStyle, filter: "brightness(0.8) saturate(0.85)" }} />
      <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 ${(1 - d) * 100}% 0 0)` }}>
        <Img src={staticFile(tier.photo)} style={{ ...imgStyle, filter: tier.after }} />
        <Overlay tier={tier} show={show} />
      </div>
      <div style={{ position: "absolute", top: 0, bottom: 0, left: `${d * 100}%`, width: 3, background: "#fff", boxShadow: "0 0 18px rgba(255,255,255,0.9)" }} />
      <div style={{ position: "absolute", left: 10, top: 10, fontFamily: MONO, fontSize: 13, letterSpacing: "0.1em", padding: "4px 9px", borderRadius: 6, background: "rgba(0,0,0,0.7)", color: C.ok, opacity: d > 0.2 ? 1 : 0 }}>AFTER</div>
      <div style={{ position: "absolute", right: 10, top: 10, fontFamily: MONO, fontSize: 13, letterSpacing: "0.1em", padding: "4px 9px", borderRadius: 6, background: "rgba(0,0,0,0.7)", color: C.ink2, opacity: d < 0.8 ? 1 : 0 }}>BEFORE</div>
    </div>
  );
};

const Card: React.FC<{ tier: Tier; frame: number; pulse: number }> = ({ tier, frame, pulse }) => {
  const e = ease(frame, tier.inAt, 14);
  const cost = tier.cost * ease(frame, tier.inAt + 6, 30);
  return (
    <div
      style={{
        ...panelStyle,
        width: 560,
        height: 650,
        boxSizing: "border-box",
        padding: 26,
        opacity: e,
        transform: `translateY(${(1 - e) * 40}px)`,
        borderColor: tier.key === "mid" ? "rgba(70,230,164,0.5)" : C.line,
        boxShadow: `${panelStyle.boxShadow}, 0 0 ${pulse * 40}px ${tier.accent}33`,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: tier.accent, boxShadow: `0 0 12px ${tier.accent}` }} />
          <span style={{ fontSize: 26, fontWeight: 800, letterSpacing: "0.04em" }}>{tier.label}</span>
        </div>
        <span style={{ fontFamily: MONO, fontSize: 18, color: C.lineStrong }}>{tier.n}</span>
      </div>
      <Thumb tier={tier} frame={frame} />
      <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 8 }}>
        {tier.scope.map((l, i) => (
          <div key={l} style={{ display: "flex", gap: 12, alignItems: "center", fontSize: 24, fontWeight: 500, opacity: fadeIn(frame, tier.inAt + 10 + i * 4, 8) }}>
            <span style={{ color: tier.accent }}>●</span>
            {l}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 14, fontFamily: MONO, fontSize: 16, color: C.ink2, lineHeight: 1.4 }}>{tier.materials}</div>
      <div style={{ flex: 1 }} />
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontFamily: MONO, fontSize: 14, letterSpacing: "0.12em", color: C.ink2, marginBottom: 2 }}>ROUGH ESTIMATE</div>
          <div style={{ fontSize: 46, fontWeight: 800, letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>{tier.costFmt(cost)}</div>
        </div>
        <div
          style={{
            padding: "10px 16px",
            borderRadius: 12,
            fontSize: 18,
            fontWeight: 700,
            color: tier.tek.ok ? C.ok : C.warn,
            background: tier.tek.ok ? "rgba(70,230,164,0.12)" : "rgba(255,194,71,0.12)",
            border: `1px solid ${tier.tek.ok ? C.ok : C.warn}`,
            opacity: ease(frame, tier.inAt + 30, 10),
          }}
        >
          {tier.tek.text}
        </div>
      </div>
    </div>
  );
};

export const Options: React.FC = () => {
  const frame = useCurrentFrame();
  const total = 213;
  // tension: last ~1.2 s
  const tense = easeInOut(frame, total - 36, 34);
  const sweep = interpolate(frame, [total - 30, total - 2], [-0.3, 1.3], clamp);
  const head = ease(frame, 2, 12);

  return (
    <AbsoluteFill style={{ fontFamily: SANS, color: C.ink, opacity: fadeIn(frame, 0, 5) }}>
      <CBackdrop glow={0.6 + tense} />

      <div
        style={{
          position: "absolute",
          left: 80,
          right: 80,
          top: 46,
          display: "flex",
          alignItems: "center",
          gap: 22,
          opacity: head * (1 - tense * 0.9),
          transform: `translateY(${(1 - head) * -12}px)`,
        }}
      >
        <span style={{ fontSize: 34, fontWeight: 700 }}>Based on what's actually wrong</span>
        {[
          ["HEAT LOSS", C.heat],
          ["HUMIDITY", C.lidar],
          ["RADON", C.danger],
        ].map(([t, c]) => (
          <span key={t} style={{ fontFamily: MONO, fontSize: 18, letterSpacing: "0.1em", color: c, border: `1px solid ${c}`, padding: "7px 14px", borderRadius: 10, background: `${c}18` }}>
            {t}
          </span>
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          left: 80,
          top: 130,
          display: "flex",
          gap: 40,
          transform: `scale(${1 + tense * 0.07})`,
          transformOrigin: "50% 50%",
          opacity: 1 - tense * 0.85,
          filter: `blur(${tense * 16}px)`,
        }}
      >
        {TIERS.map((t) => (
          <Card key={t.key} tier={t} frame={frame} pulse={Math.max(0, 1 - Math.abs(frame - (t.key === "light" ? 45 : t.key === "mid" ? 66 : 87)) / 12)} />
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 806,
          transform: "translateX(-50%)",
          whiteSpace: "nowrap",
          padding: "12px 26px",
          borderRadius: 999,
          border: `1px solid ${C.line}`,
          background: "rgba(26,28,31,0.9)",
          fontSize: 21,
          color: C.ink2,
          opacity: ease(frame, 96, 12) * (1 - tense),
        }}
      >
        Starting point for your architect or contractor — <span style={{ color: C.ink }}>not a final drawing</span>
      </div>

      {/* light sweep into the close */}
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          background: `linear-gradient(100deg, transparent ${sweep * 100 - 22}%, rgba(255,255,255,0.55) ${sweep * 100}%, transparent ${sweep * 100 + 22}%)`,
          mixBlendMode: "screen",
          opacity: tense,
        }}
      />
    </AbsoluteFill>
  );
};
