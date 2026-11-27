"use client";

/**
 * The only animated blog visual: three floating pages, a pen, and a few teal
 * orbs. Everything is low-poly geometry created here, shared across the meshes
 * in this scene, and disposed on unmount. No textures, no GLB, no controls.
 */
import { useEffect, useMemo, useRef } from "react";
import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  EdgesGeometry,
  ExtrudeGeometry,
  type Group,
  type Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Shape,
  SphereGeometry,
} from "three";
import {
  useModelFrame,
  useModelPalette,
  useModelQuality,
  useModelStill,
} from "@/components/three/models/context";

function roundedRectGeometry(w: number, h: number, r: number, d: number): ExtrudeGeometry {
  const cr = Math.min(r, w / 2, h / 2);
  const x = -w / 2;
  const y = -h / 2;
  const shape = new Shape();
  shape.moveTo(x + cr, y);
  shape.lineTo(x + w - cr, y);
  shape.quadraticCurveTo(x + w, y, x + w, y + cr);
  shape.lineTo(x + w, y + h - cr);
  shape.quadraticCurveTo(x + w, y + h, x + w - cr, y + h);
  shape.lineTo(x + cr, y + h);
  shape.quadraticCurveTo(x, y, x, y + h - cr);
  shape.lineTo(x, y + cr);
  shape.quadraticCurveTo(x, y, x + cr, y);
  return new ExtrudeGeometry(shape, {
    depth: d,
    bevelEnabled: true,
    bevelSegments: 1,
    bevelSize: 0.012,
    bevelThickness: 0.012,
    curveSegments: 3,
    steps: 1,
  });
}

function smoothstep(t: number): number {
  const clamped = Math.max(0, Math.min(1, t));
  return clamped * clamped * (3 - 2 * clamped);
}

