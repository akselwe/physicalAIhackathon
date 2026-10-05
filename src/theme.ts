import { loadFont as loadSans } from "@remotion/google-fonts/SchibstedGrotesk";
import { loadFont as loadMono } from "@remotion/google-fonts/FragmentMono";

// Dark cinematic palette. Change to fit the video.
export const C = {
  void: "#07080a", // deepest background for the 3D stage
  ground: "#111315",
  surface: "#1a1c1f",
  sunken: "#0c0d10",
  line: "#2d2f33",
  lineStrong: "#71747c",
  ink: "#ebedef",
  ink2: "#a7abb3",
  agent: "#8baaff",
  agentDeep: "#2d49c9",
  agentSoft: "#1e2949",
  mark: "#edd854",
  markSoft: "#3d360b",
  onMark: "#18160c",
  danger: "#f47c70",
  dangerSoft: "#3e1f1b",
  // Signal colours: each sensor has its own.
  laser: "#ff4d4d",
  lidar: "#52e0ff",
  heat: "#ff9a3c",
  ok: "#46e6a4",
  warn: "#ffc247",
} as const;

export const { fontFamily: SANS } = loadSans("normal", {
  weights: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

export const { fontFamily: MONO } = loadMono("normal", {
  weights: ["400"],
  subsets: ["latin"],
});
