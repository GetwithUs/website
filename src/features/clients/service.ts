import { and, asc, count, desc, eq, ilike, not, or, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/server/db/client";
import {
  clients,
  clientMilestones,
  type Client,
  type NewClient,
  type ClientMilestone,
  type NewClientMilestone,
} from "@/server/db/schema/clients";
import { slugify } from "@/features/blog/slug";

export const CLIENTS_TAG = "clients";
export { slugify };

// ---------------------------------------------------------------------------
// Public cached reads - invalidated by CLIENTS_TAG
// ---------------------------------------------------------------------------

async function cachedPublished(limit: number): Promise<Client[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CLIENTS_TAG);
  try {
    return await db
      .select()
      .from(clients)
      .where(eq(clients.status, "published"))
      .orderBy(asc(clients.displayOrder), asc(clients.createdAt))
      .limit(limit);
  } catch {
    return [];
  }
}

async function cachedFeatured(): Promise<Client[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CLIENTS_TAG);
  try {
    return await db
      .select()
      .from(clients)
      .where(and(eq(clients.status, "published"), eq(clients.isFeatured, true)))
      .orderBy(asc(clients.displayOrder), asc(clients.createdAt));
  } catch {
    return [];
  }
}

async function cachedBySlug(slug: string): Promise<
  | (Client & { milestones: ClientMilestone[] })
  | null
> {
  "use cache";
  cacheLife("hours");
  cacheTag(CLIENTS_TAG);
  try {
    const rows = await db
      .select()
      .from(clients)
      .where(and(eq(clients.slug, slug), eq(clients.status, "published")))
      .limit(1);
    const client = rows[0];
    if (!client) return null;
    const milestones = await db
      .select()
      .from(clientMilestones)
      .where(eq(clientMilestones.clientId, client.id))
      .orderBy(asc(clientMilestones.sortOrder));
    return { ...client, milestones };
  } catch {
    return null;
  }
}

async function cachedSlugs(): Promise<string[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CLIENTS_TAG);
  try {
    const rows = await db
      .select({ slug: clients.slug })
      .from(clients)
      .where(eq(clients.status, "published"))
      .orderBy(asc(clients.displayOrder));
    return rows.map((r) => r.slug);
  } catch {
    return [];
  }
}

async function cachedStats(): Promise<{
  clientCount: number;
  projectCount: number;
  yearsOfExperience: number;
}> {
  "use cache";
  cacheLife("hours");
  cacheTag(CLIENTS_TAG);
  try {
    const [totals] = await db
      .select({
        clientCount: count(),
        minYear: sql<number>`extract(year from min(${clients.startDate}))`,
      })
      .from(clients)
      .where(eq(clients.status, "published"));

    const clientCount = Number(totals?.clientCount ?? 0);
    const minYear = totals?.minYear ? Number(totals.minYear) : new Date().getFullYear() - 2;
    const yearsOfExperience = Math.max(1, new Date().getFullYear() - minYear + 1);
    // "Projects delivered" ≈ same as clientCount (one project per client entry)
    return { clientCount, projectCount: clientCount, yearsOfExperience };
  } catch {
    return { clientCount: 0, projectCount: 0, yearsOfExperience: 2 };
  }
}

/** All published clients, ordered by display_order. */
export function listPublishedClients(limit = 100): Promise<Client[]> {
  return cachedPublished(limit);
}

/** Published + featured clients. */
export function listFeaturedClients(): Promise<Client[]> {
  return cachedFeatured();
}

/** Published client by slug, with its milestones. */
export function getClientBySlug(
  slug: string,
): Promise<(Client & { milestones: ClientMilestone[] }) | null> {
  return cachedBySlug(slug);
}

/** Published client slugs for sitemap and generateStaticParams. */
export function listPublishedClientSlugs(): Promise<string[]> {
  return cachedSlugs();
}

