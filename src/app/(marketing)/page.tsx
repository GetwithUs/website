import CtaSection from "@/components/cta/CtaSection";
import CodeSection from "@/components/home/CodeSection";
import BlogSection from "@/components/home/BlogSection";
import GetwithusOverviewSection from "@/components/home/GetwithusOverviewSection";
import HomeFaq from "@/components/home/HomeFaq";
import HomeHero from "@/components/home/HomeHero";
import Industries from "@/components/home/Industries";
import SeeItWorking from "@/components/home/SeeItWorking";
import ServiceCards from "@/components/home/ServiceCards";
import StackSection from "@/components/home/StackSection";
import ToolMarquee from "@/components/home/ToolMarquee";
import JsonLd from "@/components/layout/JsonLd";
import Commitments from "@/components/sections/Commitments";
import Pricing from "@/components/sections/Pricing";
import ProcessSection from "@/components/sections/ProcessSection";
import SelectedWork from "@/components/sections/SelectedWork";
import ClientsSection from "@/components/home/ClientsSection";
import { site } from "@/config/site";
import { homeFaqs } from "@/content/faqs";
import { homePage } from "@/content/pages";
import { faqJsonLd, organizationJsonLd, websiteJsonLd } from "@/lib/json-ld";
import { pageMetadata } from "@/lib/seo";
import { latestPosts } from "@/features/blog/service";

export const metadata = pageMetadata({
  title: `${site.name}: software your business runs on`,
  description: site.description,
  path: homePage.path,
  absoluteTitle: true,
});

/** The home page, in the section order of docs/build-final-prompt.md section 5. */
export default async function HomePage() {
  const recentPosts = await latestPosts();

  return (
    <>
      <JsonLd data={[organizationJsonLd(), websiteJsonLd(), faqJsonLd(homeFaqs)]} />
      <HomeHero />
      <ToolMarquee />
      <ServiceCards />
      <SeeItWorking />
      <CodeSection />
      <StackSection />
      <ProcessSection />
      <Pricing />
      <Commitments />
      <Industries />
      <SelectedWork />
      <ClientsSection />
      <HomeFaq />
      <GetwithusOverviewSection />
      <BlogSection posts={recentPosts} />
      <CtaSection />
    </>
  );
}
