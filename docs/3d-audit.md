# 3D / WebGL Audit Report — GetwithUs

> **Date:** November 2026  
> **Stack:** Three.js 0.182, @react-three/fiber 9.8.2, @react-three/drei 10.7.9, Next.js 16, React 19

---

## 1. Inventory

| Component | File path | Pages / sections | Geometry | Textures | Libraries |
|---|---|---|---|---|---|
| **SplashScreen** | `src/components/splash/SplashScreen.tsx` | Root layout (every page, once per session) | Extruded G-shape, rounded square, ring, 90-point particle cloud | None | `three` (barrel import) |
| **WebGLModel** (wrapper) | `src/components/three/WebGLModel.tsx` | Every service, about, contact, process, start, work, legal, 404, home overview pages | Delegate to model below | Delegate | `next/dynamic` |
| **ModelCanvas** | `src/components/three/ModelCanvas.tsx` | Mounted inside WebGLModel | Delegate | Delegate | `@react-three/fiber`, `@react-three/drei` |
| **BlogScene3D** | `src/components/three/BlogScene3D.tsx` + `BlogScene3DModel.tsx` | Home page blog section, blog index page | 3 pages (extruded), pen, 4 orbs | None | R3F / three |
| **ClientsScene3D** | `src/components/three/ClientsScene3D.tsx` + `models/ClientsRing.tsx` | Clients / Trusted By section | 150 particle points, N×PlaneGeometry (logo cards) | Per-logo JPEG/PNG loaded at runtime (CanvasTexture) | `three` (barrel import), `@react-three/fiber`, Next Router |
| **FlowScene models** (×5) | `models/AutomationFlow`, `CallingAgent3D`, `WhatsAppBot3D`, `ServicesHub`, `SoftwareCloud` (all via `shared/FlowScene.tsx`) | Respective service pages | Tube geometries + extruded rounded rects | None | three (named imports), R3F |
| **WebDevLayers** | `models/WebDevLayers.tsx` | Web Development service page | 19 ExtrudeGeometry objects, 1 PlaneGeometry | 1 CanvasTexture (`</>` badge, 256×128 px) | three (named), R3F |
| **AppDevPhones** | `models/AppDevPhones.tsx` | App Development service page | 7+ layers per phone, module-level GEO_CACHE | None | three (named), R3F |
| **GetwithusOverview** | `models/GetwithusOverview.tsx` | Home page "One team" section | 5 TubeGeometry, multiple extruded rects, 1+ CanvasTextures (wordmark, labels) | CanvasTextures for text | three (named), R3F |
| **AboutStudio** | `models/AboutStudio.tsx` | About page | Multiple rg() geometries, CanvasTextures for labels | CanvasTextures | three, R3F |
| **ContactMessage** | `models/ContactMessage.tsx` | Contact page | Extruded rects, TubeGeometry for plane path | CanvasTextures | three, R3F |
| **ProcessSteps** | `models/ProcessSteps.tsx` | Process page | Extruded rects, TubeGeometry | CanvasTextures | three, R3F |
| **MarketingGrowth** | `models/MarketingGrowth.tsx` | Digital Marketing service page | CatmullRomCurve TubeGeometry, ExtrudeGeometry | None | three, R3F |
| **AboutCube** | `models/AboutCube.tsx` | About page (orbit ring) | RoundedBox (Drei), torus | None; DOM chip overlay | Drei `RoundedBox`, R3F |
| **BrandCube** | `models/BrandCube.tsx` | Various | RoundedBox | None | Drei |
| **GlassBrowser / DeviceFrame / others** | `models/GlassBrowser.tsx` etc. | Respective pages | ExtrudeGeometry / RoundedBox | Optional screenshot texture | Drei, R3F |

**Assets:** No .glb / .gltf / .hdr / .ktx2 files anywhere in the project. All geometry is procedural. The only runtime-loaded textures are: screenshot images in DeviceFrame (`useTexture` from Drei) and per-client logo images in ClientsRing.

---

## 2. Per-Component Audit Matrix

