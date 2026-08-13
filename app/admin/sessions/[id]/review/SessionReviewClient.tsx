"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface MatchItem {
  id: string;
  matchNumber: number;
  playerName: string;
  kills: number;
  placement: number;
  isWin: boolean;
}

interface SessionReviewClientProps {
  session: {
    id: string;
    dateStr: string;
    status: string;
    matchCount: number;
    totalKills: number;
    mvpName: string;
    mvpKills: number;
    goldenGunNames?: string;
    goldenGunKills?: number;
    matches: MatchItem[];
  };
}


export default function SessionReviewClient({ session }: SessionReviewClientProps) {
  const router = useRouter();
  const [isPublishing, setIsPublishing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handlePublish = async () => {
    if (session.matches.length === 0) {
      setErrorMsg("Cannot publish a session without any matches.");
      return;
    }

    setIsPublishing(true);
    setErrorMsg("");

    try {
      const res = await fetch(`/api/sessions/${session.id}/publish`, {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to publish session.");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setErrorMsg("Network error while publishing session.");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDeleteMatch = async (matchId: string) => {
    if (!confirm("Are you sure you want to delete this match?")) return;

    setDeletingId(matchId);
    try {
      const res = await fetch(`/api/matches/${matchId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete match");
      }
    } catch (err) {
      alert("Error deleting match");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <main className="flex-grow flex flex-col w-full max-w-md mx-auto px-safe-margin pt-20 pb-36 gap-stack-lg">
        {/* Header Section */}
        <section className="flex flex-col gap-stack-sm text-center pt-stack-sm">
          <h2 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">
            {session.dateStr}
          </h2>
          <h1 className="font-display-stat text-display-stat text-on-surface">REVIEW SESSION</h1>
          {session.status === "PUBLISHED" && (
            <span className="inline-block self-center px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-label-caps text-xs">
              PUBLISHED SESSION
            </span>
          )}
        </section>

        {/* Bento Grid Summary */}
        <section className="grid grid-cols-2 gap-gutter">
          {/* Matches Card */}
          <div className="glass-panel rounded-xl p-stack-md flex flex-col justify-between items-start gap-stack-sm h-32 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10">
              <span className="material-symbols-outlined text-[100px]">sports_esports</span>
            </div>
            <span className="font-label-caps text-label-caps text-on-surface-variant z-10">
              MATCHES
            </span>
            <span className="font-display-stat text-display-stat text-primary z-10">
              {session.matchCount}
            </span>
          </div>

          {/* Kills Card */}
          <div className="glass-panel rounded-xl p-stack-md flex flex-col justify-between items-start gap-stack-sm h-32 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10">
              <span className="material-symbols-outlined text-[100px]">crosshair</span>
            </div>
            <span className="font-label-caps text-label-caps text-on-surface-variant z-10">
              TOTAL KILLS
            </span>
            <span className="font-display-stat text-display-stat text-on-surface z-10">
              {session.totalKills}
            </span>
          </div>

          {/* MVP Card (Full Width) */}
          <div className="glass-panel rounded-xl p-stack-md flex items-center gap-stack-md col-span-2 relative overflow-hidden bg-surface-container-high border-secondary-container/30">
            <div className="absolute inset-0 bg-gradient-to-r from-secondary-container/10 to-transparent" />
            <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center shrink-0 z-10 primary-glow">
              <span
                className="material-symbols-outlined text-on-secondary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                social_leaderboard
              </span>
            </div>
            <div className="flex flex-col z-10">
              <span className="font-label-caps text-label-caps text-gold uppercase font-bold">
                SQUAD MVP (TOTAL SESSION KILLS)
              </span>
              <span className="font-headline text-headline-md text-on-surface">
                {session.mvpName}
              </span>
            </div>
            <div className="ml-auto flex flex-col items-end z-10">
              <span className="font-stat-value text-stat-value text-on-surface">
                {session.mvpKills}
              </span>
              <span className="font-label-caps text-label-caps text-on-surface-variant text-[10px]">
                TOTAL KILLS
              </span>
            </div>
          </div>

          {/* Golden Gun Card (Full Width) */}
          <div className="glass-panel rounded-xl p-stack-md flex items-center gap-stack-md col-span-2 relative overflow-hidden border-[#D4AF37]/30 bg-gradient-to-r from-[#1f190e] to-[#171717]">
            <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/40 flex items-center justify-center shrink-0 z-10 shadow-[0_0_12px_rgba(212,175,55,0.2)]">
              <span
                className="material-symbols-outlined text-gold text-2xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                military_tech
              </span>
            </div>
            <div className="flex flex-col z-10">
              <span className="font-label-caps text-label-caps text-gold uppercase font-bold">
                🏆 GOLDEN GUN (PEAK SINGLE MATCH)
              </span>
              <span className="font-headline text-headline-md text-on-surface">
                {session.goldenGunNames || "NO WINNER YET"}
              </span>
            </div>
            <div className="ml-auto flex flex-col items-end z-10">
              <span className="font-stat-value text-stat-value text-gold font-mono">
                {session.goldenGunKills || 0}
              </span>
              <span className="font-label-caps text-label-caps text-on-surface-variant text-[10px]">
                PEAK KILLS
              </span>
            </div>
          </div>
        </section>


        {/* Match List */}
        <section className="flex flex-col gap-stack-sm">
          <div className="flex justify-between items-center mb-base">
            <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase">
              Match History ({session.matches.length})
            </h3>
            <Link
              href="/admin/matches/new"
              className="text-xs text-primary font-label-caps hover:underline"
            >
              + Add Another Match
            </Link>
          </div>

          {session.matches.length > 0 ? (
            session.matches.map((match) => (
              <div
                key={match.id}
                className="glass-panel rounded-lg p-stack-md flex items-center justify-between hover:bg-surface-container-high transition-colors group"
              >
                <div className="flex items-center gap-gutter">
                  <div
                    className={`w-2 h-10 rounded-full ${
                      match.isWin ? "bg-primary" : "bg-error"
                    }`}
                  />
                  <div className="flex flex-col">
                    <span className="font-stat-value text-stat-value text-on-surface">
                      Match #{match.matchNumber < 10 ? `0${match.matchNumber}` : match.matchNumber} ({match.playerName})
                    </span>
                    <span className="font-body text-body-md text-on-surface-variant text-sm">
                      {match.isWin ? "Victory • Placement #1" : `Placement #${match.placement}`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-stat-value text-stat-value text-primary">
                    {match.kills} K
                  </span>
                  <button
                    onClick={() => handleDeleteMatch(match.id)}
                    disabled={deletingId === match.id}
                    title="Delete Match"
                    className="p-1 text-on-surface-variant hover:text-error transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-on-surface-variant font-label-caps text-label-caps">
              NO MATCHES LOGGED YET FOR THIS SESSION
            </div>
          )}
        </section>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-error-container/40 border border-error/40 text-error font-body text-sm text-center">
            {errorMsg}
          </div>
        )}
      </main>

      {/* Sticky Bottom CTA */}
      <div className="fixed bottom-0 left-0 w-full bg-surface/90 backdrop-blur-xl border-t border-outline-variant/20 p-safe-margin z-50 flex justify-center pb-safe pt-stack-sm">
        <div className="w-full max-w-md mx-auto">
          <button
            onClick={handlePublish}
            disabled={isPublishing || session.matches.length === 0}
            className="w-full bg-[#FF4D00] text-white font-stat-value text-stat-value py-4 rounded-xl primary-glow active:scale-95 transition-transform duration-150 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-lg">publish</span>
            {isPublishing ? "PUBLISHING..." : "PUBLISH RESULTS"}
          </button>
        </div>
      </div>
    </>
  );
}
