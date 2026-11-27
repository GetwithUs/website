import { z } from "zod";
import { isClientBlobUrl } from "@/features/clients/blob";

const blobOrHttpUrl = z
  .string()
  .refine(
    (url) => isClientBlobUrl(url) || /^https?:\/\//i.test(url),
    "Must be a Vercel Blob URL or a valid http(s) URL",
  );

/** All fields optional for update; call .required({ name: true }) for create. */
export const clientWriteSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only")
    .optional(),
  industry: z.string().trim().min(1).max(100).optional(),
  tagline: z.string().trim().min(1).max(300).optional(),
  logoUrl: blobOrHttpUrl.nullable().optional(),
  coverImageUrl: blobOrHttpUrl.nullable().optional(),
  projectBrief: z.string().max(100_000).optional(),
  servicesDelivered: z.array(z.string().trim().min(1).max(100)).max(20).optional(),
  techStack: z.array(z.string().trim().min(1).max(100)).max(20).optional(),
  projectUrl: z
    .string()
    .trim()
    .refine((url) => url === "" || /^https?:\/\//i.test(url), "Must be an http(s) URL")
    .nullable()
    .optional(),
  linkType: z.enum(["website", "android", "ios", "none"]).optional(),
  resultHighlights: z.array(z.string().trim().min(1).max(200)).max(20).optional(),
  testimonialText: z.string().trim().max(5000).nullable().optional(),
  testimonialAuthor: z.string().trim().max(200).nullable().optional(),
  startDate: z.string().datetime({ offset: true }).nullable().optional(),
  endDate: z.string().datetime({ offset: true }).nullable().optional(),
  isFeatured: z.boolean().optional(),
  displayOrder: z.number().int().min(0).optional(),
  status: z.enum(["draft", "published"]).optional(),
});

export const clientCreateSchema = clientWriteSchema.required({ name: true });

const milestoneWriteSchema = z.object({
  id: z.string().uuid().optional(), // existing milestone
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(5000).default(""),
  milestoneDate: z.string().datetime({ offset: true }).nullable().optional(),
  sortOrder: z.number().int().min(0).default(0),
});

export const milestonesReplaceSchema = z.array(milestoneWriteSchema).max(20);