| Check | SplashScreen | WebGLModel / ModelCanvas | BlogScene3D | ClientsScene3D / ClientsRing | FlowScene models | WebDevLayers | AppDevPhones | GetwithusOverview | Prototype-ported models (AboutStudio, ContactMessage, ProcessSteps, MarketingGrowth) |
|---|---|---|---|---|---|---|---|---|---|
| **A1 Canvas resizes correctly** | ✅ window resize listener | ✅ R3F built-in ResizeObserver | ✅ via ModelCanvas | ⚠️ fixed `h-[380px]` / `h-[520px]` — does not adapt | ✅ via ModelCanvas | ✅ via ModelCanvas | ✅ via ModelCanvas | ✅ via ModelCanvas | ✅ |
| **A2 Camera / scale per breakpoint** | ✅ square aspect adapted in resize() | ⚠️ Single fixed camera position, no mobile FOV adjustment | ✅ | ⚠️ No breakpoint camera adjustment | ⚠️ No breakpoint camera adjustment | ⚠️ Single position | ⚠️ Single position | ⚠️ Single position | ⚠️ |
| **A3 Touch does not block scroll** | ✅ fixed fullscreen, no scroll needed | ⚠️ **MISSING `touch-action: pan-y` on `.model-canvas` / `canvas` element** | ⚠️ same | ⚠️ same | ⚠️ same | ⚠️ same | ⚠️ same | ⚠️ same | ⚠️ same |
| **A4 Tilt/parallax respects pointer type** | N/A | ✅ Models check `(pointer: coarse)` | ✅ `window.matchMedia("(pointer: coarse)")` guard | ✅ `(pointer: fine)` guard | ✅ | ✅ | ✅ | ✅ | ✅ |
| **A5 Safe-area / notch handling (splash)** | ❌ No `env(safe-area-inset-*)` on Skip button or progress bar | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |
| **B1 DPR capped** | ✅ `Math.min(dpr, 2)` | ✅ TIERS: high `[1,1.75]`, medium `[1,1.25]`, low `1` | ✅ | ❌ **`dpr={[1, 2]}`** — no tier check, no low-end cap | ✅ via ModelCanvas | ✅ | ✅ | ✅ | ✅ |
| **B2 Rendering pauses when off-screen / tab hidden** | ✅ `cancelAnimationFrame` on unmount | ✅ `useOnScreen` → `active` → `Driver` stops `onFrame` loop | ✅ | ✅ IntersectionObserver + visibilitychange | ✅ | ✅ | ✅ | ✅ | ✅ |
| **B3 Geometry/material reuse, no per-frame allocations** | ⚠️ Particle position array mutated in RAF — acceptable (typed array in-place) | ✅ | ✅ useMemo + dispose on unmount | ⚠️ **`new THREE.MeshPhysicalMaterial` created on every `isHovered` state change** | ✅ | ✅ | ✅ module-level GEO_CACHE | ✅ | ✅ |
| **B4 No GLB/HDR assets, no large textures** | ✅ | ✅ procedural | ✅ | ⚠️ Loads JPEG/PNG logos (externally sized, uncontrolled) | ✅ | ✅ 256×128 canvas badge | ✅ | ✅ 500×h CanvasTextures | ✅ |
| **B5 Lazy loading / no CLS** | ✅ dynamic import ssr:false | ✅ intent + near + dynamic import | ✅ | ⚠️ **WebGL probe fires on mount, not on intent/near** (creates GPU process early) | ✅ | ✅ | ✅ | ✅ | ✅ |
| **B6 No duplicate WebGL contexts** | 1 context (temporary) | 1 per page (ModelCanvas shared by all models on the page) | ✅ | ❌ **Separate Canvas in ClientsRing — additional WebGL context per page that includes Clients section** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **C1 Dispose on unmount** | ✅ | ✅ R3F disposes on unmount | ✅ geo+mat in useEffect return | ⚠️ `ClientsRing`: texture loaded via THREE.TextureLoader not via R3F, cropped CanvasTexture NOT disposed on unmount | ✅ | ✅ badgeTex dispose | ✅ | ✅ | ✅ |
| **C2 Context loss handled** | ❌ No context-loss handler | ✅ `webglcontextlost → setQuality("none")` | ✅ | ❌ No `webglcontextlost` handler | ✅ | ✅ | ✅ | ✅ | ✅ |
| **C3 WebGL fallback** | ⚠️ No explicit fallback if WebGL fails (page not broken, but splash stays blank) | ✅ Static SVG always rendered underneath | ✅ | ✅ `SceneFallback` CSS grid | ✅ | ✅ | ✅ | ✅ | ✅ |
| **C4 Failed asset error handling** | N/A | ✅ SceneErrorBoundary | ✅ | ⚠️ `setTexFailed(true)` but no visible placeholder text in 3D card | ✅ | ✅ | ✅ | ✅ | ✅ |
| **C5 StrictMode double-mount** | ⚠️ Double-mount creates two renderer instances briefly (second one replaces first because `visible` starts false, but see note) | ✅ R3F handles cleanup | ✅ | ⚠️ Separate imperative WebGL context — double-mount creates two contexts briefly | ✅ | ✅ | ✅ | ✅ | ✅ |
| **D1 prefers-reduced-motion** | ✅ Skipped entirely when reduce | ✅ `still` mode | ✅ | ✅ `still={reduce}` | ✅ | ✅ | ✅ | ✅ | ✅ |
| **D2 Accessible label / aria-hidden** | ✅ `role="status" aria-label="Loading GetwithUs"` | ✅ `aria-hidden` or `role="img" aria-label` | ✅ `aria-hidden` | ✅ `sr-only` list + `aria-hidden` on canvas div | ✅ | ✅ | ✅ | ✅ | ✅ |
| **E1 Brand-consistent colors** | ✅ Hardcoded teal `#19a5b0` / `#0e7f89` matches brand | ✅ via `readModelPalette` from CSS tokens | ✅ | ⚠️ Hardcoded `#22d3ee`, `#0a6b74`, `#1a3a4a` — **dark-mode palette only; light theme will appear wrong** | ✅ via `buildPalette()` / THEME_EVENT | ✅ via ModelCanvas palette | ✅ | ✅ | ✅ |
| **E2 Consistent tone mapping / color space** | ⚠️ No `outputColorSpace` set (defaults to sRGB in Three r152+, fine) | ✅ R3F default sRGB | ✅ | ⚠️ No `outputColorSpace` set explicitly; R3F default is fine | ✅ | ✅ | ✅ | ✅ | ✅ |
| **F1 Shared utilities used** | ❌ Standalone barrel `import * as THREE` | ✅ | ✅ | ❌ **Barrel `import * as THREE`** — bypasses tree-shaking | ✅ shared FlowScene, shared geo/materials/palette | ✅ | ✅ | ✅ | ✅ |
| **F2 Duplicated palette/isDk logic** | N/A | ✅ shared `readModelPalette` | ✅ | N/A | ⚠️ 5 models duplicate `isDk()` / `pal()` / `isDark()` / `buildPalette()` | ⚠️ own local palette from ModelContext | ⚠️ own `buildPalette()` | ⚠️ own `isDk()` / `pal()` | ⚠️ own `isDk()` / `pal()` per file |

