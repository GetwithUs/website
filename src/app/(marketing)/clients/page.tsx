import type { Metadata } from "next";
import ClientsListView from "@/components/clients/ClientsListView";
import ClientsScene3D from "@/components/three/ClientsScene3D";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import { site } from "@/config/site";
import { listPublishedClients } from "@/features/clients/service";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Clients & Trusted Partners | GetwithUs",
  description:
    "Explore the businesses and organizations GetwithUs has partnered with to build digital products, websites, apps, and automations.",
  path: "/clients",
});

export default async function ClientsPage() {
  const clients = await listPublishedClients(100);

  const sceneCards = clients.map((c) => ({
    name: c.name,
    slug: c.slug,
    logoUrl: c.logoUrl,
  }));

  return (
    <div className="py-12 sm:py-20">
      {/* Hero Section */}
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-line bg-bg-soft px-3.5 py-1 text-xs font-semibold text-accent">
            Verified Client Engagements
          </div>
          <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl md:text-6xl">
            Software built for teams that move fast
          </h1>
          <p className="mt-4 text-lg text-body sm:text-xl">
            From growing startups to multi-location enterprises, see how GetwithUs delivers
            measurable engineering outcomes.
          </p>
        </div>

        {/* 3D Scene Banner */}
        {sceneCards.length > 0 && (
          <div className="mt-12 overflow-hidden rounded-2xl border border-line bg-[#0a1220] p-4 shadow-sm sm:p-8">
            <ClientsScene3D clients={sceneCards} size="large" />
          </div>
        )}

        {/* Clients Directory & Filters */}
        <div className="mt-16 sm:mt-24">
          <div className="mb-8">
            <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
              All Client Engagements
            </h2>
            <p className="mt-1 text-sm text-body">
              Browse by industry, tech stack, or delivered services.
            </p>
          </div>

          <ClientsListView clients={clients} />
        </div>

        {/* Closing CTA */}
        <div className="mt-20 overflow-hidden rounded-card border border-line bg-card p-8 text-center sm:p-12">
          <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
            Your project could be next
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-body sm:text-base">
            Tell us what you are building. We will assess requirements, suggest architecture, and
            provide a fixed-price proposal within one business day.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button href="/start">Start your project &rarr;</Button>
            <Button
              href={`https://wa.me/?text=${encodeURIComponent(site.whatsAppMessage)}`}
              variant="secondary"
            >
              Chat on WhatsApp
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
