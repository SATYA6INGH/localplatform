import "./globals.css";
import type { Metadata, Viewport } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://localplatform-one.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "LocalPlatform | Discover trusted local businesses",
    template: "%s | LocalPlatform",
  },
  description: "Find verified local businesses, services and offers near you on LocalPlatform.",
  applicationName: "LocalPlatform",
  keywords: ["local businesses", "nearby services", "business directory", "India local services"],
  alternates: { canonical: siteUrl },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "LocalPlatform",
    title: "LocalPlatform | Discover trusted local businesses",
    description: "Find verified local businesses and services near you.",
  },
  twitter: {
    card: "summary",
    title: "LocalPlatform | Discover trusted local businesses",
    description: "Find verified local businesses and services near you.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN">
      <body>
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "LocalPlatform",
          url: siteUrl,
          description: "Discover trusted local businesses and services near you.",
          potentialAction: { "@type": "SearchAction", target: `${siteUrl}/search?q={search_term_string}`, "query-input": "required name=search_term_string" },
        }) }} />
      </body>
    </html>
  );
}