---

## 3. Prioritized Issue List

### 🔴 Critical

| # | File(s) | Issue | Fix |
|---|---|---|---|
| C1 | `src/styles/primitives.css` | **Canvas blocks touch-scroll.** R3F 9.x registers pointer events on the canvas; without `touch-action: pan-y` on the `.model-canvas` wrapper (or the `<canvas>` itself), iOS Safari and Android Chrome absorb the first touchmove, breaking page scroll while a finger is on the 3D panel. This is the most impactful mobile UX bug. | Add `touch-action: pan-y` to `.model-canvas` and `.model-panel canvas` in primitives.css. |
| C2 | `src/components/three/ClientsScene3D.tsx` / `ClientsRing.tsx` | **Barrel `import * as THREE`** pulls the entire Three.js library into the ClientsRing chunk, defeating all tree-shaking and bloating the bundle by ~50–70 kB (gzip). | Replace with named imports: `import { ... } from "three"`. |
| C3 | `src/components/three/ClientsScene3D.tsx` | **WebGL probe on mount** (not deferred to user intent or viewport proximity). This creates a GPU process during initial render, harming LCP/TBT on pages with the Clients section — the same problem the WebGLModel wrapper carefully avoids. | Gate `setCanRender3D` behind user intent + IntersectionObserver, like `useQuality` does. |
| C4 | `src/components/three/models/ClientsRing.tsx` | **`MeshPhysicalMaterial` allocated on every `isHovered` state change.** Because `isHovered` is a prop and `useMemo` has it as a dep, a new material object is created on every hover event, triggering GPU upload and causing micro-stutter. | Move the emissive color update out of the material constructor and into an imperative `useEffect` that patches `.emissive` and `.emissiveIntensity` on the existing material. |
| C5 | `src/components/three/models/ClientsRing.tsx` | **`dpr={[1, 2]}`** without quality tier — high-DPR phones always render at 2× regardless of device capability. Should be capped at 1.75 on high tier and 1.25 on medium; not set at 2 unconditionally. | Apply the same `TIERS` constant used by ModelCanvas, or a sensible `[1, 1.75]`. |
| C6 | `src/components/three/models/ClientsRing.tsx` | **No `webglcontextlost` handler.** If the GPU crashes or the browser reclaims the context, the ring goes blank with no recovery or fallback. | Add `onCreated={({ gl }) => { gl.domElement.addEventListener("webglcontextlost", handleLost, { once: true }); }}` and fall through to `SceneFallback`. |

