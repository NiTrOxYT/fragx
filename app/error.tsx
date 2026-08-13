"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("FRAGX App Error:", error);
  }, [error]);

  return (
    <main className="flex-1 w-full max-w-md mx-auto px-safe-margin pt-32 pb-24 flex flex-col items-center justify-center text-center">
      <div className="glass-panel rounded-2xl p-8 space-y-6 w-full border border-error/30">
        <div className="w-16 h-16 rounded-full bg-error/10 border border-error/30 flex items-center justify-center text-error mx-auto">
          <span className="material-symbols-outlined text-4xl">warning</span>
        </div>
        <h2 className="font-headline text-headline-lg text-on-surface">SOMETHING WENT WRONG</h2>
        <p className="font-body text-body-md text-on-surface-variant">
          An unexpected system error occurred. Please retry or return to the homepage.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="w-full bg-primary text-[#3a0b00] font-label-caps text-label-caps py-4 rounded-xl primary-glow hover:bg-primary-fixed-dim active:scale-[0.98] transition-all uppercase tracking-widest font-bold"
          >
            RETRY
          </button>
          <Link
            href="/"
            className="w-full bg-transparent border border-outline-variant/30 text-on-surface-variant font-label-caps text-label-caps py-4 rounded-xl hover:bg-surface-container active:scale-[0.98] transition-all uppercase tracking-widest block"
          >
            RETURN HOME
          </Link>
        </div>
      </div>
    </main>
  );
}
