"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useOnScreen } from "@/components/motion/useOnScreen";
import SceneErrorBoundary from "@/components/three/SceneErrorBoundary";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type ClientSceneCard = {
  name: string;
  slug: string;
  logoUrl: string | null;
};

const ClientsRing = dynamic(() => import("@/components/three/models/ClientsRing"), {
  ssr: false,
});

/** Probe WebGL2 (same check as useQuality, but isolated for this component). */
function hasWebGL2(): boolean {
  try {
    const cv = document.createElement("canvas");
    cv.width = 1;
    cv.height = 1;
    return cv.getContext("webgl2") !== null;
  } catch {
    return false;
  }
}

/** CSS fallback: grid of logo cards shown when WebGL is unavailable or the scene errors. */
function SceneFallback({ clients }: { clients: ClientSceneCard[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4" role="list">
      {clients.map((c) => (
        <Link
          key={c.slug}
          href={`/clients/${c.slug}`}
          role="listitem"
          className="flex flex-col items-center gap-2 rounded-card border border-white/10 bg-white/5 p-4 text-center text-sm font-semibold text-white transition-colors hover:bg-white/10"
        >
          {c.logoUrl ? (
            <div className="relative h-10 w-24">
              <Image
                src={c.logoUrl}
                alt={c.name}
                fill
                unoptimized
                className="object-contain opacity-80"
              />
            </div>
          ) : (
            <span className="grid h-10 w-10 place-items-center rounded-full bg-teal-800 text-xs font-bold text-white">
              {c.name.slice(0, 2).toUpperCase()}
            </span>
          )}
          {c.name}
        </Link>
      ))}
    </div>
  );
}

type ClientsScene3DProps = {
  clients: ClientSceneCard[];
  size?: "default" | "large";
  intensity?: number;
  interactive?: boolean;
};

/**
 * Lazy-loading wrapper for the 3D clients ring.
 *
 * Rendering lifecycle (matches WebGLModel's pattern):
 *  1. The CSS fallback is always visible.
 *  2. The WebGL probe runs only after the section scrolls near the viewport
 *     (IntersectionObserver + 300 px rootMargin). This avoids starting the
 *     GPU process during initial page load.
 *  3. Once near AND probed, the Canvas is mounted.
 *  4. If WebGL is unavailable, the context is lost, or SceneErrorBoundary
 *     catches an error, the CSS fallback stays permanently.
 */
export default function ClientsScene3D({
  clients,
  size = "default",
  intensity: _intensity = 1,
  interactive: _interactive = true,
}: ClientsScene3DProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  // "near" becomes true once the section is 300 px from the viewport
  const [near, setNear] = useState(false);

  // "canRender3D" is null while undecided, true if WebGL2 is available, false otherwise.
  const [canRender3D, setCanRender3D] = useState<boolean | null>(null);

  // Pause rendering when off-screen or tab hidden (shared hook).
  const onScreen = useOnScreen(wrapperRef, { threshold: 0, rootMargin: "0px" });

  const reduce = useReducedMotion();

  // Set up the near-viewport observer once.
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        setNear(true);
      },
      { rootMargin: "300px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Probe WebGL asynchronously once the section is near
  useEffect(() => {
    if (near && canRender3D === null) {
      const supported = hasWebGL2();
      requestAnimationFrame(() => setCanRender3D(supported));
    }
  }, [near, canRender3D]);

  const height = size === "large" ? "h-[520px]" : "h-[380px]";
  const active = onScreen && !reduce;

  const shouldRender = canRender3D === true && clients.length > 0;

  return (
    <div className="relative">
      {/* Keyboard-accessible hidden list (always rendered) */}
      <ul className="sr-only" aria-label="Client list">
        {clients.map((c) => (
          <li key={c.slug}>
            <a href={`/clients/${c.slug}`}>{c.name}</a>
          </li>
        ))}
      </ul>

      {/* 3D scene or fallback */}
      <div
        ref={wrapperRef}
        className={`${height} w-full overflow-hidden rounded-card`}
        aria-hidden="true"
        style={{ touchAction: "pan-y" }}
      >
        {canRender3D === false || clients.length === 0 ? (
          <SceneFallback clients={clients} />
        ) : shouldRender ? (
          <SceneErrorBoundary>
            <ClientsRing
              clients={clients}
              size={size}
              active={active}
              still={reduce}
              onContextLost={() => setCanRender3D(false)}
            />
          </SceneErrorBoundary>
        ) : (
          /* Transparent placeholder while probing or waiting for near */
          <div className={`${height} bg-transparent`} />
        )}
      </div>
    </div>
  );
}
