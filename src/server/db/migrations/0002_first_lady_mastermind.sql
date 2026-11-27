CREATE TYPE "public"."client_link_type" AS ENUM('website', 'android', 'ios', 'none');--> statement-breakpoint
CREATE TYPE "public"."client_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TABLE "client_milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"milestone_date" timestamp with time zone,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"industry" text NOT NULL,
	"tagline" text NOT NULL,
	"logo_url" text,
	"cover_image_url" text,
	"project_brief" text DEFAULT '' NOT NULL,
	"services_delivered" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"tech_stack" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"project_url" text,
	"link_type" "client_link_type" DEFAULT 'none' NOT NULL,
	"result_highlights" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"testimonial_text" text,
	"testimonial_author" text,
	"start_date" timestamp with time zone,
	"end_date" timestamp with time zone,
	"is_featured" boolean DEFAULT false NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"status" "client_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "clients_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "client_milestones" ADD CONSTRAINT "client_milestones_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "client_milestones_client_id_idx" ON "client_milestones" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "clients_slug_idx" ON "clients" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "clients_status_idx" ON "clients" USING btree ("status");--> statement-breakpoint
CREATE INDEX "clients_display_order_idx" ON "clients" USING btree ("display_order");--> statement-breakpoint
CREATE INDEX "clients_is_featured_idx" ON "clients" USING btree ("is_featured");