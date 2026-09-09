import "./globals.css";

export const metadata = {
  title: "LocalPlatform",
  description: "Discover local businesses near you",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}