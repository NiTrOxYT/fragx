import type { Metadata, Viewport } from "next";
import { Sora, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import TopHeader from "@/components/layout/TopHeader";
import MobileNav from "@/components/layout/MobileNav";
import PwaRegister from "@/components/common/PwaRegister";
import { verifyAccessAuth } from "@/lib/services/access";
import AccessGateClient from "@/components/common/AccessGateClient";

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  variable: "--font-hanken",
});

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
  variable: "--font-sora",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
  variable: "--font-mono",
});

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
    <html
      lang="en"
      className={`dark ${hankenGrotesk.variable} ${sora.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body className={`bg-background text-on-background min-h-screen antialiased flex flex-col font-body selection:bg-primary-container selection:text-white ${hankenGrotesk.className}`}>
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

