import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ExternalLinkButton from "@/components/clients/ExternalLinkButton";
import MilestoneTimeline from "@/components/clients/MilestoneTimeline";
import Markdown from "@/components/blog/Markdown";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import {
  getClientBySlug,
  getNextClient,
  listPublishedClientSlugs,
} from "@/features/clients/service";
import { formatDate } from "@/lib/dates";
import { pageMetadata } from "@/lib/seo";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await listPublishedClientSlugs();
  // Cache Components needs at least one param; the placeholder 404s at runtime.
  return slugs.length ? slugs.map((slug) => ({ slug })) : [{ slug: "__placeholder__" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const client = await getClientBySlug(slug);

  if (!client) {
    return { title: "Client Not Found | GetwithUs" };
  }

  return pageMetadata({
    title: `${client.name} Case Study | GetwithUs`,
    description: `${client.tagline}. See how GetwithUs delivered ${client.industry} software solutions.`,
    path: `/clients/${client.slug}`,
  });
}

export default async function ClientDetailPage({ params }: Props) {
  const { slug } = await params;
  const client = await getClientBySlug(slug);

  if (!client) {
    notFound();
  }

  const nextClient = await getNextClient(client.displayOrder);

  // Compute duration
  let durationStr = "Ongoing";
  if (client.startDate && client.endDate) {
    durationStr = `${formatDate(client.startDate)} to ${formatDate(client.endDate)}`;
  } else if (client.startDate) {
    durationStr = `Started ${formatDate(client.startDate)}`;
  }

  return (
    <article className="py-12 sm:py-20">
      <Container>
        {/* Back Link */}
        <div className="mb-8">
          <Link
            href="/clients"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink"
          >
            &larr; Back to all clients
          </Link>
        </div>

        {/* Hero Section */}
        <div className="rounded-card border border-line bg-card p-6 sm:p-10 lg:p-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4 max-w-2xl">
              <div className="flex flex-wrap items-center gap-3">
                {client.logoUrl ? (
                  <div className="relative h-12 w-32">
                    <Image
                      src={client.logoUrl}
                      alt={`${client.name} logo`}
                      fill
                      className="object-contain object-left"
                      sizes="128px"
                      priority
                    />
                  </div>
                ) : (
                  <div className="grid size-12 place-items-center rounded-xl bg-accent-soft font-display text-lg font-bold text-ink">
                    {client.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <span className="rounded-full border border-line bg-bg-soft px-3 py-1 text-xs font-semibold text-accent">
                  {client.industry}
                </span>
                <span className="text-xs font-medium text-muted">
                  {durationStr}
                </span>
              </div>

              <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl md:text-5xl">
                {client.name}
              </h1>
              <p className="text-lg text-body sm:text-xl">
                {client.tagline}
              </p>
            </div>

            {/* External link action */}
            {client.projectUrl && client.linkType !== "none" && (
              <div className="shrink-0 pt-2 lg:pt-0">
                <ExternalLinkButton
                  projectUrl={client.projectUrl}
                  linkType={client.linkType}
                />
              </div>
            )}
          </div>

          {/* Cover image if available */}
          {client.coverImageUrl && (
            <div className="relative mt-8 aspect-video w-full overflow-hidden rounded-xl border border-line">
              <Image
                src={client.coverImageUrl}
                alt={`${client.name} project cover`}
                fill
                className="object-cover"
                sizes="(max-width: 1200px) 100vw, 1200px"
              />
            </div>
          )}
        </div>

        {/* Key Metrics / Result Highlights */}
        {client.resultHighlights && client.resultHighlights.length > 0 && (
          <div className="mt-12">
            <h2 className="font-display text-xl font-bold text-ink sm:text-2xl">
              Outcome Highlights
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {client.resultHighlights.map((stat, idx) => (
                <div
                  key={idx}
                  className="rounded-card border border-line bg-card p-6 shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-accent" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                      Impact Metric
                    </span>
                  </div>
                  <p className="mt-3 font-display text-lg font-bold text-ink sm:text-xl">
                    {stat}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Content Grid: Brief & Details */}
        <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_320px]">
          {/* Left Column: Markdown Project Brief */}
          <div className="space-y-12">
            <div>
              <h2 className="mb-6 font-display text-2xl font-bold text-ink sm:text-3xl">
                Project Overview
              </h2>
              {client.projectBrief ? (
                <Markdown content={client.projectBrief} />
              ) : (
                <p className="text-body">No project details provided yet.</p>
              )}
            </div>

            {/* Milestone Timeline */}
            {client.milestones && client.milestones.length > 0 && (
              <div className="border-t border-line pt-12">
                <h2 className="mb-8 font-display text-2xl font-bold text-ink sm:text-3xl">
                  Project Delivery Journey
                </h2>
                <MilestoneTimeline milestones={client.milestones} />
              </div>
            )}

            {/* Client Quote */}
            {client.testimonialText && (
              <div className="border-t border-line pt-12">
                <blockquote className="rounded-card border border-accent/20 bg-accent-soft p-8 sm:p-10">
                  <p className="font-display text-lg font-medium italic text-ink sm:text-xl">
                    &ldquo;{client.testimonialText}&rdquo;
                  </p>
                  {client.testimonialAuthor && (
                    <footer className="mt-4 font-semibold text-accent">
                      - {client.testimonialAuthor}
                    </footer>
                  )}
                </blockquote>
              </div>
            )}
          </div>

          {/* Right Column Sidebar: Services, Tech Stack */}
          <aside className="space-y-8 lg:border-l lg:border-line lg:pl-8">
            {/* Services Delivered */}
            {client.servicesDelivered && client.servicesDelivered.length > 0 && (
              <div>
                <h3 className="type-label uppercase text-muted">
                  Services Delivered
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {client.servicesDelivered.map((srv, idx) => (
                    <span
                      key={idx}
                      className="rounded-full border border-line bg-card px-3 py-1 text-xs font-semibold text-ink"
                    >
                      {srv}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tech Stack */}
            {client.techStack && client.techStack.length > 0 && (
              <div>
                <h3 className="type-label uppercase text-muted">
                  Technologies Used
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {client.techStack.map((tech, idx) => (
                    <span
                      key={idx}
                      className="rounded-full border border-line bg-bg-soft px-3 py-1 text-xs font-medium text-body"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Share or Contact Action */}
            <div className="rounded-card border border-line bg-card p-6">
              <h3 className="font-display text-lg font-bold text-ink">
                Need similar results?
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-body">
                Let&apos;s evaluate your current systems and architect a tailored roadmap.
              </p>
              <Button href="/start" size="sm" className="mt-4 w-full">
                Schedule a consultation
              </Button>
            </div>
          </aside>
        </div>

        {/* Next Client / Footer navigation */}
        {nextClient && (
          <div className="mt-20 border-t border-line pt-10">
            <div className="flex items-center justify-between">
              <div>
                <span className="type-small uppercase text-muted">Next Story</span>
                <h4 className="mt-1 font-display text-xl font-bold text-ink">
                  {nextClient.name}
                </h4>
              </div>
              <Button href={`/clients/${nextClient.slug}`} variant="secondary">
                Read next &rarr;
              </Button>
            </div>
          </div>
        )}
      </Container>
    </article>
  );
}
