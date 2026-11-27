"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { toast } from "sonner";
import type { ClientView } from "@/features/clients/types";
import { cn } from "@/lib/cn";

type AdminClientsTableProps = {
  clients: ClientView[];
  total: number;
  page: number;
  pageCount: number;
  q?: string;
  status?: "draft" | "published";
};

export default function AdminClientsTable({
  clients,
  total,
  page,
  pageCount,
  q: initialQ = "",
  status: initialStatus,
}: AdminClientsTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState(initialQ);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  function navigate(params: Record<string, string | undefined>) {
    const sp = new URLSearchParams();
    if (params.q) sp.set("q", params.q);
    if (params.status) sp.set("status", params.status);
    if (params.page && params.page !== "1") sp.set("page", params.page);
    router.push(`/admin/clients?${sp.toString()}`);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate({ q: search || undefined, status: initialStatus });
  }

  async function handleToggleStatus(client: ClientView) {
    setToggling(client.id);
    const nextStatus = client.status === "published" ? "draft" : "published";
    try {
      const res = await fetch(`/api/v1/clients/${client.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(`${client.name} ${nextStatus === "published" ? "published" : "set to draft"}`);
      router.refresh();
    } catch {
      toast.error("Could not update status");
    } finally {
      setToggling(null);
    }
  }

  async function handleToggleFeatured(client: ClientView) {
    setToggling(client.id);
    try {
      const res = await fetch(`/api/v1/clients/${client.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !client.isFeatured }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(`${client.name} ${!client.isFeatured ? "featured" : "unfeatured"}`);
      router.refresh();
    } catch {
      toast.error("Could not update featured status");
    } finally {
      setToggling(null);
    }
  }

  async function handleReorder(client: ClientView, direction: "up" | "down") {
    const newOrder = direction === "up"
      ? Math.max(0, client.displayOrder - 1)
      : client.displayOrder + 1;
    try {
      const res = await fetch(`/api/v1/clients/${client.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayOrder: newOrder }),
      });
      if (!res.ok) throw new Error("Failed");
      router.refresh();
    } catch {
      toast.error("Could not reorder");
    }
  }

  async function handleDelete(client: ClientView) {
    if (!confirm(`Delete "${client.name}"? This cannot be undone.`)) return;
    setDeleting(client.id);
    try {
      const res = await fetch(`/api/v1/clients/${client.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast.success(`${client.name} deleted`);
      router.refresh();
    } catch {
      toast.error("Could not delete client");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="grid gap-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients..."
            className="h-10 rounded-control border border-line bg-card px-3 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            type="submit"
            className="h-10 rounded-control border border-line bg-card px-4 text-sm font-medium text-body hover:bg-card-2"
          >
            Search
          </button>
        </form>
        <div className="flex gap-1">
          {(["", "published", "draft"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => navigate({ q: initialQ || undefined, status: s || undefined })}
              className={cn(
                "h-10 rounded-control border px-3 text-sm font-medium transition-colors",
                (s === "" ? !initialStatus : initialStatus === s)
                  ? "border-accent bg-accent-soft text-ink"
                  : "border-line bg-card text-body hover:bg-card-2",
              )}
            >
              {s === "" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Total */}
      <p className="type-small text-muted">
        {total} client{total !== 1 ? "s" : ""}
      </p>

      {/* Table */}
      <div className="overflow-x-auto rounded-card border border-line">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-card-2">
              <th className="px-4 py-3 text-left font-semibold text-ink">Order</th>
              <th className="px-4 py-3 text-left font-semibold text-ink">Name</th>
              <th className="px-4 py-3 text-left font-semibold text-ink">Industry</th>
              <th className="px-4 py-3 text-left font-semibold text-ink">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-ink">Featured</th>
              <th className="px-4 py-3 text-left font-semibold text-ink">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client, i) => (
              <tr key={client.id} className="border-b border-line last:border-0 hover:bg-card-2">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <span className="w-8 text-center text-muted">{client.displayOrder}</span>
                    <div className="flex flex-col gap-0.5">
                      <button
                        type="button"
                        onClick={() => handleReorder(client, "up")}
                        disabled={i === 0}
                        className="rounded px-1 text-xs text-muted hover:text-ink disabled:opacity-30"
                        aria-label="Move up"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReorder(client, "down")}
                        disabled={i === clients.length - 1}
                        className="rounded px-1 text-xs text-muted hover:text-ink disabled:opacity-30"
                        aria-label="Move down"
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 font-medium text-ink">{client.name}</td>
                <td className="px-4 py-3 text-body">{client.industry}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(client)}
                    disabled={toggling === client.id}
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-opacity",
                      client.status === "published"
                        ? "bg-ok/15 text-ok hover:bg-ok/25"
                        : "bg-muted/15 text-muted hover:bg-muted/25",
                      toggling === client.id && "opacity-50",
                    )}
                  >
                    {client.status}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => handleToggleFeatured(client)}
                    disabled={toggling === client.id}
                    aria-label={client.isFeatured ? "Remove from featured" : "Mark as featured"}
                    className={cn(
                      "inline-flex items-center justify-center p-1 transition-opacity",
                      client.isFeatured ? "text-amber opacity-100" : "text-muted opacity-40 hover:opacity-70",
                      toggling === client.id && "opacity-30",
                    )}
                  >
                    <Star size={18} className={client.isFeatured ? "fill-amber" : ""} />
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/clients/${client.id}/edit`}
                      className="text-xs font-medium text-accent underline-offset-2 hover:underline"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(client)}
                      disabled={deleting === client.id}
                      className="text-xs font-medium text-err underline-offset-2 hover:underline disabled:opacity-50"
                    >
                      {deleting === client.id ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex items-center justify-between gap-4">
          <p className="type-small text-muted">
            Page {page} of {pageCount}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() =>
                navigate({ q: initialQ || undefined, status: initialStatus, page: String(page - 1) })
              }
              className="h-9 rounded-control border border-line bg-card px-3 text-sm font-medium text-body hover:bg-card-2 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= pageCount}
              onClick={() =>
                navigate({ q: initialQ || undefined, status: initialStatus, page: String(page + 1) })
              }
              className="h-9 rounded-control border border-line bg-card px-3 text-sm font-medium text-body hover:bg-card-2 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
