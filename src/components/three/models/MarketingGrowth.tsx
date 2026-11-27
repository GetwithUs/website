"use client";

/**
 * MarketingGrowth - digital-marketing service page model.
 *
 * Reach grows, the trend climbs, and engagement lands.
 * Ported from docs/prototype/Digital marketing 3D prototype.html (three.js r128).
 * Camera: fov 30, z 10.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CatmullRomCurve3,
  ExtrudeGeometry,
  type Mesh,
  Shape,
  SphereGeometry,
  TorusGeometry,
  TubeGeometry,
  Vector2,
  Vector3,
  type DirectionalLight,
  type Group,
} from "three";
import { THEME_EVENT } from "@/lib/theme";
import { useModelFrame, useModelQuality } from "@/components/three/models/context";
import { rg } from "@/components/three/models/shared/geo";
import { buildMat, recolourMats, type TrackedMat } from "@/components/three/models/shared/materials";
import { buildPalette, type Palette } from "@/components/three/models/shared/palette";

// Bar heights from prototype
const BAR_H = [0.35, 0.5, 0.45, 0.75, 0.95, 1.25] as const;
// Back glass geometry (shared)
const BACK_GEO = rg(6.0, 3.9, 0.3, 0.06);

function ease(x: number): number { return 1 - Math.pow(1 - x, 3); }
function sm(x: number): number { return x * x * (3 - 2 * x); }

function createHeadGeo(): ExtrudeGeometry {
  const s = new Shape();
  s.moveTo(0, 0.11);
  s.lineTo(-0.09, -0.06);
  s.lineTo(0.09, -0.06);
  s.closePath();
  return new ExtrudeGeometry(s, { depth: 0.04, bevelEnabled: false });
}

function createUpGeo(): ExtrudeGeometry {
  const s = new Shape();
  s.moveTo(0, 0.1);
  s.lineTo(-0.09, -0.06);
  s.lineTo(0.09, -0.06);
  s.closePath();
  return new ExtrudeGeometry(s, { depth: 0.04, bevelEnabled: false });
}

function createHeartGeo(): ExtrudeGeometry {
  const hs = new Shape();
  const hx = 0;
  const hy = 0;
  hs.moveTo(hx + 0.025, hy + 0.025);
  hs.bezierCurveTo(hx + 0.025, hy + 0.025, hx + 0.02, hy, hx, hy);
  hs.bezierCurveTo(hx - 0.03, hy, hx - 0.03, hy + 0.035, hx - 0.03, hy + 0.035);
  hs.bezierCurveTo(hx - 0.03, hy + 0.055, hx - 0.01, hy + 0.077, hx + 0.025, hy + 0.095);
  hs.bezierCurveTo(hx + 0.06, hy + 0.077, hx + 0.08, hy + 0.055, hx + 0.08, hy + 0.035);
  hs.bezierCurveTo(hx + 0.08, hy + 0.035, hx + 0.08, hy, hx + 0.05, hy);
  hs.bezierCurveTo(hx + 0.035, hy, hx + 0.025, hy + 0.025, hx + 0.025, hy + 0.025);
  const g = new ExtrudeGeometry(hs, { depth: 0.03, bevelEnabled: false });
  g.translate(-0.025, -0.0475, 0);
  return g;
}

export default function MarketingGrowth() {
  const quality = useModelQuality();
  const [pal, setPal] = useState<Palette>(buildPalette);
  useEffect(() => {
    const update = () => setPal(buildPalette());
    window.addEventListener(THEME_EVENT, update);
    return () => window.removeEventListener(THEME_EVENT, update);
  }, []);

  // Bar geometry with pivot at bottom (y = 0.5 translation cached)
  const barGeo = useMemo(() => rg(0.26, 1, 0.09, 0.1, 0, 0.5, 0), []);

  const headGeo = useMemo(() => createHeadGeo(), []);
  const upGeo = useMemo(() => createUpGeo(), []);
  const heartGeo = useMemo(() => createHeartGeo(), []);
  const torus1Geo = useMemo(() => new TorusGeometry(0.32, 0.035, 10, 40), []);
  const torus2Geo = useMemo(() => new TorusGeometry(0.2, 0.035, 10, 40), []);
  const sphereGeo = useMemo(() => new SphereGeometry(0.08, 16, 12), []);

  useEffect(() => () => {
    headGeo.dispose();
    upGeo.dispose();
    heartGeo.dispose();
    torus1Geo.dispose();
    torus2Geo.dispose();
    sphereGeo.dispose();
  }, [headGeo, upGeo, heartGeo, torus1Geo, torus2Geo, sphereGeo]);

  const trendSegs = quality === "high" ? 40 : quality === "medium" ? 28 : 16;
  const { trendGeo, trendCurve, pts } = useMemo(() => {
    const pts = BAR_H.map((h, i) => new Vector3(-1.2 + i * 0.46, -0.85 + h + 0.2, 0.1));
    const trendCurve = new CatmullRomCurve3(pts);
    const trendGeo = new TubeGeometry(trendCurve, trendSegs, 0.03, 8, false);
    return { trendGeo, trendCurve, pts };
  }, [trendSegs]);
  useEffect(() => () => { trendGeo.dispose(); }, [trendGeo]);

  // Materials
  const bgMat      = useMemo(() => buildMat(pal, "tint", { opacity: 0.5 }), [pal]);
  const cardMat    = useMemo(() => buildMat(pal, "white"), [pal]);
  const inkMat     = useMemo(() => buildMat(pal, "ink"), [pal]);
  const softMat    = useMemo(() => buildMat(pal, "soft"), [pal]);
  const tealMat    = useMemo(() => buildMat(pal, "teal"), [pal]);
  const tintMat    = useMemo(() => buildMat(pal, "tint"), [pal]);
  const trendMat   = useMemo(() => buildMat(pal, "teal", { emissive: 0.15 }), [pal]);
  const pulseMat   = useMemo(() => buildMat(pal, "pure", { emissive: 0.9 }), [pal]);
  const heartMat   = useMemo(() => buildMat(pal, "teal", { emissive: 0.2 }), [pal]);
  const targetMat  = useMemo(() => buildMat(pal, "teal", { emissive: 0.25 }), [pal]);

  const allMats = useMemo<TrackedMat[]>(
    () => [bgMat, cardMat, inkMat, softMat, tealMat, tintMat, trendMat, pulseMat, heartMat, targetMat],
    [bgMat, cardMat, inkMat, softMat, tealMat, tintMat, trendMat, pulseMat, heartMat, targetMat],
  );
  useEffect(() => { recolourMats(allMats, pal); }, [pal, allMats]);
  useEffect(() => () => { for (const m of allMats) m.dispose(); }, [allMats]);

  // Bar materials (tint x 5, teal x 1 for last bar)
  const barMats = useMemo(() => BAR_H.map((_, i) =>
    i === 5 ? buildMat(pal, "teal", { emissive: 0.12 }) : buildMat(pal, "tint")
  ), [pal]);
  useEffect(() => () => { for (const m of barMats) m.dispose(); }, [barMats]);
  useEffect(() => { recolourMats(barMats as TrackedMat[], pal); }, [pal, barMats]);

  // Refs
  const root        = useRef<Group>(null);
  const cardNode    = useRef<Group>(null);
  const barNode     = useRef<Group>(null);
  const trendNode   = useRef<Group>(null);
  const chipNode    = useRef<Group>(null);
  const socNode     = useRef<Group>(null);
  const tgtNode     = useRef<Group>(null);
  const barMeshes   = useRef<(Mesh | null)[]>(BAR_H.map(() => null));
  const pulseMesh   = useRef<Mesh>(null);
  const heartMesh   = useRef<Mesh>(null);
  const pointer     = useRef(new Vector2(0, 0));
  const runStart    = useRef(0);
  const shadowRef   = useRef<DirectionalLight>(null);

  // Shadow config
  useEffect(() => {
    const l = shadowRef.current;
    if (!l) return;
    const sc = l.shadow.camera;
    sc.left = -5; sc.right = 5; sc.top = 5; sc.bottom = -5;
    sc.near = 1; sc.far = 25; sc.updateProjectionMatrix();
    l.shadow.bias = -0.0006; l.shadow.normalBias = 0.02; l.shadow.radius = 4;
    l.shadow.mapSize.set(quality === "high" ? 1024 : 512, quality === "high" ? 1024 : 512);
  }, [quality]);

  // Pointer
  useEffect(() => {
    const onMove = (e: PointerEvent) => pointer.current.set(
      (e.clientX / window.innerWidth - 0.5) * 2,
      -(e.clientY / window.innerHeight - 0.5) * 2,
    );
    const onLeave = () => pointer.current.set(0, 0);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const CX = -0.7;
  const CY = -0.1;

  const NODE_DEFS = useMemo(() => [
    { ref: cardNode,  x: CX,   y: CY,    za: 0.1,  ze: 0.3, arrival: -1 },
    { ref: barNode,   x: CX,   y: CY,    za: 0.14, ze: 0.7, arrival: -1 },
    { ref: trendNode, x: CX,   y: CY,    za: 0.16, ze: 1.1, arrival: 3.1 },
    { ref: chipNode,  x: -1.7, y: 1.45,  za: 0.2,  ze: 1.3, arrival: 3.3 },
    { ref: socNode,   x: 1.9,  y: 0.8,   za: 0.15, ze: 0.9, arrival: 3.5 },
    { ref: tgtNode,   x: 1.9,  y: -0.75, za: 0.15, ze: 0.6, arrival: 3.7 },
  ], [CX, CY]);

  useModelFrame((_, elapsed) => {
    const isStill = elapsed === 0;
    const nowMs = performance.now();
    const wall = nowMs / 1000;
    if (runStart.current === 0) runStart.current = wall;
    let t = isStill ? -1 : (wall - runStart.current);
    if (!isStill && t > 6.2) { runStart.current = wall; t = 0; }

    const k = isStill ? 0.3 : 0.5;

    // Nodes animation
    NODE_DEFS.forEach(({ ref, x, y, za, ze, arrival }, i) => {
      const g = ref.current;
      if (!g) return;
      let s = 1;
      if (!isStill && arrival >= 0) {
        const dt = t - arrival;
        if (dt >= 0 && dt < 0.45) s = 1 + 0.1 * (1 - dt / 0.45);
      }
      g.scale.setScalar(s);
      g.position.set(x, y + (isStill ? 0 : Math.sin(nowMs / 900 + i * 0.9) * 0.025 * k), za + (ze - za) * k);
    });

    // Bar animation
    barMeshes.current.forEach((m, i) => {
      if (!m) return;
      const p = isStill ? 1 : Math.max(0, Math.min(1, (t - i * 0.15) / 0.7));
      m.scale.y = Math.max(0.001, BAR_H[i] * ease(p));
    });

    // Trend pulse animation
    const pp = (t - 1.8) / 1.3;
    if (pulseMesh.current) {
      if (isStill || pp < 0 || pp > 1) {
        pulseMesh.current.visible = false;
      } else {
        pulseMesh.current.visible = true;
        pulseMesh.current.position.copy(trendCurve.getPoint(sm(pp)));
      }
    }

    // Heart scale animation
    if (heartMesh.current) {
      const hd = t - 3.5;
      const hs = !isStill && hd >= 0 && hd < 0.6 ? 2.4 * (1 + 0.5 * Math.sin(hd / 0.6 * Math.PI)) : 2.4;
      heartMesh.current.scale.setScalar(hs);
    }

    // Tilt
    if (root.current) {
      root.current.rotation.y += (-0.28 + pointer.current.x * 0.28 - root.current.rotation.y) * 0.08;
      root.current.rotation.x += (-0.1  + pointer.current.y * 0.16 - root.current.rotation.x) * 0.08;
    }
  });

  return (
    <>
      <hemisphereLight args={[0xffffff, 0x9fb8c2, 0.6]} />
      <directionalLight ref={shadowRef} position={[-3, 4, 8]} intensity={0.6} castShadow />
      <pointLight color={pal.teal} intensity={0.5} distance={12} position={[-3, -2, 4]} />

      <group ref={root} rotation={[-0.1, -0.28, 0]}>
        {/* Back glass */}
        <mesh geometry={BACK_GEO} material={bgMat} position={[0, 0.05, -0.5]} receiveShadow />

        {/* Chart card */}
        <group ref={cardNode} position={[CX, CY, 0.1]}>
          <mesh geometry={rg(3.2, 2.4, 0.2, 0.08)} material={cardMat} position={[0, 0, 0]} castShadow receiveShadow />
          <mesh geometry={rg(0.9, 0.12, 0.05, 0.03)} material={inkMat} position={[-0.9, 0.95, 0.05]} castShadow />
          <mesh geometry={rg(0.6, 0.07, 0.03, 0.03)} material={softMat} position={[-1.05, 0.75, 0.05]} />
          <mesh geometry={rg(0.14, 0.14, 0.07, 0.03)} material={tealMat} position={[1.3, 0.95, 0.05]} />
          {/* Grid lines */}
          {([-0.45, -0.05, 0.35] as const).map((y) => (
            <mesh key={y} geometry={rg(2.8, 0.015, 0.007, 0.01)} material={softMat} position={[0, y, 0.045]} />
          ))}
        </group>

        {/* Bar node */}
        <group ref={barNode} position={[CX, CY, 0.14]}>
          {BAR_H.map((h, i) => (
            <mesh
              key={i}
              ref={(m) => { barMeshes.current[i] = m; }}
              geometry={barGeo}
              material={barMats[i]}
              position={[-1.2 + i * 0.46, -0.85, 0.05]}
              scale={[1, Math.max(0.001, h), 1]}
              castShadow
            />
          ))}
        </group>

        {/* Trend line node */}
        <group ref={trendNode} position={[CX, CY, 0.16]}>
          <mesh geometry={trendGeo} material={trendMat} />
          {/* Arrow head */}
          <mesh
            geometry={headGeo}
            material={tealMat}
            position={[pts[5].x + 0.03, pts[5].y, pts[5].z]}
            rotation={[0, 0, -0.99]}
            castShadow
          />
          {/* Pulse */}
          <mesh ref={pulseMesh} geometry={sphereGeo} material={pulseMat} visible={false} position={[0, 0, 0.1]} />
        </group>

        {/* Notification chip */}
        <group ref={chipNode} position={[-1.7, 1.45, 0.2]}>
          <mesh geometry={rg(1.3, 0.4, 0.2, 0.08)} material={cardMat} position={[0, 0, 0]} castShadow receiveShadow />
          <mesh geometry={upGeo} material={tealMat} position={[-0.45, 0, 0.05]} castShadow />
          <mesh geometry={rg(0.55, 0.07, 0.03, 0.03)} material={inkMat} position={[0.12, 0.06, 0.05]} />
          <mesh geometry={rg(0.40, 0.06, 0.03, 0.03)} material={softMat} position={[0.05, -0.07, 0.05]} />
        </group>

        {/* Social post */}
        <group ref={socNode} position={[1.9, 0.8, 0.15]}>
          <mesh geometry={rg(1.3, 1.15, 0.16, 0.08)} material={cardMat} position={[0, 0, 0]} castShadow receiveShadow />
          <mesh geometry={rg(0.26, 0.26, 0.13, 0.04)} material={tealMat} position={[-0.42, 0.38, 0.05]} />
          <mesh geometry={rg(0.5, 0.07, 0.03, 0.03)} material={inkMat} position={[0.05, 0.42, 0.05]} />
          <mesh geometry={rg(0.36, 0.06, 0.03, 0.03)} material={softMat} position={[0.0, 0.3, 0.05]} />
          <mesh geometry={rg(1.1, 0.5, 0.10, 0.04)} material={tintMat} position={[0, -0.05, 0.05]} />
          <mesh
            ref={heartMesh}
            geometry={heartGeo}
            material={heartMat}
            position={[-0.42, -0.42, 0.06]}
            scale={[2.4, 2.4, 2.4]}
            castShadow
          />
          <mesh geometry={rg(0.45, 0.06, 0.03, 0.03)} material={softMat} position={[0.05, -0.42, 0.05]} />
        </group>

        {/* Target card */}
        <group ref={tgtNode} position={[1.9, -0.75, 0.15]}>
          <mesh geometry={rg(1.3, 1.0, 0.16, 0.08)} material={cardMat} position={[0, 0, 0]} castShadow receiveShadow />
          <mesh geometry={torus1Geo} material={softMat} position={[-0.33, 0, 0.05]} />
          <mesh geometry={torus2Geo} material={tintMat} position={[-0.33, 0, 0.05]} />
          <mesh geometry={sphereGeo} material={targetMat} position={[-0.33, 0, 0.07]} />
          <mesh geometry={rg(0.4, 0.07, 0.03, 0.03)} material={inkMat} position={[0.32, 0.08, 0.05]} />
          <mesh geometry={rg(0.3, 0.06, 0.03, 0.03)} material={softMat} position={[0.27, -0.08, 0.05]} />
        </group>
      </group>
    </>
  );
}
