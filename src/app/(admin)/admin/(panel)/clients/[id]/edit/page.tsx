import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ClientForm from "@/components/admin/clients/ClientForm";
import { requireAdmin } from "@/features/admin/auth";
import { getClientById } from "@/features/clients/service";

export const metadata: Metadata = { title: "Edit client" };

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const client = await getClientById(id);
  if (!client) notFound();

  return (
    <div className="grid gap-8">
      <h1 className="type-h2">Edit client</h1>
      <ClientForm client={client} milestones={client.milestones} />
    </div>
  );
}
