"use client";

import { useEffect, useRef, useState } from "react";
import type { ClientMilestoneView } from "@/features/clients/types";
import { formatDate } from "@/lib/dates";

type MilestoneTimelineProps = {
  milestones: ClientMilestoneView[];
};

export default function MilestoneTimeline({ milestones }: MilestoneTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fillPercent, setFillPercent] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // When the top of container hits the middle of the screen
      const start = viewportHeight * 0.7;
      const end = viewportHeight * 0.3;

      if (rect.top > start) {
        setFillPercent(0);
      } else if (rect.bottom < end) {
        setFillPercent(100);
      } else {
        const total = rect.height;
        const progress = (start - rect.top) / total;
        setFillPercent(Math.min(100, Math.max(0, progress * 100)));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (milestones.length === 0) return null;

  return (
    <div ref={containerRef} className="relative pl-6 sm:pl-8">
      {/* Background track line */}
      <div
        aria-hidden="true"
        className="absolute bottom-2 left-2 top-2 w-0.5 bg-line"
      />
      {/* Progress fill line */}
      <div
        aria-hidden="true"
        style={{ height: `${fillPercent}%` }}
        className="absolute left-2 top-2 w-0.5 bg-accent transition-[height] duration-150 ease-out"
      />

      {/* Milestones list */}
      <div className="space-y-10">
        {milestones.map((m, idx) => (
          <div key={m.id || idx} className="relative group">
            {/* Indicator orb */}
            <div
              aria-hidden="true"
              className="absolute -left-[23px] sm:-left-[31px] top-1.5 size-4 rounded-full border-2 border-card bg-accent shadow-[0_0_8px_var(--glow)] transition-transform duration-200 group-hover:scale-125"
            />

            <div>
              {m.milestoneDate && (
                <div className="type-small font-mono uppercase text-muted">
                  {formatDate(m.milestoneDate)}
                </div>
              )}
              <h3 className="mt-1 font-display text-lg font-bold text-ink sm:text-xl">
                {m.title}
              </h3>
              {m.description && (
                <p className="mt-2 text-sm leading-relaxed text-body sm:text-base">
                  {m.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
