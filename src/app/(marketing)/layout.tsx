import Analytics from "@/components/analytics/Analytics";
import UtmCapture from "@/components/forms/UtmCapture";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import WhatsAppFab from "@/components/layout/WhatsAppFab";

/**
 * The marketing app shell (header, footer, navigation) is static.
 * Child pages stream or cache content as needed.
 */
export const ensureStatic = "shell";

export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Header />
      <main id="content" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Footer />
      <WhatsAppFab />
      <UtmCapture />
      <Analytics />
    </>
  );
}
