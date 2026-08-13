"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function TopHeader() {
  const pathname = usePathname();
  const router = useRouter();

  const isHome = pathname === "/";
  const isMatchDetails = pathname.startsWith("/matches/") && pathname !== "/matches";
  const isAdminNew = pathname === "/admin/matches/new";
  const isReview = pathname.includes("/review");

  const showBackButton = !isHome;

  let titleText = "FRAGX";
  if (isMatchDetails) {
    titleText = "MATCH DETAILS";
  } else if (isAdminNew) {
    titleText = "ADD MATCH";
  } else if (isReview) {
    titleText = "REVIEW SESSION";
  }

  return (
    <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-surface-container-high/50 md:border-none pt-safe">

      <div className="flex items-center justify-between px-20px md:px-8 h-16 w-full max-w-7xl mx-auto relative">
        <div className="flex items-center gap-4">
          {showBackButton ? (
            <button
              onClick={() => router.back()}
              aria-label="Go back"
              className="text-primary hover:opacity-80 transition-opacity active:scale-95 duration-150 p-2 -ml-2 rounded-full flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-2xl">arrow_back</span>
            </button>
          ) : (
            <div className="w-8 md:hidden" />
          )}

          <Link href="/" className="font-headline text-headline-lg-mobile md:text-headline-lg tracking-tighter text-primary">
            {titleText}
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex gap-8 items-center h-full">
          <Link
            href="/"
            className={`font-label-caps text-label-caps tracking-widest uppercase transition-colors h-full flex items-center border-b-2 ${
              pathname === "/" ? "text-primary border-primary" : "text-on-surface-variant hover:text-primary/80 border-transparent"
            }`}
          >
            Home
          </Link>
          <Link
            href="/matches"
            className={`font-label-caps text-label-caps tracking-widest uppercase transition-colors h-full flex items-center border-b-2 ${
              pathname.startsWith("/matches") ? "text-primary border-primary" : "text-on-surface-variant hover:text-primary/80 border-transparent"
            }`}
          >
            Matches
          </Link>
          <Link
            href="/leaderboard"
            className={`font-label-caps text-label-caps tracking-widest uppercase transition-colors h-full flex items-center border-b-2 ${
              pathname === "/leaderboard" ? "text-primary border-primary" : "text-on-surface-variant hover:text-primary/80 border-transparent"
            }`}
          >
            Leaderboard
          </Link>
          <Link
            href="/players"
            className={`font-label-caps text-label-caps tracking-widest uppercase transition-colors h-full flex items-center border-b-2 ${
              pathname.startsWith("/players") ? "text-primary border-primary" : "text-on-surface-variant hover:text-primary/80 border-transparent"
            }`}
          >
            Squad
          </Link>
          <Link
            href="/admin"
            className={`font-label-caps text-label-caps tracking-widest uppercase transition-colors h-full flex items-center border-b-2 ${
              pathname.startsWith("/admin") ? "text-primary border-primary" : "text-on-surface-variant hover:text-primary/80 border-transparent"
            }`}
          >
            Admin
          </Link>
        </nav>

        {/* Right side spacer or notification button */}
        <div className="w-10 flex items-center justify-end">
          <Link
            href="/admin"
            className="text-on-surface-variant hover:text-primary transition-colors p-2"
            title="Admin Portal"
          >
            <span className="material-symbols-outlined text-2xl">settings</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
