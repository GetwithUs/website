/**
 * The page models WebGLModel can mount, by name. The models themselves live in
 * the 3D chunk (models/index.tsx); this file only names them, so pages can pick
 * one without importing three.
 */
export type ModelKey =
  | "brand-cube"
  | "glass-browser"
  | "web-dev-layers"
  | "app-dev-phones"
  | "automation-flow"
  | "marketing-growth"
  | "software-cloud"
  | "whatsapp-bot-3d"
  | "calling-agent-3d"
  | "services-hub"
  | "process-steps"
  | "about-studio"
  | "contact-message"
  | "getwithus-overview"
  | "phone-screens"
  | "node-graph"
  | "phone-bubbles"
  | "handset-rings"
  | "funnel"
  | "server-hub"
  | "services-turntable"
  | "process-path"
  | "about-cube"
  | "folders"
  | "folders-closed"
  | "device-frame"
  | "paper-plane"
  | "assembling-cube"
  | "shield"
  | "legal-document"
  | "drifting-cube"
  | "blog";

/**
 * Props a page can hand its model: the case study screenshot and its frame,
 * plus the decorative blog scene's strength and pointer tilt toggle.
 */
export type ModelProps = {
  image?: string;
  kind?: "browser" | "phone";
  intensity?: number;
  interactive?: boolean;
};

/** Where the camera sits for a model, when the default framing does not fit it. */
export const MODEL_VIEWS: Partial<
  Record<ModelKey, { position: [number, number, number]; fov?: number }>
> = {
  "services-turntable": { position: [0, 3.4, 11.5] },
  "node-graph": { position: [0, 0.8, 8] },
  "server-hub": { position: [0, 0.4, 7.8] },
  "process-path": { position: [0, 1.4, 8.6] },
  "about-cube": { position: [0, 1.0, 8.6] },
  folders: { position: [0, 0.6, 7.8] },
  "folders-closed": { position: [0, 0.6, 7.4] },
  "paper-plane": { position: [0, 1.2, 7.8] },
  // Layered web-dev scene
  "web-dev-layers": { position: [0, 0, 9], fov: 30 },
  // Two phones side-by-side
  "app-dev-phones": { position: [0, 0, 9.5], fov: 30 },
  // Flow models  - prototype camera is (0, 0, 10), fov 30.
  "automation-flow":   { position: [0, 0, 10],   fov: 30 },
  "marketing-growth":  { position: [0, 0, 10],   fov: 30 },
  "software-cloud":    { position: [0, 0, 10],   fov: 30 },
  "whatsapp-bot-3d":   { position: [0, 0, 10],   fov: 30 },
  "calling-agent-3d":  { position: [0, 0, 10],   fov: 30 },
  // Services hub tiles reach x ≈ ±2.54; pull back to z=11.5 and widen fov to 33
  // so the tile cards never clip at the left/right edges of the 4:3 panel.
  "services-hub":      { position: [0, 0, 11.5], fov: 33 },
  // ProcessSteps back-glass is 6.6 wide. At z=11.5, fov=33 the half-width at
  // z=-0.5 is ~11.5*tan(16.5°) * (4/3) ≈ 4.57 - enough room on all sides.
  "process-steps":        { position: [0, 0, 11.5],  fov: 33 },
  "about-studio":         { position: [0, 0, 10.5], fov: 30 },
  "contact-message":      { position: [0, 0, 10.5], fov: 30 },
  "getwithus-overview":   { position: [0, 0, 10.5], fov: 30 },
  // Blog pages are 2.9 tall; orbs orbit to x=±2.05. Camera raised slightly
  // to y=0 (was 0.2) and pulled to z=8.2 so the full scene fits with margin.
  blog:                   { position: [0, 0, 8.2], fov: 34 },
};

/** Models that never move (the legal pages): drawn once, never animated. */
export const STATIC_MODELS: ReadonlySet<ModelKey> = new Set(["shield", "legal-document"]);

/**
 * Models that provide their own lights and should NOT receive ModelCanvas's
 * default <Lights>. This prevents double-lighting on prototype-ported models.
 */
export const OWN_LIGHTS_MODELS: ReadonlySet<ModelKey> = new Set([
  "web-dev-layers",
  "app-dev-phones",
  "automation-flow",
  "marketing-growth",
  "software-cloud",
  "whatsapp-bot-3d",
  "calling-agent-3d",
  "services-hub",
  "process-steps",
  "about-studio",
  "contact-message",
  "getwithus-overview",
]);