/** Aggregate stats derived from published clients. */
export function getClientStats(): Promise<{
  clientCount: number;
  projectCount: number;
  yearsOfExperience: number;
}> {
  return cachedStats();
}

// ---------------------------------------------------------------------------
// Admin uncached reads and writes
// ---------------------------------------------------------------------------

type AdminListOptions = { q?: string; status?: "draft" | "published"; page?: number };

export async function listClientsAdmin(opts: AdminListOptions = {}): Promise<{
  clients: Client[];
  total: number;
  page: number;
  pageCount: number;
}> {
  const pageSize = 20;
  const page = Math.max(1, opts.page ?? 1);
  const where = and(
    opts.status ? eq(clients.status, opts.status) : undefined,
    opts.q
      ? or(ilike(clients.name, `%${opts.q}%`), ilike(clients.industry, `%${opts.q}%`))
      : undefined,
  );
  const [rows, totals] = await Promise.all([
    db
      .select()
      .from(clients)
      .where(where)
      .orderBy(asc(clients.displayOrder), desc(clients.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ value: count() }).from(clients).where(where),
  ]);
  const total = Number(totals[0]?.value ?? 0);
  return { clients: rows, total, page, pageCount: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getClientById(
  id: string,
): Promise<(Client & { milestones: ClientMilestone[] }) | null> {
  const rows = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
  const client = rows[0];
  if (!client) return null;
  const milestones = await db
    .select()
    .from(clientMilestones)
    .where(eq(clientMilestones.clientId, id))
    .orderBy(asc(clientMilestones.sortOrder));
  return { ...client, milestones };
}

async function isSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
  const rows = await db
    .select({ id: clients.id })
    .from(clients)
    .where(
      excludeId
        ? and(eq(clients.slug, slug), not(eq(clients.id, excludeId)))
        : eq(clients.slug, slug),
    )
    .limit(1);
  return rows.length > 0;
}

/** Keeps an auto-generated slug unique without throwing away the requested base. */
export async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  const root = slugify(base) || "client";
  let candidate = root;
  let suffix = 2;
  while (await isSlugTaken(candidate, excludeId)) {
    candidate = `${root}-${suffix++}`;
  }
  return candidate;
}

export async function createClient(data: NewClient): Promise<Client> {
  const rows = await db.insert(clients).values(data).returning();
  return rows[0]!;
}

export async function updateClient(id: string, data: Partial<NewClient>): Promise<Client | null> {
  const rows = await db
    .update(clients)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(clients.id, id))
    .returning();
  return rows[0] ?? null;
}

export async function deleteClient(id: string): Promise<Client | null> {
  const rows = await db.delete(clients).where(eq(clients.id, id)).returning();
  return rows[0] ?? null;
}

/** Replaces all milestones for a client atomically. */
export async function upsertMilestones(
  clientId: string,
  milestones: Omit<NewClientMilestone, "clientId">[],
): Promise<ClientMilestone[]> {
  return db.transaction(async (tx) => {
    await tx.delete(clientMilestones).where(eq(clientMilestones.clientId, clientId));
    if (milestones.length === 0) return [];
    return tx
      .insert(clientMilestones)
      .values(milestones.map((m, i) => ({ ...m, clientId, sortOrder: m.sortOrder ?? i })))
      .returning();
  });
}

/** Next published client by display_order (wraps around). */
export function getNextClient(
  currentDisplayOrder: number,
): Promise<Client | null> {
  return cachedNextClient(currentDisplayOrder);
}

async function cachedNextClient(
  currentDisplayOrder: number,
): Promise<Client | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(CLIENTS_TAG);
  try {
    const rows = await db
      .select()
      .from(clients)
      .where(and(eq(clients.status, "published"), not(eq(clients.displayOrder, currentDisplayOrder))))
      .orderBy(asc(clients.displayOrder))
      .limit(1);
    return rows[0] ?? null;
  } catch {
    return null;
  }
}
