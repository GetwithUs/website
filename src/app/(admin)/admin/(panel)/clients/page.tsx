import { Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import AdminClientsTable from "@/components/admin/clients/AdminClientsTable";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { listClientsAdmin } from "@/features/clients/service";
import { requireAdmin } from "@/features/admin/auth";

export const instant = false;
export const metadata: Metadata = { title: "Clients" };

export default async function AdminClientsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin("/admin/clients");
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : undefined;
  const status = sp.status === "draft" || sp.status === "published" ? sp.status : undefined;
  const requested = typeof sp.page === "string" ? Number(sp.page) : 1;
  const page = Number.isFinite(requested) ? Math.max(1, Math.floor(requested)) : 1;

  let result: { clients: Awaited<ReturnType<typeof listClientsAdmin>>["clients"]; total: number; pageCount: number };
  try {
    result = await listClientsAdmin({ q, status, page });
  } catch {
    result = { clients: [], total: 0, pageCount: 1 };
  }
  const { clients, total, pageCount } = result;

  return (
    <div className="grid gap-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="type-h2">Clients</h1>
        <Button href="/admin/clients/new" size="sm">
          New client
        </Button>
      </div>

      {clients.length ? (
        <AdminClientsTable
          clients={clients}
          total={total}
          page={page}
          pageCount={pageCount}
          q={q}
          status={status}
        />
      ) : (
        <EmptyState icon={Users} title="No clients yet">
          <Link href="/admin/clients/new" className="text-accent underline underline-offset-2">
            Add your first client
          </Link>
        </EmptyState>
      )}
    </div>
  );
}
