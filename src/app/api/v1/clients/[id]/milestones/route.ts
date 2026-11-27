import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/features/admin/auth";
import { CLIENTS_TAG, upsertMilestones } from "@/features/clients/service";
import { milestonesReplaceSchema } from "@/features/clients/schema";

type Ctx = { params: Promise<{ id: string }> };

/** Admin only. Replace all milestones for a client. */
export async function PUT(req: NextRequest, { params }: Ctx) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const parsed = milestonesReplaceSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const milestones = await upsertMilestones(
      id,
      parsed.data.map((m, i) => ({
        title: m.title,
        description: m.description ?? "",
        milestoneDate: m.milestoneDate ? new Date(m.milestoneDate) : null,
        sortOrder: m.sortOrder ?? i,
      })),
    );
    revalidateTag(CLIENTS_TAG, "max");
    return NextResponse.json({ milestones });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not save milestones" },
      { status: 500 },
    );
  }
}
