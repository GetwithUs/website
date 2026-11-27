"use client";

/*
 * The actual Three.js ring scene for the Clients section.
 * Loaded lazily (ssr: false) by ClientsScene3D.tsx.
 * Follows the same performance conventions as the page model canvases.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRouter } from "next/navigation";
import type { Group, Mesh } from "three";
import {
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  LinearFilter,
  LinearMipmapLinearFilter,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  PointsMaterial,
  TextureLoader,
  Vector3,
} from "three";

import { onFrame } from "@/components/motion/frame";

const FRAME_MS = 1000 / 30;

// Deterministic pseudo-random positions computed once at module level (satisfies react-hooks/purity)
const MAX_PARTICLES = 150;
const PARTICLE_POSITIONS = new Float32Array(MAX_PARTICLES * 3);
for (let i = 0; i < MAX_PARTICLES; i++) {
  PARTICLE_POSITIONS[i * 3] = ((Math.sin(i * 12.9898) * 43758.5453) % 1) * 14 - 7;
  PARTICLE_POSITIONS[i * 3 + 1] = ((Math.sin((i + 1) * 78.233) * 43758.5453) % 1) * 10 - 5;
  PARTICLE_POSITIONS[i * 3 + 2] = ((Math.sin((i + 2) * 43.123) * 43758.5453) % 1) * 10 - 5;
}

// --- Types ---
export type ClientCard = {
  name: string;
  slug: string;
  logoUrl: string | null;
};

// --- Particle background ---
function Particles({ count }: { count: number }) {
  const geo = useMemo(() => {
    const g = new BufferGeometry();
    const slice = PARTICLE_POSITIONS.subarray(0, count * 3);
    g.setAttribute("position", new BufferAttribute(slice, 3));
    return g;
  }, [count]);

  const mat = useMemo(
    () =>
      new PointsMaterial({
        color: new Color("#22d3ee"),
        size: 0.04,
        transparent: true,
        opacity: 0.45,
        sizeAttenuation: true,
      }),
    [],
  );

  useEffect(() => () => { geo.dispose(); mat.dispose(); }, [geo, mat]);

  return <points geometry={geo} material={mat} />;
}

// --- Individual logo card ---
function LogoCard({
  client,
  position,
  onHover,
  onClick,
  isHovered,
  still,
}: {
  client: ClientCard;
  position: Vector3;
  onHover: (hovered: boolean) => void;
  onClick: () => void;
  isHovered: boolean;
  still: boolean;
}) {
  const meshRef = useRef<Mesh>(null!);
  const targetZ = useRef(position.z);
  const [texture, setTexture] = useState<CanvasTexture | null>(null);

  // Load logo texture
  useEffect(() => {
    if (!client.logoUrl) return;
    let croppedTex: CanvasTexture | null = null;
    const loader = new TextureLoader();
    loader.load(
      client.logoUrl,
      (tex) => {
        tex.generateMipmaps = true;
        tex.minFilter = LinearMipmapLinearFilter;
        tex.magFilter = LinearFilter;
        const size = 256;
        const cv = document.createElement("canvas");
        cv.width = size;
        cv.height = size;
        const ctx = cv.getContext("2d");
        if (ctx) {
          ctx.drawImage(tex.image as HTMLImageElement, 0, 0, size, size);
          croppedTex = new CanvasTexture(cv);
          croppedTex.generateMipmaps = true;
          setTexture(croppedTex);
        }
        tex.dispose();
      },
      undefined,
      () => {
        setTexture(null);
      },
    );
    return () => {
      croppedTex?.dispose();
    };
  }, [client.logoUrl]);

  useEffect(() => () => texture?.dispose(), [texture]);

  const geo = useMemo(() => new PlaneGeometry(0.9, 0.9), []);

  const matFront = useMemo(
    () =>
      new MeshStandardMaterial({
        color: new Color(0x1a3a4a),
        roughness: 0.12,
        metalness: 0.0,
        transparent: true,
        opacity: 0.88,
        emissive: new Color(isHovered ? "#22d3ee" : "#0a6b74"),
        emissiveIntensity: isHovered ? 0.6 : 0.15,
      }),
    [isHovered],
  );

  const matLogo = useMemo(
    () =>
      texture
        ? new MeshBasicMaterial({ map: texture, transparent: true, opacity: 0.95 })
        : null,
    [texture],
  );

  useEffect(
    () => () => {
      geo.dispose();
      matFront.dispose();
      matLogo?.dispose();
    },
    [geo, matFront, matLogo],
  );

  useFrame((_, delta) => {
    if (!meshRef.current || still) return;
    const step = Math.min(delta, 1 / 20);
    targetZ.current = isHovered ? position.z + 0.6 : position.z;
    meshRef.current.position.z += (targetZ.current - meshRef.current.position.z) * step * 6;
  });

  return (
    <group
      position={position}
      onPointerOver={(e) => { e.stopPropagation(); onHover(true); }}
      onPointerOut={() => onHover(false)}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
    >
      {/* Glass back-plate */}
      <mesh ref={meshRef} geometry={geo} material={matFront} />
      {/* Logo plane slightly in front */}
      {matLogo && texture && (
        <mesh position={[0, 0, 0.01]} material={matLogo}>
          <planeGeometry args={[0.65, 0.65]} />
        </mesh>
      )}
    </group>
  );
}

