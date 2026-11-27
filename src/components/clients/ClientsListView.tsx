"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import type { ClientView } from "@/features/clients/types";
import { cn } from "@/lib/cn";

type ClientsListViewProps = {
  clients: ClientView[];
};

export default function ClientsListView({ clients }: ClientsListViewProps) {
  const [selectedIndustry, setSelectedIndustry] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const industries = useMemo(() => {
    const set = new Set<string>();
    for (const c of clients) {
      if (c.industry) set.add(c.industry);
    }
    return ["All", ...Array.from(set).sort()];
  }, [clients]);

  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const matchesIndustry =
        selectedIndustry === "All" || c.industry.toLowerCase() === selectedIndustry.toLowerCase();
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.industry.toLowerCase().includes(q) ||
        c.tagline.toLowerCase().includes(q) ||
        c.techStack.some((t) => t.toLowerCase().includes(q)) ||
        c.servicesDelivered.some((s) => s.toLowerCase().includes(q));

      return matchesIndustry && matchesSearch;
    });
  }, [clients, selectedIndustry, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Industry Filter Chips */}
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Industries">
          {industries.map((industry) => {
            const active = selectedIndustry === industry;
            return (
              <button
                key={industry}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedIndustry(industry)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-xs font-semibold transition-all sm:text-sm",
                  active
                    ? "bg-accent text-accent-ink shadow-sm"
                    : "border border-line bg-card text-body hover:border-accent hover:text-ink",
                )}
              >
                {industry}
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div className="relative min-w-[240px] sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, tech..."
            aria-label="Search clients"
            className="w-full rounded-full border border-line bg-card py-2 pl-9 pr-4 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      {/* Grid of Clients */}
      {filteredClients.length === 0 ? (
        <div className="rounded-card border border-line bg-card py-16 text-center">
          <p className="type-h4 text-ink">No clients found</p>
          <p className="mt-1 text-sm text-muted">
            Try adjusting your search query or selecting a different industry.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedIndustry("All");
              setSearchQuery("");
            }}
            className="mt-4 inline-flex items-center text-sm font-semibold text-accent hover:underline"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredClients.map((client) => (
            <Link
              key={client.id}
              href={`/clients/${client.slug}`}
              className="group relative flex flex-col justify-between overflow-hidden rounded-card border border-line bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent/50 hover:shadow-md"
            >
              <div>
                {/* Header: Logo / Placeholder & Industry */}
                <div className="flex items-start justify-between gap-4">
                  {client.logoUrl ? (
                    <div className="relative h-12 w-28 grayscale transition-all duration-300 group-hover:grayscale-0">
                      <Image
                        src={client.logoUrl}
                        alt={`${client.name} logo`}
                        fill
                        className="object-contain object-left"
                        sizes="112px"
                      />
                    </div>
                  ) : (
                    <div className="grid size-12 place-items-center rounded-xl border border-line bg-bg-soft font-display text-lg font-bold text-ink">
                      {client.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}

                  <span className="inline-flex rounded-full border border-line bg-bg-soft px-2.5 py-0.5 text-xs font-semibold text-muted">
                    {client.industry}
                  </span>
                </div>

                {/* Name & Tagline */}
                <h3 className="mt-5 font-display text-xl font-bold text-ink transition-colors group-hover:text-accent">
                  {client.name}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-body">
                  {client.tagline}
                </p>

                {/* Highlights */}
                {client.resultHighlights && client.resultHighlights.length > 0 && (
                  <div className="mt-6 space-y-2 border-t border-line pt-4">
                    {client.resultHighlights.slice(0, 2).map((highlight, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-xs font-medium text-ink"
                      >
                        <span className="size-1.5 rounded-full bg-accent" />
                        <span className="line-clamp-1">{highlight}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action footer */}
              <div className="mt-6 flex items-center justify-between pt-2 text-sm font-semibold text-accent">
                <span>View case study</span>
                <span className="transition-transform duration-200 group-hover:translate-x-1">
                  &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
