import { revalidatePath, revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/features/admin/auth";
import {
  CLIENTS_TAG,
  deleteClient,
  getClientById,
  updateClient,
} from "@/features/clients/service";
import { clientWriteSchema } from "@/features/clients/schema";
import { deleteClientImage } from "@/features/clients/blob";

type Ctx = { params: Promise<{ id: string }> };

/** Admin only. Update a client. */
export async function PUT(req: NextRequest, { params }: Ctx) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const parsed = clientWriteSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // If logo or cover changed, delete old blob
  const existing = await getClientById(id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const data = parsed.data;
  if (data.logoUrl !== undefined && data.logoUrl !== existing.logoUrl) {
    await deleteClientImage(existing.logoUrl);
  }
  if (data.coverImageUrl !== undefined && data.coverImageUrl !== existing.coverImageUrl) {
    await deleteClientImage(existing.coverImageUrl);
  }

  try {
    const client = await updateClient(id, {
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : data.startDate === null ? null : undefined,
      endDate: data.endDate ? new Date(data.endDate) : data.endDate === null ? null : undefined,
    });
    revalidateTag(CLIENTS_TAG, "max");
    revalidatePath("/");
    revalidatePath("/clients");
    if (client?.slug) revalidatePath(`/clients/${client.slug}`);
    return NextResponse.json({ client });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not update client" },
      { status: 500 },
    );
  }
}

/** Admin only. Delete a client and its blob images. */
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await getClientById(id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Delete blob images first (best effort)
  await Promise.all([
    deleteClientImage(existing.logoUrl),
    deleteClientImage(existing.coverImageUrl),
  ]);

  const deleted = await deleteClient(id);
  revalidateTag(CLIENTS_TAG, "max");
  revalidatePath("/");
  revalidatePath("/clients");
  if (deleted?.slug) revalidatePath(`/clients/${deleted.slug}`);
  return NextResponse.json({ deleted });
}
