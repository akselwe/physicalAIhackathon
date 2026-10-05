import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import React, { useLayoutEffect, useMemo } from "react";
import { useTexture } from "@react-three/drei";
import { AbsoluteFill, staticFile } from "remotion";
import * as THREE from "three";
import { Cam, DISP, HEIGHT, PLANE_H, PLANE_W, RoomId, WIDTH } from "./cam";

export type Blob = { u: number; v: number; r: number; heat: number };

export type RoomLook = {
  dim?: number; // 1 = original brightness
  sat?: number; // 1 = original saturation
  tint?: [number, number, number]; // multiplied colour
  scan?: number; // lidar sweep front, 0..1 by depth (near to far); <0 = off
  scanColor?: string;
  mesh?: number; // 0..1 strength of the lidar wire grid
  thermal?: number; // 0..1 mix into the thermal palette
  blobs?: Blob[]; // heat sources / leaks (photo uv)
  disp?: number;
  fade?: number; // 0..1 multiplies brightness (fade to black)
};

const vert = /* glsl */ `
uniform sampler2D uDepth;
uniform float uDisp;
varying vec2 vUv;
varying float vDepth;
void main() {
  vUv = uv;
  float d = texture2D(uDepth, uv).r;
  vDepth = d;
  vec3 p = position;
  p.z += d * uDisp;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`;

const frag = /* glsl */ `
uniform sampler2D uPhoto;
uniform float uDim, uSat, uScan, uMesh, uThermal, uFade;
uniform vec3 uTint, uScanColor;
uniform vec4 uBlobs[4];
varying vec2 vUv;
varying float vDepth;

vec3 iron(float t) {
  t = clamp(t, 0.0, 1.0);
  vec3 c0 = vec3(0.02, 0.0, 0.10);
  vec3 c1 = vec3(0.35, 0.0, 0.55);
  vec3 c2 = vec3(0.85, 0.10, 0.25);
  vec3 c3 = vec3(1.0, 0.55, 0.05);
  vec3 c4 = vec3(1.0, 0.95, 0.55);
  if (t < 0.25) return mix(c0, c1, t / 0.25);
  if (t < 0.5) return mix(c1, c2, (t - 0.25) / 0.25);
  if (t < 0.75) return mix(c2, c3, (t - 0.5) / 0.25);
  return mix(c3, c4, (t - 0.75) / 0.25);
}

void main() {
  vec3 col = texture2D(uPhoto, vUv).rgb;
  float lum = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(vec3(lum), col, uSat) * uTint * uDim;

  if (uThermal > 0.001) {
    float heat = 0.18 + lum * 0.22;
    for (int i = 0; i < 4; i++) {
      vec4 b = uBlobs[i];
      if (b.z > 0.0) {
        vec2 q = (vUv - b.xy) * vec2(1.33, 1.0);
        heat += b.w * exp(-dot(q, q) / (b.z * b.z));
      }
    }
    col = mix(col, iron(heat), uThermal);
  }

  if (uMesh > 0.001) {
    vec2 g = vUv * vec2(120.0, 90.0);
    vec2 f = abs(fract(g - 0.5) - 0.5) / fwidth(g);
    float line = 1.0 - min(min(f.x, f.y), 1.0);
    col += uScanColor * line * uMesh * 0.55;
  }

  if (uScan >= 0.0) {
    float front = 1.0 - uScan; // depth value of the sweep front: starts near (1), ends far (0)
    float band = smoothstep(0.05, 0.0, abs(vDepth - front));
    float behind = step(front, vDepth); // already scanned
    col = mix(col * 0.35, col, behind);
    col += uScanColor * band * 1.6;
  }

  gl_FragColor = vec4(col * uFade, 1.0);
}
`;

// drei's useTexture suspends until the image is in; ThreeCanvas holds the render while it does.
const useTex = (src: string, srgb: boolean) => {
  const t = useTexture(staticFile(src));
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.minFilter = THREE.LinearFilter;
  t.generateMipmaps = false;
  return t;
};

const Rig: React.FC<{ cam: Cam }> = ({ cam }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  useLayoutEffect(() => {
    camera.position.set(...cam.pos);
    camera.fov = cam.fov;
    camera.lookAt(...cam.target);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld(true);
  });
  return null;
};

const Plane: React.FC<{ room: RoomId; look: RoomLook }> = ({ room, look }) => {
  const photo = useTex(`room/photo-${room}.jpg`, true);
  const depth = useTex(`room/depth-${room}.png`, false);
  const blobs = useMemo(() => Array.from({ length: 4 }, () => new THREE.Vector4(0, 0, 0, 0)), []);
  const uniforms = useMemo(
    () => ({
      uPhoto: { value: photo },
      uDepth: { value: depth },
      uDisp: { value: DISP },
      uDim: { value: 1 },
      uSat: { value: 1 },
      uTint: { value: new THREE.Vector3(1, 1, 1) },
      uScan: { value: -1 },
      uScanColor: { value: new THREE.Color("#52e0ff") },
      uMesh: { value: 0 },
      uThermal: { value: 0 },
      uFade: { value: 1 },
      uBlobs: { value: blobs },
    }),
    [photo, depth, blobs],
  );
  uniforms.uDisp.value = look.disp ?? DISP;
  uniforms.uDim.value = look.dim ?? 1;
  uniforms.uSat.value = look.sat ?? 1;
  uniforms.uTint.value.set(...(look.tint ?? [1, 1, 1]));
  uniforms.uScan.value = look.scan ?? -1;
  uniforms.uScanColor.value.set(look.scanColor ?? "#52e0ff");
  uniforms.uMesh.value = look.mesh ?? 0;
  uniforms.uThermal.value = look.thermal ?? 0;
  uniforms.uFade.value = look.fade ?? 1;
  blobs.forEach((b, i) => {
    const s = look.blobs?.[i];
    b.set(s?.u ?? 0, s ? 1 - s.v : 0, s?.r ?? 0, s?.heat ?? 0); // uv y is flipped vs photo v
  });
  return (
    <mesh>
      <planeGeometry args={[PLANE_W, PLANE_H, 320, 240]} />
      <shaderMaterial vertexShader={vert} fragmentShader={frag} uniforms={uniforms} extensions={{ derivatives: true } as never} />
    </mesh>
  );
};

// A photo turned into a walk-through-able 3D room. Children render in the same 3D space (e.g. the rover).
export const ParallaxRoom: React.FC<{
  readonly room: RoomId;
  readonly cam: Cam;
  readonly look?: RoomLook;
  readonly children?: React.ReactNode;
  readonly transparent?: boolean;
}> = ({ room, cam, look = {}, children }) => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <ThreeCanvas width={WIDTH} height={HEIGHT} camera={{ position: cam.pos, fov: cam.fov, near: 0.1, far: 100 }}>
      <Rig cam={cam} />
      <Plane room={room} look={look} />
      {children}
    </ThreeCanvas>
  </AbsoluteFill>
);