// --- Ring of cards ---
function ClientRing({
  clients,
  size,
  still,
  onHoverClient,
  onClickClient,
  hoveredSlug,
}: {
  clients: ClientCard[];
  size: "default" | "large";
  still: boolean;
  onHoverClient: (slug: string | null) => void;
  onClickClient: (slug: string) => void;
  hoveredSlug: string | null;
}) {
  const groupRef = useRef<Group>(null!);
  const elapsed = useRef(0);
  const tiltRef = useRef({ x: 0, y: 0 });

  const radius = size === "large" ? 3.2 : 2.4;
  const count = Math.min(clients.length, 12);

  const positions = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      return new Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.4, 0);
    });
  }, [count, radius]);

  // Mouse parallax tilt
  useEffect(() => {
    const isFine = window.matchMedia("(pointer: fine)").matches;
    if (!isFine) return;
    const onMove = (e: MouseEvent) => {
      tiltRef.current = {
        x: (e.clientY / window.innerHeight - 0.5) * 0.3,
        y: (e.clientX / window.innerWidth - 0.5) * 0.3,
      };
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current || still) return;
    const step = Math.min(delta, 1 / 20);
    elapsed.current += step;
    groupRef.current.rotation.z = elapsed.current * 0.06;
    groupRef.current.rotation.x += (tiltRef.current.x - groupRef.current.rotation.x) * step * 3;
    groupRef.current.rotation.y += (tiltRef.current.y - groupRef.current.rotation.y) * step * 3;
  });

  return (
    <group ref={groupRef}>
      {clients.slice(0, count).map((client, i) => (
        <LogoCard
          key={client.slug}
          client={client}
          position={positions[i]!}
          isHovered={hoveredSlug === client.slug}
          onHover={(h) => onHoverClient(h ? client.slug : null)}
          onClick={() => onClickClient(client.slug)}
          still={still}
        />
      ))}
    </group>
  );
}

// --- Frame driver (30fps, demand) ---
function Driver({ active, still }: { active: boolean; still: boolean }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    if (!active || still) { invalidate(); return; }
    let last = 0;
    return onFrame((now) => {
      if (now - last < FRAME_MS - 2) return;
      last = now;
      invalidate();
    });
  }, [active, still, invalidate]);
  return null;
}

// --- Main exported canvas component ---
export default function ClientsRing({
  clients,
  size = "default",
  active = true,
  still = false,
  onContextLost,
}: {
  clients: ClientCard[];
  size?: "default" | "large";
  active?: boolean;
  still?: boolean;
  onContextLost?: () => void;
}) {
  const router = useRouter();
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const particleCount = isMobile ? 60 : 150;

  const fov = size === "large" ? 50 : 55;
  const camZ = size === "large" ? 9 : 6.5;

  return (
    <Canvas
      dpr={[1, 2]}
      frameloop="demand"
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ fov, near: 0.1, far: 60, position: [0, 0, camZ] }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        gl.domElement.addEventListener("webglcontextlost", () => onContextLost?.(), {
          once: true,
        });
      }}
    >
      <Driver active={active} still={still} />
      <hemisphereLight color="#ffffff" groundColor="#0f1b2d" intensity={1.2} />
      <directionalLight position={[3, 5, 4]} intensity={1.6} />
      <directionalLight position={[-4, 1.5, -2]} intensity={0.5} color="#22d3ee" />
      <Particles count={particleCount} />
      <ClientRing
        clients={clients}
        size={size}
        still={still}
        hoveredSlug={hoveredSlug}
        onHoverClient={setHoveredSlug}
        onClickClient={(slug) => router.push(`/clients/${slug}`)}
      />
    </Canvas>
  );
}