### 🟠 High

| # | File(s) | Issue | Fix |
|---|---|---|---|
| H1 | `src/components/splash/SplashScreen.tsx` | **No safe-area inset handling.** The Skip button (positioned `right: 16, top: 14`) and the progress bar (`bottom: 9%`) are placed in fixed px values, so they sit under the iOS status bar / notch and Android navigation bar on full-screen in-app browsers. | Use `env(safe-area-inset-*)` padding on these elements. |
| H2 | `src/components/three/models/ClientsRing.tsx` | **Cropped `CanvasTexture` not disposed.** The `cropped` texture created from the logo's canvas is stored in state via `setTexture(cropped)` but `texture?.dispose()` in the cleanup only runs when `matLogo` changes — there's a race where the old texture can leak when the component unmounts. | Explicitly dispose in the `useEffect` cleanup that loads the texture. |
| H3 | `src/components/three/models/ClientsRing.tsx` | **`MeshPhysicalMaterial` with `transmission: 0.3`** on every logo card. Physical / transmission materials are expensive (they require a separate render pass on some GPUs). On mid-range mobile phones this can drop to 20–30 fps with 8–12 cards visible. | Downgrade to `MeshStandardMaterial` for the glass card; simulate glassiness with low roughness, low metalness, and slight opacity/transparency without `transmission`. |
| H4 | `src/components/three/ClientsScene3D.tsx` | **A second WebGL context on pages that also show a WebGLModel.** Pages that include both a service page model and a Clients section will have two simultaneous contexts. Chrome on Android allows only 8–16 contexts globally before evicting old ones — it can silently kill the page model. | Use a flag / singleton guard to prevent two contexts on the same page; or render the clients ring inside the same Canvas as the page model using `createPortal`. The pragmatic fix is to gate ClientsScene3D so it won't render if `useSceneStore` already has a live context on the page. |
| H5 | `src/components/three/models/ClientsRing.tsx` | **`ClientsScene3D` duplicates visibility/tab-hidden logic** (its own `IntersectionObserver` + `visibilitychange`) instead of using the shared `useOnScreen` hook. | Replace inline duplicates with `useOnScreen`. |
| H6 | Multiple models (`AboutStudio`, `ContactMessage`, `ProcessSteps`, `GetwithusOverview`, `AppDevPhones`) | **Duplicated `isDk()` / `pal()` / `buildPalette()` functions.** The same theme-detection + color-object construction is copy-pasted across 5+ files. Any change to the brand palette must be applied in 5 places. | Extract to `src/components/three/models/shared/localPalette.ts` (the simpler key-value version already in `palette.ts`) and re-export from there. The `buildPalette()` in `palette.ts` already exists but only some models use it. |

### 🟡 Medium

