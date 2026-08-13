import type { Metadata, Viewport } from "next";
import "./globals.css";
import TopHeader from "@/components/layout/TopHeader";
import MobileNav from "@/components/layout/MobileNav";
import PwaRegister from "@/components/common/PwaRegister";

export const metadata: Metadata = {
  title: "FRAGX - Your Squad. Your Stats. Your Night.",
  description: "Private mobile-first BGMI gaming companion & statistics platform for squad nights.",
  manifest: "/manifest.json",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-on-background min-h-screen antialiased flex flex-col font-body selection:bg-primary-container selection:text-white">
        <PwaRegister />
        <TopHeader />
        <div className="flex-1 w-full flex flex-col">
          {children}
        </div>
        <MobileNav />
      </body>
    </html>
  );
}
