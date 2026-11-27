import { relations, sql } from "drizzle-orm";
import { boolean, index, integer, pgEnum, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { createdAt, id, timestamptz } from "@/server/db/schema/columns";

export const CLIENT_STATUSES = ["draft", "published"] as const;
export type ClientStatus = (typeof CLIENT_STATUSES)[number];

export const clientStatus = pgEnum("client_status", CLIENT_STATUSES);

export const CLIENT_LINK_TYPES = ["website", "android", "ios", "none"] as const;
export type ClientLinkType = (typeof CLIENT_LINK_TYPES)[number];

export const clientLinkType = pgEnum("client_link_type", CLIENT_LINK_TYPES);

/** All client / case-study data lives in Postgres. Images are Vercel Blob URLs only. */
export const clients = pgTable(
  "clients",
  {
    id: id(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    industry: text("industry").notNull(),
    tagline: text("tagline").notNull(),
    logoUrl: text("logo_url"),
    coverImageUrl: text("cover_image_url"),
    projectBrief: text("project_brief").notNull().default(""),
    servicesDelivered: text("services_delivered")
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),
    techStack: text("tech_stack")
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),
    projectUrl: text("project_url"),
    linkType: clientLinkType("link_type").notNull().default("none"),
    resultHighlights: text("result_highlights")
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),
    testimonialText: text("testimonial_text"),
    testimonialAuthor: text("testimonial_author"),
    startDate: timestamptz("start_date"),
    endDate: timestamptz("end_date"),
    isFeatured: boolean("is_featured").notNull().default(false),
    displayOrder: integer("display_order").notNull().default(0),
    status: clientStatus("status").notNull().default("draft"),
    createdAt: createdAt(),
    updatedAt: timestamptz("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("clients_slug_idx").on(table.slug),
    index("clients_status_idx").on(table.status),
    index("clients_display_order_idx").on(table.displayOrder),
    index("clients_is_featured_idx").on(table.isFeatured),
  ],
);

export const clientMilestones = pgTable(
  "client_milestones",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    milestoneDate: timestamptz("milestone_date"),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [index("client_milestones_client_id_idx").on(table.clientId)],
);

export const clientsRelations = relations(clients, ({ many }) => ({
  milestones: many(clientMilestones),
}));

export const clientMilestonesRelations = relations(clientMilestones, ({ one }) => ({
  client: one(clients, { fields: [clientMilestones.clientId], references: [clients.id] }),
}));

export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
export type ClientMilestone = typeof clientMilestones.$inferSelect;
export type NewClientMilestone = typeof clientMilestones.$inferInsert;
