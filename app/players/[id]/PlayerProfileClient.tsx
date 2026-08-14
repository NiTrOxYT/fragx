"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PerformanceChart from "@/components/players/PerformanceChart";
import { createPortal } from "react-dom";

interface PlayerProfileClientProps {
  player: {
    id: string;
    name: string;
    avatarUrl: string;
    role: string;
    isActive: boolean;
    stats: {
      matches: number;
      kills: number;
      wins: number;
      avgKills: number;
    };
    performance: { matchIndex: number; kills: number; placement: number; date: string }[];

    recentMatches: {
      id: string;
      matchNumber: number;
      kills: number;
      placement: number;
      createdAt: string;
    }[];
  };
  canEdit: boolean;
}

export default function PlayerProfileClient({
  player,
  canEdit,
}: PlayerProfileClientProps) {
  const router = useRouter();
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState(player.avatarUrl);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [inputUrl, setInputUrl] = useState(player.avatarUrl);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [imagePreviewError, setImagePreviewError] = useState(false);

  const handleOpenModal = () => {
    setInputUrl(currentAvatarUrl);
    setErrorMsg("");
    setImagePreviewError(false);
    setIsEditModalOpen(true);
  };

  const handleSaveAvatar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const trimmedUrl = inputUrl.trim();
    if (!trimmedUrl) {
      setErrorMsg("Please enter a valid image URL.");
      return;
    }

    try {
      new URL(trimmedUrl);
    } catch {
      setErrorMsg("Invalid URL format. Must start with http:// or https://");
      return;
    }

    setIsSaving(true);

    try {
      const res = await fetch(`/api/players/${player.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: trimmedUrl }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile image");
      }

      setCurrentAvatarUrl(trimmedUrl);
      setIsEditModalOpen(false);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to save profile image");
    } finally {
      setIsSaving(false);
    }
  };

  const editModalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#171717]/95 border border-primary/40 rounded-2xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center border-b border-surface-container-high pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">edit</span>
            <h3 className="font-headline text-headline-sm text-on-surface uppercase">
              EDIT PLAYER PROFILE
            </h3>
          </div>
          <button
            onClick={() => setIsEditModalOpen(false)}
            className="text-on-surface-variant hover:text-on-surface p-1"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-error/10 border border-error/30 text-error font-label-caps text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-base">warning</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSaveAvatar} className="space-y-4">
          {/* Gamertag Field (Read Only) */}
          <div className="space-y-1">
            <label className="font-label-caps text-xs text-on-surface-variant uppercase font-bold block">
              GAMERTAG (READ-ONLY)
            </label>
            <input
              type="text"
              value={player.name}
              disabled
              className="w-full bg-surface-container-high/50 border border-surface-container-high rounded-xl px-4 py-3 font-headline text-on-surface-variant opacity-70 cursor-not-allowed"
            />
          </div>

          {/* Profile Image URL Input */}
          <div className="space-y-1">
            <label className="font-label-caps text-xs text-primary uppercase font-bold block">
              PROFILE IMAGE URL
            </label>
            <input
              type="url"
              value={inputUrl}
              onChange={(e) => {
                setInputUrl(e.target.value);
                setImagePreviewError(false);
              }}
              placeholder="https://example.com/my-image.jpg"
              required
              className="w-full bg-surface-container border border-surface-container-high rounded-xl px-4 py-3 font-body text-sm text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          {/* Live Image Preview */}
          <div className="space-y-1">
            <label className="font-label-caps text-[10px] text-on-surface-variant uppercase font-bold block">
              LIVE PREVIEW
            </label>
            <div className="w-full h-32 rounded-xl border border-surface-container-high overflow-hidden bg-black/60 relative flex items-center justify-center">
              {inputUrl.trim() && !imagePreviewError ? (
                <img
                  src={inputUrl}
                  alt="Avatar Preview"
                  className="w-full h-full object-cover"
                  onError={() => setImagePreviewError(true)}
                  onLoad={() => setImagePreviewError(false)}
                />
              ) : (
                <div className="flex flex-col items-center gap-1 text-on-surface-variant">
                  <span className="material-symbols-outlined text-2xl text-error">broken_image</span>
                  <span className="font-label-caps text-[10px]">
                    {imagePreviewError ? "Failed to load image preview" : "Enter a valid image URL above"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl border border-surface-container-high text-on-surface-variant font-label-caps text-xs hover:text-on-surface transition-colors"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={isSaving || imagePreviewError}
              className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-label-caps text-xs font-bold shadow-[0_0_15px_rgba(255,77,0,0.3)] hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
              {isSaving ? "SAVING..." : "SAVE AVATAR"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <main className="max-w-md mx-auto px-safe-margin pt-20 pb-24 flex flex-col gap-stack-lg w-full">
      {/* Profile Header */}
      <section className="flex flex-col items-center pt-stack-sm text-center relative">
        <div className="relative mb-stack-sm group">
          <img
            src={currentAvatarUrl}
            alt={player.name}
            className="w-24 h-24 rounded-full object-cover border-2 border-primary shadow-[0_0_15px_rgba(255,181,158,0.3)]"
          />
          <div className="absolute -bottom-2 -right-2 bg-secondary-container text-on-secondary-container px-2 py-1 rounded-full font-label-caps text-[10px] flex items-center gap-1">
            <span
              className="material-symbols-outlined text-[12px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              star
            </span>{" "}
            {player.role || "ELITE"}
          </div>
        </div>

        <h2 className="font-headline text-headline-lg-mobile text-on-background uppercase tracking-tight">
          {player.name}
        </h2>

        <p className="font-body text-body-md text-on-surface-variant flex items-center gap-1 mt-1 justify-center">
          <span className="material-symbols-outlined text-sm text-emerald-400">wifi</span> Online
        </p>

        {/* Edit Profile Button (Shown ONLY if authenticated user owns profile or is admin) */}
        {canEdit && (
          <button
            onClick={handleOpenModal}
            className="mt-3 bg-surface-container hover:bg-surface-container-high border border-primary/40 text-primary font-label-caps text-xs uppercase font-bold rounded-xl px-4 py-2 flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(255,77,0,0.15)]"
          >
            <span className="material-symbols-outlined text-sm">edit</span>
            EDIT PROFILE
          </button>
        )}
      </section>

      {/* Stats Bento Grid */}
      <section className="grid grid-cols-2 gap-gutter">
        {/* Matches */}
        <div className="glass-panel rounded-xl p-stack-md flex flex-col justify-between">
          <span className="font-label-caps text-label-caps text-on-surface-variant mb-2">MATCHES</span>
          <span className="font-display-stat text-display-stat text-on-background">{player.stats.matches}</span>
        </div>

        {/* Wins */}
        <div className="glass-panel rounded-xl p-stack-md flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-20">
            <span
              className="material-symbols-outlined text-4xl text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              emoji_events
            </span>
          </div>
          <span className="font-label-caps text-label-caps text-on-surface-variant mb-2 relative z-10">WINS</span>
          <span className="font-display-stat text-display-stat text-primary relative z-10 glow-effect">{player.stats.wins}</span>
        </div>

        {/* Kills */}
        <div className="glass-panel rounded-xl p-stack-md flex flex-col justify-between">
          <span className="font-label-caps text-label-caps text-on-surface-variant mb-2">KILLS</span>
          <span className="font-display-stat text-display-stat text-on-background">{player.stats.kills}</span>
        </div>

        {/* Avg Kills */}
        <div className="glass-panel rounded-xl p-stack-md flex flex-col justify-between">
          <span className="font-label-caps text-label-caps text-on-surface-variant mb-2">AVG KILLS</span>
          <span className="font-display-stat text-display-stat text-on-background">{player.stats.avgKills}</span>
        </div>
      </section>

      {/* Performance Chart */}
      <section className="glass-panel rounded-xl p-stack-md">
        <div className="flex justify-between items-center mb-stack-md">
          <h3 className="font-headline text-headline-md text-on-background">Performance</h3>
          <span className="font-label-caps text-label-caps text-primary">LAST 10 MATCHES</span>
        </div>
        <PerformanceChart data={player.performance} />
      </section>

      {/* Recent Matches */}
      <section className="flex flex-col gap-stack-sm pb-stack-lg">
        <h3 className="font-headline text-headline-md text-on-background mb-stack-sm">
          Recent Matches
        </h3>
        {player.recentMatches.length > 0 ? (
          player.recentMatches.map((match) => {
            const isWin = match.placement === 1;
            return (
              <Link
                key={match.id}
                href={`/matches/${match.id}`}
                className="glass-panel rounded-lg p-stack-sm flex items-center justify-between hover:bg-surface-container transition-colors group cursor-pointer block"
              >
                <div className="flex items-center gap-stack-sm">
                  <div
                    className={`w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center ${
                      isWin ? "text-primary" : "text-on-surface-variant"
                    }`}
                  >
                    <span className="material-symbols-outlined">swords</span>
                  </div>
                  <div>
                    <div className="font-stat-value text-stat-value text-on-background group-hover:text-primary transition-colors">
                      Match #{match.matchNumber}
                    </div>
                    <div className="font-label-caps text-label-caps text-on-surface-variant">
                      PLACEMENT #{match.placement}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-stat-value text-stat-value ${isWin ? "text-primary" : "text-on-surface"}`}>
                    {isWin ? "VICTORY" : "COMPLETE"}
                  </div>
                  <div className="font-label-caps text-label-caps text-on-surface-variant">
                    {match.kills} KILLS
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="text-center py-6 text-on-surface-variant font-label-caps text-label-caps">
            NO MATCHES LOGGED YET FOR THIS PLAYER
          </div>
        )}
      </section>

      {/* Modal Portal */}
      {isEditModalOpen && createPortal(editModalContent, document.body)}
    </main>
  );
}
