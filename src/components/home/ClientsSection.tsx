import Image from "next/image";
import Link from "next/link";
import ClientsScene3D from "@/components/three/ClientsScene3D";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import {
  CLIENTS_NAV_LABEL,
  CLIENTS_SECTION_HEADING,
  CLIENTS_SECTION_SUBTEXT,
} from "@/content/clients";
import { getClientStats, listFeaturedClients, listPublishedClients } from "@/features/clients/service";

export default async function ClientsSection() {
  const [published, featured, stats] = await Promise.all([
    listPublishedClients(12),
    listFeaturedClients(),
    getClientStats(),
  ]);

  if (published.length === 0) {
    return null;
  }

  const sceneCards = published.map((c) => ({
    name: c.name,
    slug: c.slug,
    logoUrl: c.logoUrl,
  }));

  const displayFeatured = featured.length > 0 ? featured : published.slice(0, 6);

  return (
    <section
      id="clients"
      aria-label={CLIENTS_NAV_LABEL}
      className="relative overflow-hidden border-t border-line bg-[#0a1220] py-20 text-white md:py-28"
    >
      {/* Background glow effect */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.12),transparent_70%)] blur-3xl"
      />

      <Container className="relative z-10">
        {/* Header */}
        <div className="mx-auto max-w-[760px] text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3.5 py-1 text-xs font-semibold text-teal-300">
            {CLIENTS_NAV_LABEL}
          </div>
          <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
            {CLIENTS_SECTION_HEADING}
          </h2>
          <p className="mt-4 text-base text-slate-300 sm:text-lg">
            {CLIENTS_SECTION_SUBTEXT}
          </p>

          {/* Live Counters */}
          <div className="mt-10 grid grid-cols-3 gap-4 border-y border-white/10 py-6 sm:gap-8">
            <div>
              <div className="font-display text-2xl font-extrabold text-teal-400 sm:text-4xl">
                {stats.clientCount}+
              </div>
              <div className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-400 sm:text-sm">
                Clients Served
              </div>
            </div>
            <div>
              <div className="font-display text-2xl font-extrabold text-teal-400 sm:text-4xl">
                {stats.projectCount}+
              </div>
              <div className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-400 sm:text-sm">
                Projects Delivered
              </div>
            </div>
            <div>
              <div className="font-display text-2xl font-extrabold text-teal-400 sm:text-4xl">
                {stats.yearsOfExperience}+
              </div>
              <div className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-400 sm:text-sm">
                Years Experience
              </div>
            </div>
          </div>
        </div>

        {/* 3D Scene */}
        <div className="mt-10">
          <ClientsScene3D clients={sceneCards} size="default" />
        </div>

        {/* Featured logos strip */}
        <div className="mt-12 border-t border-white/10 pt-10">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-400">
            Featured Engagements
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {displayFeatured.map((client) => (
              <Link
                key={client.id}
                href={`/clients/${client.slug}`}
                className="group flex items-center gap-2.5 rounded-lg px-3 py-2 transition-all duration-200 hover:bg-white/5"
              >
                {client.logoUrl ? (
                  <div className="relative h-8 w-24 grayscale contrast-125 transition-all duration-200 group-hover:grayscale-0 group-hover:contrast-100">
                    <Image
                      src={client.logoUrl}
                      alt={client.name}
                      fill
                      className="object-contain"
                      sizes="96px"
                    />
                  </div>
                ) : (
                  <div className="flex h-8 items-center rounded border border-white/15 bg-white/5 px-3 text-xs font-semibold text-slate-300 transition-colors group-hover:border-teal-400/40 group-hover:text-white">
                    {client.name}
                  </div>
                )}
              </Link>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Button
              href="/clients"
              variant="inverse"
              className="border-teal-400/30 text-teal-300 hover:border-teal-400 hover:bg-teal-400/10"
            >
              View all clients &amp; case studies &rarr;
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
