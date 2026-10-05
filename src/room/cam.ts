import * as THREE from "three";
import grid from "./depthgrid.json";

export type RoomId = "2185" | "2186";
export type Cam = { pos: [number, number, number]; target: [number, number, number]; fov: number };

// The photo becomes a 8 x 6 plane; the depth map pushes pixels toward the camera by up to DISP units.
export const PLANE_W = 8;
export const PLANE_H = 6;
export const DISP = 3;
export const WIDTH = 1920;
export const HEIGHT = 1080;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Normalised depth (0 = far, 1 = near) at photo coordinates u, v in 0..1 (bilinear on the baked grid).
export const depthAt = (room: RoomId, u: number, v: number) => {
  const g = (grid.grids as Record<string, number[]>)[room];
  const x = Math.min(grid.w - 1.001, Math.max(0, u * (grid.w - 1)));
  const y = Math.min(grid.h - 1.001, Math.max(0, v * (grid.h - 1)));
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = x - x0;
  const fy = y - y0;
  const at = (xx: number, yy: number) => g[yy * grid.w + xx];
  return lerp(lerp(at(x0, y0), at(x0 + 1, y0), fx), lerp(at(x0, y0 + 1), at(x0 + 1, y0 + 1), fx), fy);
};

// Rough metric distance from the camera for a photo point (presentation only: fake but consistent).
export const metersAt = (room: RoomId, u: number, v: number) => 1.6 + (1 - depthAt(room, u, v)) * 13.5;

// World position of a photo pixel on the displaced plane.
export const worldPos = (room: RoomId, u: number, v: number, disp = DISP): [number, number, number] => [
  (u - 0.5) * PLANE_W,
  (0.5 - v) * PLANE_H,
  depthAt(room, u, v) * disp,
];

// Project a world point to screen pixels (1920x1080) for a camera, for HTML/SVG overlays that must stick to the 3D.
export const project = (cam: Cam, p: [number, number, number]) => {
  const c = new THREE.PerspectiveCamera(cam.fov, WIDTH / HEIGHT, 0.1, 100);
  c.position.set(...cam.pos);
  c.lookAt(...cam.target);
  c.updateMatrixWorld(true);
  const v = new THREE.Vector3(...p).project(c);
  return { x: ((v.x + 1) / 2) * WIDTH, y: ((1 - v.y) / 2) * HEIGHT, visible: v.z > -1 && v.z < 1 };
};

// Screen position of a photo pixel.
export const projectUV = (cam: Cam, room: RoomId, u: number, v: number, disp = DISP) =>
  project(cam, worldPos(room, u, v, disp));

export const lerpCam = (a: Cam, b: Cam, t: number): Cam => ({
  pos: a.pos.map((x, i) => lerp(x, b.pos[i], t)) as [number, number, number],
  target: a.target.map((x, i) => lerp(x, b.target[i], t)) as [number, number, number],
  fov: lerp(a.fov, b.fov, t),
});