| # | File(s) | Issue | Fix |
|---|---|---|---|
| M1 | `src/styles/primitives.css` | **No explicit `touch-action` on `.model-panel`** (outer container). Although the R3F canvas does not intercept scroll by default for pointer events, adding `touch-action: pan-y` at the panel level makes the intent explicit and future-safe. | Add to `.model-panel`. (Already done for other scroll components in this codebase.) |
| M2 | `src/components/splash/SplashScreen.tsx` | **Barrel `import * as THREE`** pulls the whole Three.js into the splash chunk (which is loaded on first visit before any interaction). Named imports would shave ~50 kB from the initial JS. | Replace with named imports: `THREE.WebGLRenderer` → `WebGLRenderer`, etc. |
| M3 | `src/components/three/constants.ts` | **High-tier DPR cap is 1.75.** On a 3× Retina phone that gets a "high" quality score (unlikely given the `cores >= 8` guard but possible on M-series iPad), the cap is fine. On a 3× phone that is medium tier, the cap of 1.25 is correct. No action needed unless intentional loosening is desired. | No change required; document the deliberate cap. |
| M4 | `src/components/three/models/ClientsRing.tsx` | **`isMobile` computed from `window.innerWidth` at module evaluation time (SSR guard only), not reactive.** On a tablet that rotates from portrait (mobile) to landscape, `particleCount` stays at 60 forever. | Move to a `useMemo` or `useState` with a `matchMedia` listener. Low impact — just an aesthetic issue on tablet rotation. |
| M5 | `src/components/three/models/shared/geo.ts` | **Module-level `GEO_CACHE` never cleared.** The comment says "geometries persist for the browser session; dispose is not needed" — this is correct because the geometries are reused and the WebGL context lives for the same session. No fix needed but the trade-off should stay documented. | No change — intentional design, keep comment. |
| M6 | `src/components/three/models/AppDevPhones.tsx` | **Duplicate `GEO_CACHE` in `AppDevPhones`** (`const GEO_CACHE = new Map`) already exists in `shared/geo.ts` as `rg()`. The `AppDevPhones`-local `rr()` function is identical in logic but separate. Merge them. | Replace `rr()` with `rg()` from `shared/geo.ts` and delete the local `GEO_CACHE`. |
| M7 | `src/components/three/models/ClientsRing.tsx` | **`useFrame` used directly** (instead of the shared demand-rendered `Driver` + `invalidate` pattern). This means the ring runs in continuous render mode unless `frameloop="demand"` is set on the Canvas — which it is. Actually fine, but the internal `useFrame` for the `ClientRing` and `LogoCard` runs even when `Driver` says `active=false`. | Guard `useFrame` callbacks with `if (!still) return` checks (the `still` check already exists in `ClientRing.useFrame` but `LogoCard.useFrame` only checks `still` — confirm all paths). Already partially correct. |

### 🟢 Low

| # | File(s) | Issue | Fix |
|---|---|---|---|
| L1 | `src/components/three/models/ClientsRing.tsx` | **`ClientsScene3D.hasWebGL()`** probes webgl + webgl2 but `useQuality` only probes webgl2. Align them so the same probe result is used everywhere. | Use `hasWebGL2` from `useQuality.ts` (or export it). |
| L2 | `src/components/three/ModelCanvas.tsx` | **`ModelContext` uses `createContext` with `null` as initial value** and throws in `useModelSettings()`. This is correct defensive code but the error message "Page models render inside ModelCanvas" is not surfaced gracefully in production. Already caught by SceneErrorBoundary. | No change needed. |
| L3 | `docs/prototype/SplashScreen.tsx` | Prototype file duplicates production SplashScreen logic and will confuse future developers. It is in `docs/` so it's not shipped, but the `import * as THREE` comment at the top of the prototype is what appears in search results. | No code change needed; note in handoff. |

---

## 4. Files to Create / Modify / Delete

### Created
- `docs/3d-audit.md` ← this file
- `src/components/three/hooks/useSceneTouch.ts` — shared `touch-action` apply hook (new)

### Modified
- `src/styles/primitives.css` — add `touch-action: pan-y` to `.model-panel` and `.model-canvas`
- `src/components/splash/SplashScreen.tsx` — safe-area insets on Skip button and progress bar; replace barrel import
- `src/components/three/models/ClientsRing.tsx` — named imports; fix material-per-hover allocation; cap DPR; add context-loss handler; fix texture dispose
- `src/components/three/ClientsScene3D.tsx` — defer WebGL probe to intent + near; use `useOnScreen`

