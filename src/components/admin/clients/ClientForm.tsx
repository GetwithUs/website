"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ClientView, ClientMilestoneView } from "@/features/clients/types";
import { cn } from "@/lib/cn";

type MilestoneRow = {
  id?: string;
  title: string;
  description: string;
  milestoneDate: string;
  sortOrder: number;
};

type ClientFormProps = {
  client?: ClientView & { milestones?: ClientMilestoneView[] };
  milestones?: ClientMilestoneView[];
};

function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function TagInput({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState("");

  function add() {
    const trimmed = input.trim();
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed]);
      setInput("");
    }
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-ink">{label}</label>
      <div className="flex flex-wrap gap-2 rounded-control border border-line bg-card p-2">
        {values.map((v, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 rounded-full border border-line bg-bg-soft px-2.5 py-0.5 text-xs font-medium text-body"
          >
            {v}
            <button
              type="button"
              onClick={() => onChange(values.filter((_, j) => j !== i))}
              className="text-muted hover:text-err"
              aria-label={`Remove ${v}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add();
            }
          }}
          onBlur={add}
          placeholder={placeholder ?? "Type and press Enter"}
          className="min-w-24 flex-1 bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none"
        />
      </div>
    </div>
  );
}

const inputClasses =
  "w-full rounded-control border border-line bg-card px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent";
const labelClasses = "mb-1 block text-sm font-semibold text-ink";
const fieldClasses = "grid gap-1";

export default function ClientForm({ client, milestones: initialMilestones }: ClientFormProps) {
  const router = useRouter();
  const isEdit = !!client;
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [logoUrl, setLogoUrl] = useState(client?.logoUrl ?? "");
  const [coverUrl, setCoverUrl] = useState(client?.coverImageUrl ?? "");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [name, setName] = useState(client?.name ?? "");
  const [slug, setSlug] = useState(client?.slug ?? "");
  const [slugLocked, setSlugLocked] = useState(isEdit);
  const [industry, setIndustry] = useState(client?.industry ?? "");
  const [tagline, setTagline] = useState(client?.tagline ?? "");
  const [projectBrief, setProjectBrief] = useState(client?.projectBrief ?? "");
  const [services, setServices] = useState<string[]>(client?.servicesDelivered ?? []);
  const [techStack, setTechStack] = useState<string[]>(client?.techStack ?? []);
  const [highlights, setHighlights] = useState<string[]>(client?.resultHighlights ?? []);
  const [projectUrl, setProjectUrl] = useState(client?.projectUrl ?? "");
  const [linkType, setLinkType] = useState(client?.linkType ?? "none");
  const [testimonialText, setTestimonialText] = useState(client?.testimonialText ?? "");
  const [testimonialAuthor, setTestimonialAuthor] = useState(client?.testimonialAuthor ?? "");
  const [startDate, setStartDate] = useState(
    client?.startDate ? client.startDate.toISOString().split("T")[0] : "",
  );
  const [endDate, setEndDate] = useState(
    client?.endDate ? client.endDate.toISOString().split("T")[0] : "",
  );
  const [isFeatured, setIsFeatured] = useState(client?.isFeatured ?? false);
  const [displayOrder, setDisplayOrder] = useState(client?.displayOrder ?? 0);
  const [status, setStatus] = useState<"draft" | "published">(client?.status ?? "draft");
  const [milestones, setMilestones] = useState<MilestoneRow[]>(
    (initialMilestones ?? []).map((m) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      milestoneDate: m.milestoneDate ? m.milestoneDate.toISOString().split("T")[0] : "",
      sortOrder: m.sortOrder,
    })),
  );

  // Slug handled in name input onChange
  async function uploadImage(
    file: File,
    onUrl: (url: string) => void,
    setUploading: (v: boolean) => void,
  ) {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/v1/clients/upload", { method: "POST", body: form });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Upload failed");
      onUrl(data.url);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function addMilestone() {
    setMilestones([
      ...milestones,
      { title: "", description: "", milestoneDate: "", sortOrder: milestones.length },
    ]);
  }

  function removeMilestone(i: number) {
    setMilestones(milestones.filter((_, j) => j !== i));
  }

  function updateMilestone(i: number, field: keyof MilestoneRow, value: string | number) {
    setMilestones(milestones.map((m, j) => (j === i ? { ...m, [field]: value } : m)));
  }

  function moveMilestone(i: number, dir: "up" | "down") {
    if (dir === "up" && i === 0) return;
    if (dir === "down" && i === milestones.length - 1) return;
    const next = [...milestones];
    const swap = dir === "up" ? i - 1 : i + 1;
    [next[i], next[swap]] = [next[swap]!, next[i]!];
    setMilestones(next.map((m, j) => ({ ...m, sortOrder: j })));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name,
      slug: slug || undefined,
      industry,
      tagline,
      logoUrl: logoUrl || null,
      coverImageUrl: coverUrl || null,
      projectBrief,
      servicesDelivered: services,
      techStack,
      resultHighlights: highlights,
      projectUrl: projectUrl || null,
      linkType,
      testimonialText: testimonialText || null,
      testimonialAuthor: testimonialAuthor || null,
      startDate: startDate ? new Date(startDate).toISOString() : null,
      endDate: endDate ? new Date(endDate).toISOString() : null,
      isFeatured,
      displayOrder,
      status,
    };

    try {
      let clientId: string;
      if (isEdit) {
        const res = await fetch(`/api/v1/clients/${client.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = (await res.json()) as { client?: ClientView; error?: unknown };
        if (!res.ok) throw new Error("Save failed");
        clientId = data.client?.id ?? client.id;
      } else {
        const res = await fetch("/api/v1/clients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = (await res.json()) as { client?: ClientView; error?: unknown };
        if (!res.ok) throw new Error("Create failed");
        clientId = data.client!.id;
      }

      // Save milestones
      await fetch(`/api/v1/clients/${clientId}/milestones`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          milestones.map((m, i) => ({
            title: m.title,
            description: m.description,
            milestoneDate: m.milestoneDate ? new Date(m.milestoneDate).toISOString() : null,
            sortOrder: i,
          })),
        ),
      });

      toast.success(isEdit ? "Client updated" : "Client created");
      router.push("/admin/clients");
    } catch {
      toast.error("Could not save client");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!client || !confirm(`Delete "${client.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/v1/clients/${client.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Client deleted");
      router.push("/admin/clients");
    } catch {
      toast.error("Could not delete client");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8">
      {/* Basic info */}
      <section className="grid gap-4 rounded-card border border-line bg-card p-6">
        <h2 className="type-h4 text-ink">Basic information</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className={fieldClasses}>
            <label htmlFor="cf-name" className={labelClasses}>
              Name <span className="text-err">*</span>
            </label>
            <input
              id="cf-name"
              required
              value={name}
              onChange={(e) => {
                const val = e.target.value;
                setName(val);
                if (!slugLocked) setSlug(slugify(val));
              }}
              className={inputClasses}
              placeholder="Sharma Retail Group"
            />
          </div>
          <div className={fieldClasses}>
            <label htmlFor="cf-slug" className={labelClasses}>
              Slug
            </label>
            <div className="flex gap-2">
              <input
                id="cf-slug"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugLocked(true);
                }}
                className={cn(inputClasses, "flex-1")}
                placeholder="sharma-retail-group"
              />
              {slugLocked && (
                <button
                  type="button"
                  onClick={() => setSlugLocked(false)}
                  className="shrink-0 rounded-control border border-line bg-card px-2 text-xs text-muted hover:text-ink"
                >
                  Auto
                </button>
              )}
            </div>
          </div>
          <div className={fieldClasses}>
            <label htmlFor="cf-industry" className={labelClasses}>
              Industry <span className="text-err">*</span>
            </label>
            <input
              id="cf-industry"
              required
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className={inputClasses}
              placeholder="Retail & E-commerce"
            />
          </div>
          <div className={fieldClasses}>
            <label htmlFor="cf-tagline" className={labelClasses}>
              Tagline <span className="text-err">*</span>
            </label>
            <input
              id="cf-tagline"
              required
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className={inputClasses}
              placeholder="Short, punchy one-liner about the client"
            />
          </div>
        </div>
      </section>

      {/* Images */}
      <section className="grid gap-4 rounded-card border border-line bg-card p-6">
        <h2 className="type-h4 text-ink">Images</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Logo */}
          <div className={fieldClasses}>
            <label className={labelClasses}>Logo</label>
            {logoUrl && (
              <div className="relative mb-2 h-16 w-32 rounded border border-line p-1">
                <Image
                  src={logoUrl}
                  alt="Logo preview"
                  fill
                  unoptimized
                  className="object-contain"
                />
              </div>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/svg+xml"
              disabled={uploadingLogo}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadImage(f, setLogoUrl, setUploadingLogo);
              }}
              className="text-sm text-body"
            />
            {uploadingLogo && <p className="text-xs text-muted">Uploading…</p>}
            {logoUrl && (
              <input
                type="text"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className={cn(inputClasses, "mt-1 text-xs")}
                placeholder="Blob URL"
              />
            )}
          </div>
          {/* Cover */}
          <div className={fieldClasses}>
            <label className={labelClasses}>Cover image</label>
            {coverUrl && (
              <div className="relative mb-2 h-20 w-full overflow-hidden rounded border border-line">
                <Image
                  src={coverUrl}
                  alt="Cover preview"
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={uploadingCover}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadImage(f, setCoverUrl, setUploadingCover);
              }}
              className="text-sm text-body"
            />
            {uploadingCover && <p className="text-xs text-muted">Uploading…</p>}
            {coverUrl && (
              <input
                type="text"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                className={cn(inputClasses, "mt-1 text-xs")}
                placeholder="Blob URL"
              />
            )}
          </div>
        </div>
      </section>

      {/* Project brief */}
      <section className="grid gap-4 rounded-card border border-line bg-card p-6">
        <h2 className="type-h4 text-ink">Project brief</h2>
        <p className="type-small text-muted">
          Plain Markdown. Use ## headings, bullet lists, and bold text.
        </p>
        <textarea
          value={projectBrief}
          onChange={(e) => setProjectBrief(e.target.value)}
          rows={12}
          className={cn(inputClasses, "resize-y font-mono text-xs")}
          placeholder="## The challenge&#10;&#10;## What we built&#10;&#10;## The result"
        />
      </section>

      {/* Services, tech, highlights */}
      <section className="grid gap-4 rounded-card border border-line bg-card p-6">
        <h2 className="type-h4 text-ink">Deliverables & results</h2>
        <TagInput
          label="Services delivered"
          values={services}
          onChange={setServices}
          placeholder="Web Development, WhatsApp Bot…"
        />
        <TagInput
          label="Tech stack"
          values={techStack}
          onChange={setTechStack}
          placeholder="Next.js, PostgreSQL…"
        />
        <TagInput
          label="Result highlights"
          values={highlights}
          onChange={setHighlights}
          placeholder="40% increase in leads…"
        />
      </section>

      {/* External link */}
      <section className="grid gap-4 rounded-card border border-line bg-card p-6">
        <h2 className="type-h4 text-ink">External link</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className={fieldClasses}>
            <label htmlFor="cf-link-type" className={labelClasses}>
              Link type
            </label>
            <select
              id="cf-link-type"
              value={linkType}
              onChange={(e) => setLinkType(e.target.value as typeof linkType)}
              className={inputClasses}
            >
              <option value="none">None</option>
              <option value="website">Website</option>
              <option value="android">Android (Google Play)</option>
              <option value="ios">iOS (App Store)</option>
            </select>
          </div>
          {linkType !== "none" && (
            <div className={fieldClasses}>
              <label htmlFor="cf-project-url" className={labelClasses}>
                URL
              </label>
              <input
                id="cf-project-url"
                type="url"
                value={projectUrl}
                onChange={(e) => setProjectUrl(e.target.value)}
                className={inputClasses}
                placeholder="https://…"
              />
            </div>
          )}
        </div>
      </section>

      {/* Dates */}
      <section className="grid gap-4 rounded-card border border-line bg-card p-6">
        <h2 className="type-h4 text-ink">Project dates</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className={fieldClasses}>
            <label htmlFor="cf-start" className={labelClasses}>
              Start date
            </label>
            <input
              id="cf-start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={inputClasses}
            />
          </div>
          <div className={fieldClasses}>
            <label htmlFor="cf-end" className={labelClasses}>
              End date
            </label>
            <input
              id="cf-end"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={inputClasses}
            />
          </div>
        </div>
      </section>

      {/* Client quote */}
      <section className="grid gap-4 rounded-card border border-line bg-card p-6">
        <h2 className="type-h4 text-ink">Client quote (optional)</h2>
        <div className={fieldClasses}>
          <label htmlFor="cf-testi-text" className={labelClasses}>
            Quote
          </label>
          <textarea
            id="cf-testi-text"
            value={testimonialText}
            onChange={(e) => setTestimonialText(e.target.value)}
            rows={3}
            className={cn(inputClasses, "resize-y")}
            placeholder="What the client said…"
          />
        </div>
        <div className={fieldClasses}>
          <label htmlFor="cf-testi-author" className={labelClasses}>
            Author
          </label>
          <input
            id="cf-testi-author"
            value={testimonialAuthor}
            onChange={(e) => setTestimonialAuthor(e.target.value)}
            className={inputClasses}
            placeholder="Name, Title, Company"
          />
        </div>
      </section>

      {/* Milestones */}
      <section className="grid gap-4 rounded-card border border-line bg-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="type-h4 text-ink">Project timeline</h2>
          <button
            type="button"
            onClick={addMilestone}
            className="rounded-control border border-line bg-card px-3 py-1.5 text-sm font-medium text-body hover:bg-card-2"
          >
            + Add milestone
          </button>
        </div>
        {milestones.length === 0 && (
          <p className="type-small text-muted">No milestones yet.</p>
        )}
        {milestones.map((m, i) => (
          <div key={i} className="grid gap-3 rounded-control border border-line bg-bg-soft p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="type-small font-semibold text-muted">Milestone {i + 1}</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  disabled={i === 0}
                  onClick={() => moveMilestone(i, "up")}
                  className="rounded px-2 py-0.5 text-xs text-muted hover:text-ink disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  disabled={i === milestones.length - 1}
                  onClick={() => moveMilestone(i, "down")}
                  className="rounded px-2 py-0.5 text-xs text-muted hover:text-ink disabled:opacity-30"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removeMilestone(i)}
                  className="rounded px-2 py-0.5 text-xs text-err hover:bg-err/10"
                >
                  Remove
                </button>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                required
                value={m.title}
                onChange={(e) => updateMilestone(i, "title", e.target.value)}
                className={inputClasses}
                placeholder="Title (e.g. Discovery)"
              />
              <input
                type="date"
                value={m.milestoneDate}
                onChange={(e) => updateMilestone(i, "milestoneDate", e.target.value)}
                className={inputClasses}
              />
            </div>
            <textarea
              value={m.description}
              onChange={(e) => updateMilestone(i, "description", e.target.value)}
              rows={2}
              className={cn(inputClasses, "resize-none")}
              placeholder="What happened at this milestone…"
            />
          </div>
        ))}
      </section>

      {/* Publishing */}
      <section className="grid gap-4 rounded-card border border-line bg-card p-6">
        <h2 className="type-h4 text-ink">Publishing</h2>
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex gap-3">
            {(["draft", "published"] as const).map((s) => (
              <label key={s} className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="status"
                  checked={status === s}
                  onChange={() => setStatus(s)}
                  className="accent-accent"
                />
                <span className="font-medium text-ink capitalize">{s}</span>
              </label>
            ))}
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="accent-accent"
            />
            <span className="font-medium text-ink">Featured</span>
          </label>
          <div className="flex items-center gap-2">
            <label htmlFor="cf-order" className="text-sm font-medium text-ink">
              Display order
            </label>
            <input
              id="cf-order"
              type="number"
              min={0}
              value={displayOrder}
              onChange={(e) => setDisplayOrder(Number(e.target.value))}
              className="w-20 rounded-control border border-line bg-card px-2 py-1.5 text-sm text-ink"
            />
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-full border border-accent bg-accent px-6 py-2.5 text-sm font-semibold text-accent-ink shadow-[0_8px_20px_var(--glow)] hover:shadow-[0_12px_30px_var(--glow)] disabled:opacity-60"
          >
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create client"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/clients")}
            className="rounded-full border border-line bg-card px-6 py-2.5 text-sm font-medium text-body hover:bg-card-2"
          >
            Cancel
          </button>
        </div>
        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-full border border-err/30 bg-err/10 px-5 py-2.5 text-sm font-medium text-err hover:bg-err/20 disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Delete client"}
          </button>
        )}
      </div>
    </form>
  );
}
