import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://localplatform.in"),

  title: {
    default: "LocalPlatform - Find Local Businesses Near You",
    template: "%s | LocalPlatform",
  },

  description:
    "Find trusted local businesses, services, shops, professionals and more near you. Search businesses by category and city on LocalPlatform.",

  keywords: [
    "local businesses",
    "business directory",
    "find local businesses",
    "businesses near me",
    "local services",
    "business directory India",
    "local business listing",
    "shops near me",
    "services near me",
  ],

  authors: [{ name: "LocalPlatform" }],
  creator: "LocalPlatform",
  publisher: "LocalPlatform",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },

  openGraph: {
    type: "website",
    siteName: "LocalPlatform",
    title: "LocalPlatform - Find Local Businesses Near You",
    description:
      "Discover local businesses and services by category and city.",
    url: "https://localplatform.in",
  },

  twitter: {
    card: "summary_large_image",
    title: "LocalPlatform - Find Local Businesses Near You",
    description:
      "Discover local businesses and services by category and city.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        {children}
      </body>
    </html>
  );
}