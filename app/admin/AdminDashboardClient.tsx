"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface AdminDashboardClientProps {
  isAuthenticated: boolean;
  activeDraftId: string;
  draftMatchCount: number;
  stats: {
    totalMatches: number;
    totalKills: number;
    mvpName: string;
    mvpAvatar: string;
    mvpKills: number;
  };
}

export default function AdminDashboardClient({
  isAuthenticated,
  activeDraftId,
  draftMatchCount,
  stats,
}: AdminDashboardClientProps) {
  const [pin, setPin] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoginError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });

      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || "Authentication failed");
      } else {
        router.refresh();
      }
    } catch (err) {
      setLoginError("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    router.refresh();
  };

  if (!isAuthenticated) {
    return (
      <main className="flex-1 w-full max-w-md mx-auto px-safe-margin pt-24 pb-24 flex flex-col items-center justify-center">
        <div className="glass-panel rounded-2xl p-6 w-full border border-primary/30 shadow-2xl space-y-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary mb-2">
              <span className="material-symbols-outlined text-3xl">admin_panel_settings</span>
            </div>
            <h2 className="font-headline text-headline-md text-on-surface">Admin Access</h2>
            <p className="font-body text-body-md text-on-surface-variant">
              Enter your squad Admin PIN to log matches and publish session results.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                Admin PIN
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                required
                className="w-full bg-surface-container border border-surface-container-high rounded-xl px-4 py-3 font-stat-value text-stat-value text-center tracking-widest text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            {loginError && (
              <div className="p-3 rounded-lg bg-error-container/40 border border-error/40 text-error font-body text-sm text-center">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary-cta text-white font-label-caps text-label-caps py-4 rounded-xl hover:bg-primary-container active:scale-[0.98] transition-all uppercase tracking-widest font-bold shadow-[0_0_15px_rgba(255,77,0,0.3)] disabled:opacity-50"
            >
              {isSubmitting ? "UNLOCKING..." : "UNLOCK ADMIN"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-safe-margin pt-24 pb-stack-lg flex flex-col gap-stack-lg">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-headline text-headline-md text-on-background">Admin Dashboard</h2>
            <button
              onClick={handleLogout}
              className="text-xs text-on-surface-variant hover:text-error transition-colors font-label-caps underline"
            >
              Log Out
            </button>
          </div>
          <p className="font-body text-body-md text-on-surface-variant mt-1">
            Session Overview: Tonight's Active Session
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Link
            href="/admin/matches/new"
            className="bg-[#FF4D00] text-white font-label-caps text-label-caps py-3 px-6 rounded-xl hover:bg-primary-container active:scale-95 transition-all duration-200 primary-glow shadow-[0_0_15px_rgba(255,77,0,0.3)] flex items-center gap-2 justify-center"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            ADD MATCH
          </Link>

          {draftMatchCount > 0 && (
            <Link
              href={`/admin/sessions/${activeDraftId}/review`}
              className="bg-surface-container border border-primary/40 text-primary font-label-caps text-label-caps py-3 px-6 rounded-xl hover:bg-surface-container-high active:scale-95 transition-all flex items-center gap-2 justify-center"
            >
              <span className="material-symbols-outlined text-[18px]">rate_review</span>
              REVIEW SESSION ({draftMatchCount})
            </Link>
          )}
        </div>
      </section>

      {/* Bento Grid: Key Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Matches Stat */}
        <div className="glass-panel rounded-xl p-6 flex flex-col relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-6xl text-primary">swords</span>
          </div>
          <span className="font-label-caps text-label-caps text-on-surface-variant mb-2">
            Total Matches
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-display-stat text-display-stat text-on-background">
              {stats.totalMatches}
            </span>
            <span className="font-stat-value text-stat-value text-primary">
              +{draftMatchCount} Draft
            </span>
          </div>
          <div className="mt-4 h-1 w-full bg-surface-container rounded-full overflow-hidden">
            <div className="h-full bg-primary w-3/4 shadow-[0_0_8px_rgba(255,181,158,0.8)]" />
          </div>
        </div>

        {/* Kills Stat */}
        <div className="glass-panel rounded-xl p-6 flex flex-col relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-6xl text-primary">target</span>
          </div>
          <span className="font-label-caps text-label-caps text-on-surface-variant mb-2">
            Total Kills
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-display-stat text-display-stat text-on-background">
              {stats.totalKills}
            </span>
            <span className="font-stat-value text-stat-value text-secondary">Peak</span>
          </div>
          <div className="mt-4 flex items-end h-8 gap-1 opacity-70">
            <div className="w-full bg-surface-container rounded-sm h-1/4" />
            <div className="w-full bg-surface-container rounded-sm h-2/4" />
            <div className="w-full bg-surface-container rounded-sm h-1/3" />
            <div className="w-full bg-primary rounded-sm h-full shadow-[0_0_8px_rgba(255,181,158,0.5)]" />
            <div className="w-full bg-surface-container rounded-sm h-3/4" />
          </div>
        </div>

        {/* MVP Stat */}
        <div className="glass-panel rounded-xl p-6 flex flex-col relative overflow-hidden border-secondary-container/30 bg-gradient-to-br from-[#171717] to-[#201c10]">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <span className="material-symbols-outlined text-6xl text-gold">star</span>
          </div>
          <span className="font-label-caps text-label-caps text-on-surface-variant mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gold shadow-[0_0_5px_rgba(212,175,55,0.8)] animate-pulse" />
            Current MVP
          </span>
          <div className="flex items-center gap-4 mt-auto pt-4">
            <div className="w-12 h-12 rounded-full bg-surface-container border-2 border-gold overflow-hidden shadow-[0_0_10px_rgba(212,175,55,0.3)] flex-shrink-0 flex items-center justify-center">
              {stats.mvpAvatar ? (
                <img
                  src={stats.mvpAvatar}
                  alt={stats.mvpName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="material-symbols-outlined text-gold text-2xl">
                  workspace_premium
                </span>
              )}
            </div>

            <div>
              <span className="font-headline text-headline-md text-on-background block">
                {stats.mvpName}
              </span>
              <span className="font-body text-body-md text-gold/90">
                {stats.mvpKills} Total Session Kills
              </span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