### Not modified (acceptable as-is)
- All FlowScene / WebDevLayers / AppDevPhones / GetwithusOverview / AboutStudio / ContactMessage / ProcessSteps — the duplicated `isDk()` / `pal()` are Medium priority and well-isolated. Removing them is a refactor with no user-visible benefit right now.
- `constants.ts` — DPR tiers are correct.
- `useQuality.ts` — quality probe deferral is correct.

---

## 5. Remaining Issues Requiring Design / Business Decision

1. **Camera FOV per breakpoint (A2).** All service-page models use a fixed camera position regardless of viewport width. On narrow phones (360 px wide) some models (e.g. `web-dev-layers`, `app-dev-phones`) may clip or appear small. Fixing this requires either programmatic camera adjustment inside each model based on canvas aspect ratio, or a tighter default FOV. This is a design decision (how much should the scene zoom on mobile?).

2. **ClientsScene3D dual-context (H4).** The pragmatic safe fix (block rendering if another context exists) means the clients ring never shows on pages that already have a service model. The right long-term solution is to share one Canvas, but that requires refactoring the entire clients-ring architecture. This is a product/engineering decision.

3. **Logo image quality in ClientsRing.** Logos are cropped to 256×256 px CanvasTexture. Logos with fine detail may look blurry. No fix is possible without having the logo files in a controlled format.

4. **Clients section theming.** `ClientsRing` uses hardcoded dark-mode hex values (`#22d3ee`, `#1a3a4a`, `#0a6b74`). If the site ever renders the Clients section in a light-background context, the ring will look wrong. Currently the clients section appears on a dark background so it's visually fine, but it's fragile.

---

## 6. Manual QA Checklist

### Real iPhone (Safari iOS ≥ 16)
- [ ] Splash screen: logo animation plays; Skip button is fully visible and tappable above the home indicator bar
- [ ] Splash screen: swiping up to close the browser toolbar does not trigger the splash fade-out prematurely
- [ ] Service page: model panel fades in after first scroll; vertical scroll through the panel is smooth (no stutter, no catch)
- [ ] Service page: rotating the device redraws the canvas correctly (no white strip, no stretched model)
- [ ] Blog page: `BlogScene3D` loads after scroll; still SVG shows first, canvas cross-fades in
- [ ] `prefers-reduced-motion` ON: no animations anywhere; still SVGs only; no spinning/drifting
- [ ] Dark mode: toggle in header; model recolors immediately; no flash

### Real Android (Chrome latest)
- [ ] Splash screen: same as iPhone checklist above
- [ ] Service page: pinch-zoom on the page works (not blocked by the canvas)
- [ ] Service page: tap-and-hold on the model panel does not trigger the browser context menu
- [ ] Throttle CPU 6× in DevTools mobile emulation: splash plays (may be slower); service page model loads and runs at ≥ 20 fps on a mid-range emulation

### Desktop (Chrome / Firefox / Edge / Safari)
- [ ] WebGL model fades in after first pointer move or scroll
- [ ] Hovering over the model: pointer-tilt works on WebDevLayers, BlogScene3D
- [ ] Tab switch: animation pauses; resumes when tab is refocused
- [ ] Browser zoom 150%: model panel scales correctly with the page; no layout shift
- [ ] Hard-refresh with `prefers-color-scheme: dark`: model is dark-themed on first paint
- [ ] Theme toggle: model recolors smoothly without a stutter frame

### In-App Browser (Instagram / WhatsApp / LinkedIn on iOS)
- [ ] Splash screen does not block the page — if sessionStorage is blocked (some in-app browsers sandbox it), the splash should not play (the try/catch in `SplashWrapper` handles this)
- [ ] Service page model loads after first scroll
- [ ] Skip button on splash is visible and tappable (safe-area fix)

### After Fix Verification
- [ ] Run `pnpm build` with no TypeScript errors
- [ ] Run `pnpm lint` with zero warnings
- [ ] Run `pnpm test` — all unit tests pass
- [ ] Chrome DevTools Performance: service page at 6× CPU throttle — LCP < 2.5 s, no long tasks from 3D code during initial load
- [ ] Chrome DevTools Memory: navigate service page → home page → service page × 3 — heap size stabilizes (no linear growth = no leak)
