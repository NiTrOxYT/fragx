import type { Metadata, Viewport } from "next";
import "./globals.css";
import TopHeader from "@/components/layout/TopHeader";
import MobileNav from "@/components/layout/MobileNav";
import PwaRegister from "@/components/common/PwaRegister";
import { verifyAccessAuth } from "@/lib/services/access";
import AccessGateClient from "@/components/common/AccessGateClient";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://fragx.app"),
  title: "FRAGX — BGMI Competitive Gaming Platform",
  description: "Live BGMI match scores, leaderboard, MVP awards, and gaming session stats.",
  manifest: "/manifest.json",

  icons: {
    icon: "/images/logo.png",
    shortcut: "/images/logo.png",
    apple: "/images/logo.png",
  },
  openGraph: {
    title: "FRAGX — BGMI Competitive Gaming Platform",
    description: "Live BGMI match scores, leaderboard, MVP awards, and gaming session stats.",
    url: "https://fragx.app",
    siteName: "FRAGX",
    images: [
      {
        url: "/images/preview.png",
        width: 1200,
        height: 630,
        alt: "FRAGX BGMI Gaming Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FRAGX — BGMI Competitive Gaming Platform",
    description: "Live BGMI match scores, leaderboard, MVP awards, and gaming session stats.",
    images: ["/images/preview.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FRAGX",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isAccessAuthorized = await verifyAccessAuth();

  return (
    <html lang="en" className="dark">
      <body className="bg-background text-on-background min-h-screen antialiased flex flex-col font-body selection:bg-primary-container selection:text-white">
        <PwaRegister />
        {isAccessAuthorized ? (
          <>
            <TopHeader />
            <div className="flex-1 w-full flex flex-col">{children}</div>
            <MobileNav />
          </>
        ) : (
          <AccessGateClient />
        )}
      </body>
    </html>
  );
}
