import { revalidatePath, revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/features/admin/auth";
import { CLIENTS_TAG, createClient, slugify, uniqueSlug } from "@/features/clients/service";
import { clientCreateSchema } from "@/features/clients/schema";

/** Admin only. Public reads go through the cached service. */
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = clientCreateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const slug = data.slug
    ? await uniqueSlug(data.slug)
    : await uniqueSlug(slugify(data.name) || `client-${Date.now()}`);

  try {
    const client = await createClient({
      ...data,
      slug,
      industry: data.industry ?? "",
      tagline: data.tagline ?? "",
      servicesDelivered: data.servicesDelivered ?? [],
      techStack: data.techStack ?? [],
      resultHighlights: data.resultHighlights ?? [],
      linkType: data.linkType ?? "none",
      status: data.status ?? "draft",
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
    });
    revalidateTag(CLIENTS_TAG, "max");
    revalidatePath("/");
    revalidatePath("/clients");
    return NextResponse.json({ client }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not create client" },
      { status: 500 },
    );
  }
}
