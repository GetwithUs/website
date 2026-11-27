/**
 * Rounded-rectangle ExtrudeGeometry factory with a module-level cache.
 * Identical (w, h, r, d) tuples share the same geometry object  - never rebuilt.
 * Geometries persist for the browser session; dispose is not needed.
 */
import { ExtrudeGeometry, Shape } from "three";

const GEO_CACHE = new Map<string, ExtrudeGeometry>();

export function rg(w: number, h: number, r: number, d: number, tx = 0, ty = 0, tz = 0): ExtrudeGeometry {
  const key = `${w}|${h}|${r}|${d}|${tx}|${ty}|${tz}`;
  const hit = GEO_CACHE.get(key);
  if (hit) return hit;

  const cr = Math.min(r, w / 2, h / 2);
  const x = -w / 2;
  const y = -h / 2;
  const s = new Shape();
  s.moveTo(x + cr, y);
  s.lineTo(x + w - cr, y);
  s.quadraticCurveTo(x + w, y, x + w, y + cr);
  s.lineTo(x + w, y + h - cr);
  s.quadraticCurveTo(x + w, y + h, x + w - cr, y + h);
  s.lineTo(x + cr, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - cr);
  s.lineTo(x, y + cr);
  s.quadraticCurveTo(x, y, x + cr, y);

  const geo = new ExtrudeGeometry(s, {
    depth: d,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.012,
    bevelSegments: 2,
    curveSegments: 8,
  });
  geo.translate(tx, ty, -d / 2 + tz);
  GEO_CACHE.set(key, geo);
  return geo;
}
