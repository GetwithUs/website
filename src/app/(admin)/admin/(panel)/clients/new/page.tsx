import type { Metadata } from "next";
import ClientForm from "@/components/admin/clients/ClientForm";
import { requireAdmin } from "@/features/admin/auth";

export const metadata: Metadata = { title: "New client" };

export default async function NewClientPage() {
  await requireAdmin("/admin/clients/new");
  return (
    <div className="grid gap-8">
      <h1 className="type-h2">New client</h1>
      <ClientForm />
    </div>
  );
}
