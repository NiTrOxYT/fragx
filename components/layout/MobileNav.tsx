"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MobileNav() {
  const pathname = usePathname();

  // Suppress bottom navigation on focused/transactional screens as instructed in prompt
  const isMatchDetails = pathname.startsWith("/matches/") && pathname !== "/matches";
  const isAdminNew = pathname === "/admin/matches/new";
  const isReview = pathname.includes("/review");

  if (isMatchDetails || isAdminNew || isReview) {
    return null;
  }

  const items = [
    { label: "Home", href: "/", icon: "home" },
    { label: "Matches", href: "/matches", icon: "sports_esports" },
    { label: "Leaderboard", href: "/leaderboard", icon: "leaderboard" },
    { label: "Squad", href: "/players", icon: "group" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-safe-margin pb-safe bg-surface/80 backdrop-blur-md border-t border-outline-variant/20 shadow-[0_-4px_20px_rgba(255,181,158,0.05)] h-bottom-nav-height md:hidden">
      {items.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            className={`flex flex-col items-center justify-center p-2 transition-all duration-200 active:scale-90 ${
              isActive
                ? "text-primary drop-shadow-[0_0_8px_rgba(255,181,158,0.4)]"
                : "text-on-surface-variant hover:text-primary/80"
            }`}
          >
            <span
              className="material-symbols-outlined text-2xl"
              style={{
                fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              {item.icon}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
