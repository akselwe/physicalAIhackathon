import { RoundedBox } from "@react-three/drei";
import React from "react";
import { C } from "../theme";

type Props = {
  readonly position?: [number, number, number];
  readonly rotationY?: number;
  readonly scale?: number;
  readonly mast?: number; // 0 = retracted, 1 = fully extended
  readonly spin?: number; // lidar ring angle (radians)
  readonly wheelAngle?: number; // wheel rotation (radians)
  readonly leds?: number; // 0..1 status glow
  readonly laser?: boolean; // red laser dot on the front sensor bar
};

const BODY = "#d9dde3";
const DARK = "#14161a";
const MID = "#2a2e35";

// Stud: a small survey rover. Body 0.9 x 0.28 x 0.6 (x, y, z), front toward +z. Origin on the floor.
// LiDAR puck on top, a 4-section telescopic mast with a camera head that rises straight up,
// a front sensor bar (RGB camera, thermal camera, laser rangefinder) and four wheels.
export const Rover: React.FC<Props> = ({
  position = [0, 0, 0],
  rotationY = 0,
  scale = 1,
  mast = 0,
  spin = 0,
  wheelAngle = 0,
  leds = 1,
  laser = true,
}) => {
  const wheelR = 0.13;
  const mastTotal = 1.1 * mast; // extra reach in metres above the retracted mast
  const sections = [0, 1, 2, 3];
  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
      {/* chassis */}
      <RoundedBox args={[0.9, 0.2, 0.6]} radius={0.06} smoothness={4} position={[0, wheelR + 0.1, 0]}>
        <meshStandardMaterial color={BODY} roughness={0.35} metalness={0.15} />
      </RoundedBox>
      <RoundedBox args={[0.94, 0.05, 0.64]} radius={0.02} position={[0, wheelR + 0.02, 0]}>
        <meshStandardMaterial color={DARK} roughness={0.6} />
      </RoundedBox>
      {/* upper deck */}
      <RoundedBox args={[0.74, 0.1, 0.46]} radius={0.04} smoothness={4} position={[0, wheelR + 0.25, 0]}>
        <meshStandardMaterial color="#eceff3" roughness={0.3} metalness={0.1} />
      </RoundedBox>
      {/* status LED strip along the side */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.463, wheelR + 0.12, 0]}>
          <boxGeometry args={[0.012, 0.02, 0.4]} />
          <meshBasicMaterial color={C.ok} transparent opacity={0.35 + 0.65 * leds} />
        </mesh>
      ))}
      {/* wheels */}
      {[
        [-0.5, 0.2],
        [0.5, 0.2],
        [-0.5, -0.2],
        [0.5, -0.2],
      ].map(([x, z], i) => (
        <group key={i} position={[x, wheelR, z]} rotation={[0, 0, Math.PI / 2]}>
          <mesh rotation={[0, wheelAngle, 0]}>
            <cylinderGeometry args={[wheelR, wheelR, 0.12, 28]} />
            <meshStandardMaterial color={DARK} roughness={0.85} />
          </mesh>
          <mesh rotation={[0, wheelAngle, 0]} position={[0, x > 0 ? 0.062 : -0.062, 0]}>
            <cylinderGeometry args={[wheelR * 0.62, wheelR * 0.62, 0.012, 20]} />
            <meshStandardMaterial color="#9aa1ac" roughness={0.3} metalness={0.7} />
          </mesh>
        </group>
      ))}
      {/* front sensor bar */}
      <RoundedBox args={[0.62, 0.11, 0.07]} radius={0.03} position={[0, wheelR + 0.19, 0.31]}>
        <meshStandardMaterial color={DARK} roughness={0.4} metalness={0.3} />
      </RoundedBox>
      {/* RGB camera lens, thermal lens (warm), laser rangefinder */}
      {[
        [-0.2, "#0b0d10", "#52e0ff"],
        [0.0, "#0b0d10", C.heat],
        [0.2, "#0b0d10", C.laser],
      ].map(([x, base, glow], i) => (
        <group key={i} position={[x as number, wheelR + 0.19, 0.348]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.032, 0.036, 0.02, 24]} />
            <meshStandardMaterial color={base as string} roughness={0.2} metalness={0.8} />
          </mesh>
          <mesh position={[0, 0, 0.012]}>
            <circleGeometry args={[0.022, 24]} />
            <meshBasicMaterial color={glow as string} />
          </mesh>
        </group>
      ))}
      {laser ? (
        <mesh position={[0.2, wheelR + 0.19, 0.4]}>
          <sphereGeometry args={[0.012, 12, 12]} />
          <meshBasicMaterial color={C.laser} />
        </mesh>
      ) : null}
      {/* LiDAR puck at the back of the deck */}
      <group position={[0, wheelR + 0.3, -0.12]}>
        <mesh>
          <cylinderGeometry args={[0.1, 0.11, 0.05, 36]} />
          <meshStandardMaterial color={DARK} roughness={0.35} metalness={0.4} />
        </mesh>
        <mesh position={[0, 0.045, 0]} rotation={[0, spin, 0]}>
          <cylinderGeometry args={[0.085, 0.085, 0.04, 36]} />
          <meshStandardMaterial color={MID} roughness={0.25} metalness={0.5} />
        </mesh>
        <mesh position={[0, 0.045, 0]} rotation={[0, spin, 0]}>
          <torusGeometry args={[0.087, 0.004, 8, 48]} />
          <meshBasicMaterial color={C.lidar} />
        </mesh>
        <mesh position={[0.088 * Math.cos(spin), 0.045, -0.088 * Math.sin(spin)]}>
          <sphereGeometry args={[0.014, 10, 10]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>
      {/* vertical mast: base housing, four telescoping sections, camera head */}
      <group position={[0, wheelR + 0.3, 0.1]}>
        <mesh>
          <cylinderGeometry args={[0.06, 0.07, 0.05, 28]} />
          <meshStandardMaterial color={MID} roughness={0.4} metalness={0.5} />
        </mesh>
        {sections.map((_, i) => {
          // Nested sections: section i slides up by mast * i / 4 and overlaps the one below.
          const bottom = 0.025 + (mastTotal * i) / sections.length;
          const len = 0.4;
          return (
            <mesh key={i} position={[0, bottom + len / 2, 0]}>
              <cylinderGeometry args={[0.04 - i * 0.007, 0.04 - i * 0.007, len, 20]} />
              <meshStandardMaterial color={i % 2 ? "#aeb4be" : "#c7ccd4"} roughness={0.25} metalness={0.8} />
            </mesh>
          );
        })}
        <group position={[0, 0.025 + (mastTotal * (sections.length - 1)) / sections.length + 0.4 + 0.05, 0]}>
          <RoundedBox args={[0.16, 0.1, 0.1]} radius={0.03} smoothness={4}>
            <meshStandardMaterial color={BODY} roughness={0.3} metalness={0.2} />
          </RoundedBox>
          <mesh position={[0, 0, 0.055]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.032, 0.034, 0.03, 24]} />
            <meshStandardMaterial color="#0b0d10" roughness={0.15} metalness={0.9} />
          </mesh>
          <mesh position={[0, 0, 0.071]}>
            <circleGeometry args={[0.022, 24]} />
            <meshBasicMaterial color="#6fb8ff" />
          </mesh>
          <mesh position={[0.058, 0.025, 0.052]}>
            <sphereGeometry args={[0.008, 10, 10]} />
            <meshBasicMaterial color={C.ok} />
          </mesh>
        </group>
      </group>
    </group>
  );
};
