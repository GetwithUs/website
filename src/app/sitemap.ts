import type { MetadataRoute } from "next";
import { privacyPolicy } from "@/content/legal/privacy";
import { termsOfService } from "@/content/legal/terms";
import {
  aboutPage,
  contactPage,
  homePage,
  processPage,
  servicesPage,
  startPage,
  workPage,
} from "@/content/pages";
import { allServicePages } from "@/content/services";
import { getPublishedCaseStudies } from "@/features/case-studies/getPublishedCaseStudies";
import { listPublishedPosts } from "@/features/blog/service";
import { listPublishedClients } from "@/features/clients/service";
import { absoluteUrl } from "@/lib/seo";

/** Every public page with the date its content last changed. /work appears once a study is published. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entry = (path: string, updated: string) => ({
    url: absoluteUrl(path),
    lastModified: updated,
  });
  const studies = getPublishedCaseStudies();
  const posts = await listPublishedPosts(1000).catch(() => []);
  const clients = await listPublishedClients(1000).catch(() => []);
  const blogUpdated = posts[0]
    ? (posts[0].updatedAt ?? posts[0].publishedAt ?? posts[0].createdAt).toISOString()
    : "2026-11-20";
  const clientsUpdated = clients[0]
    ? (clients[0].updatedAt ?? clients[0].createdAt).toISOString()
    : "2026-11-20";

  return [
    entry(homePage.path, homePage.updated),
    entry(servicesPage.path, servicesPage.updated),
    ...allServicePages.map((page) => entry(page.href, page.updated)),
    entry(processPage.path, processPage.updated),
    entry("/clients", clientsUpdated),
    ...clients.map((client) =>
      entry(`/clients/${client.slug}`, (client.updatedAt ?? client.createdAt).toISOString()),
    ),
    entry("/blog", blogUpdated),
    ...posts.map((post) =>
      entry(`/blog/${post.slug}`, (post.updatedAt ?? post.publishedAt ?? post.createdAt).toISOString()),
    ),
    ...(studies.length
      ? [
          entry(workPage.path, workPage.updated),
          ...studies.map((study) => entry(`/work/${study.slug}`, study.date)),
        ]
      : []),
    entry(aboutPage.path, aboutPage.updated),
    entry(contactPage.path, contactPage.updated),
    entry(startPage.path, startPage.updated),
    entry("/privacy", privacyPolicy.updated),
    entry("/terms", termsOfService.updated),
  ];
}