export default function BlogScene3DModel({
  intensity = 1,
  interactive = true,
}: {
  intensity?: number;
  interactive?: boolean;
}) {
  const palette = useModelPalette();
  const quality = useModelQuality();
  const still = useModelStill();
  const strength = Math.max(0, Math.min(2, intensity));
  const pageCount = quality === "low" ? 2 : 3;
  const orbCount = quality === "high" ? 4 : quality === "medium" ? 3 : 2;

  const root = useRef<Group>(null);
  const pages = useRef<(Group | null)[]>([]);
  const orbs = useRef<(Mesh | null)[]>([]);
  const pointer = useRef({ x: 0, y: 0 });
  const tilt = useRef({ x: 0, y: 0 });

  const geometry = useMemo(() => {
    const page = roundedRectGeometry(2.5, 2.9, 0.14, 0.04);
    return {
      page,
      edges: new EdgesGeometry(page, 28),
      bar: new BoxGeometry(1, 1, 0.02),
      orb: new SphereGeometry(1, 12, 8),
      penBody: new CylinderGeometry(0.035, 0.05, 1.15, 8),
      penTip: new ConeGeometry(0.05, 0.22, 8),
    };
  }, []);

  const material = useMemo(() => {
    return {
      page: new MeshPhysicalMaterial({
        color: palette.card,
        transparent: true,
        opacity: 0.9,
        roughness: 0.38,
        metalness: 0.04,
        clearcoat: 0.18,
        depthWrite: false,
      }),
      edge: new MeshStandardMaterial({
        color: palette.accent,
        emissive: palette.accent,
        emissiveIntensity: 0.45,
        transparent: true,
        opacity: 0.85,
      }),
      bar: new MeshStandardMaterial({
        color: palette.line,
        transparent: true,
        opacity: 0.85,
      }),
      title: new MeshStandardMaterial({
        color: palette.ink,
        transparent: true,
        opacity: 0.9,
      }),
      orb: new MeshStandardMaterial({
        color: palette.accent,
        emissive: palette.accent,
        emissiveIntensity: 0.7,
        transparent: true,
        opacity: 0.88,
      }),
      pen: new MeshStandardMaterial({ color: palette.ink, transparent: true, opacity: 1 }),
      tip: new MeshStandardMaterial({
        color: palette.accent,
        emissive: palette.accent,
        emissiveIntensity: 0.8,
        transparent: true,
        opacity: 1,
      }),
    };
  }, [palette]);

  useEffect(() => {
    return () => {
      for (const item of Object.values(geometry)) item.dispose();
      for (const item of Object.values(material)) item.dispose();
    };
  }, [geometry, material]);

  useEffect(() => {
    if (!interactive || still || window.matchMedia("(pointer: coarse)").matches) return;
    const update = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth - 0.5) * 2;
      pointer.current.y = (event.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", update, { passive: true });
    return () => window.removeEventListener("pointermove", update);
  }, [interactive, still]);

  useModelFrame((delta, elapsed) => {
    // One-second entry is scale only; opacity is fixed so no material is mutated after render.
    const fade = still ? 1 : smoothstep(elapsed / 1);
    const time = still ? 0 : elapsed;

    if (root.current) {
      const follow = still ? 1 : Math.min(1, delta * 3);
      const targetX = interactive && !still ? pointer.current.x * 0.12 : 0;
      const targetY = interactive && !still ? pointer.current.y * 0.09 : 0;
      tilt.current.x += (targetX - tilt.current.x) * follow;
      tilt.current.y += (targetY - tilt.current.y) * follow;
      root.current.scale.setScalar(0.86 + 0.14 * fade);
      root.current.position.y = Math.sin(time * 0.55) * 0.07 * strength;
      root.current.rotation.y = Math.sin(time * 0.24) * 0.14 * strength + tilt.current.x;
      root.current.rotation.x = Math.cos(time * 0.2) * 0.055 * strength + tilt.current.y;
    }

    for (let index = 0; index < pages.current.length; index += 1) {
      const page = pages.current[index];
      if (!page) continue;
      const phase = index * 1.7;
      page.position.y = (index - 1) * 0.1 + Math.sin(time * 0.7 + phase) * 0.045 * strength;
      page.position.z = (index - 1) * 0.12 + Math.cos(time * 0.5 + phase) * 0.035 * strength;
      page.rotation.z = Math.sin(time * 0.35 + phase) * 0.045 * strength;
    }

    for (let index = 0; index < orbs.current.length; index += 1) {
      const orb = orbs.current[index];
      if (!orb) continue;
      const angle = time * 0.48 * strength + (index * Math.PI * 2) / orbs.current.length;
      orb.position.set(
        Math.cos(angle) * 1.9,
        Math.sin(angle) * 1.35 + Math.sin(time * 0.8 + index) * 0.08 * strength,
        Math.sin(angle * 0.7 + index) * 0.35,
      );
    }
  });

  return (
    <group ref={root} scale={0.86}>
      {Array.from({ length: pageCount }, (_, index) => (
        <group
          key={index}
          ref={(node) => {
            pages.current[index] = node;
          }}
          position={[(index - 1) * 0.09, (index - 1) * 0.1, (index - 1) * 0.12]}
          rotation={[0, (index - 1) * 0.06, (index - 1) * 0.035]}
        >
          <mesh
            geometry={geometry.page}
            material={material.page}
            dispose={null}
            renderOrder={index}
          />
          <lineSegments
            geometry={geometry.edges}
            material={material.edge}
            dispose={null}
            renderOrder={index + 1}
          />
          <mesh
            geometry={geometry.bar}
            material={material.title}
            position={[-0.42, 0.78 - index * 0.04, 0.075]}
            scale={[0.72, 0.11, 1]}
            dispose={null}
          />
          {[0.42, 0.2, -0.02, -0.24].map((y, lineIndex) => (
            <mesh
              key={y}
              geometry={geometry.bar}
              material={material.bar}
              position={[-0.5 + (lineIndex % 2) * 0.06, y - index * 0.03, 0.075]}
              scale={[lineIndex === 3 ? 1.05 : 1.55 - (lineIndex % 2) * 0.3, 0.055, 1]}
              dispose={null}
            />
          ))}
        </group>
      ))}

      <group position={[1.42, -0.34, 0.42]} rotation={[0, 0, -0.72]}>
        <mesh geometry={geometry.penBody} material={material.pen} dispose={null} />
        <mesh geometry={geometry.penTip} material={material.tip} position={[0, -0.68, 0]} dispose={null} />
      </group>

      {Array.from({ length: orbCount }, (_, index) => (
        <mesh
          key={index}
          ref={(node) => {
            orbs.current[index] = node;
          }}
          geometry={geometry.orb}
          material={material.orb}
          scale={index % 2 === 0 ? 0.13 : 0.09}
          dispose={null}
        />
      ))}
    </group>
  );
}
