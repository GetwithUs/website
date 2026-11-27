"use client";

import { Component, type ReactNode } from "react";
import { logger } from "@/lib/logger";

let reported = false;

/**
 * Any error inside the 3D scene drops the page to tier "none" (the static SVG)
 * and is logged once. The marketing page is never blocked by the scene.
 */
export default class SceneErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    if (!reported) {
      reported = true;
      logger.warn("3D scene disabled for this panel after an error", { error });
    }
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
