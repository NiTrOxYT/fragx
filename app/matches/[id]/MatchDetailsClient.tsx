"use client";

import { useState } from "react";
import ScreenshotModal from "@/components/common/ScreenshotModal";

interface MatchDetailsClientProps {
  match: {
    id: string;
    matchNumber: number;
    placement: number;
    kills: number;
    playerName: string;
    dateStr: string;
    screenshotUrl: string;
    duration: string;
  };
}

export default function MatchDetailsClient({ match }: MatchDetailsClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: `FRAGX - Match 0${match.matchNumber} (${match.playerName})`,
      text: `${match.playerName} got #${match.placement} Placement with ${match.kills} Kills on BGMI!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // Share cancelled or ignored
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch (err) {
        console.error("Clipboard copy failed", err);
      }
    }
  };

  return (
    <>
      <main className="flex-1 w-full max-w-md mx-auto pt-24 px-safe-margin pb-stack-lg flex flex-col gap-stack-lg relative z-10">
        {/* Primary Match Stat Hero */}
        <section className="flex flex-col items-center justify-center text-center">
          <div className="flex items-end gap-stack-md justify-center">
            <div className="flex flex-col items-center">
              <span
                className={`font-display-stat text-display-stat ${
                  match.placement === 1
                    ? "text-primary drop-shadow-[0_0_12px_rgba(255,181,158,0.4)]"
                    : "text-on-background"
                }`}
              >
                #{match.placement}
              </span>
              <span className="font-label-caps text-label-caps text-on-surface-variant mt-stack-sm uppercase">
                Placement
              </span>
            </div>

            <div className="h-12 w-px bg-surface-container-high mx-stack-sm mb-stack-sm" />

            <div className="flex flex-col items-center">
              <span className="font-display-stat text-display-stat text-on-background">
                {match.kills}
              </span>
              <span className="font-label-caps text-label-caps text-on-surface-variant mt-stack-sm uppercase">
                Kills
              </span>
            </div>
          </div>

          <div className="mt-stack-md flex items-center justify-center gap-stack-sm text-on-surface-variant font-label-caps text-label-caps border border-surface-container-high rounded-full px-4 py-2 bg-surface-container-low/50 backdrop-blur-sm">
            <span
              className="material-symbols-outlined text-[16px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              person
            </span>
            <span className="text-on-background">{match.playerName.toUpperCase()}</span>
            <span className="w-1 h-1 rounded-full bg-surface-container-highest mx-1" />
            <span>{match.dateStr}</span>
          </div>
        </section>

        {/* Match Screenshot / Highlight */}
        <section
          onClick={() => setIsModalOpen(true)}
          className="relative w-full aspect-video rounded-xl overflow-hidden border border-surface-container shadow-[0_8px_32px_rgba(0,0,0,0.6)] group cursor-pointer"
        >
          <img
            src={match.screenshotUrl}
            alt={`Match 0${match.matchNumber} proof`}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />

          {/* Glassmorphic Overlay for essential context */}
          <div className="absolute bottom-4 left-4 right-4 p-stack-sm rounded-lg bg-surface/60 backdrop-blur-md border border-surface-container-highest flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span
                className="material-symbols-outlined text-primary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                location_on
              </span>
              <span className="font-label-caps text-label-caps text-on-background">
                MATCH #{match.matchNumber} PROOF
              </span>
            </div>
            <span className="font-label-caps text-label-caps text-primary uppercase">
              {match.placement === 1 ? "VICTORY" : "COMPLETE"}
            </span>
          </div>
        </section>

        {/* Essential Secondary Stats */}
        <section className="grid grid-cols-2 gap-stack-md">
          <div className="bg-surface-container rounded-lg p-stack-md border border-surface-container-high flex flex-col justify-between">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-2">
              Match #
            </span>
            <span className="font-headline text-headline-md text-on-background">
              #{match.matchNumber}
            </span>
          </div>

          <div className="bg-surface-container rounded-lg p-stack-md border border-surface-container-high flex flex-col justify-between">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-2">
              Duration
            </span>
            <div className="flex items-end gap-1">
              <span className="font-headline text-headline-md text-on-background">
                {match.duration}
              </span>
            </div>
          </div>
        </section>

        {/* Action Button */}
        <button
          onClick={handleShare}
          className="w-full mt-auto bg-primary text-on-primary font-headline text-headline-md rounded-xl py-4 flex justify-center items-center gap-2 shadow-[0_0_20px_rgba(255,181,158,0.2)] hover:opacity-90 active:scale-[0.98] transition-all"
        >
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            share
          </span>
          {copied ? "LINK COPIED TO CLIPBOARD!" : "SHARE RESULT"}
        </button>
      </main>

      {/* Screenshot Full Screen Modal */}
      <ScreenshotModal
        isOpen={isModalOpen}
        src={match.screenshotUrl}
        alt={`Match #${match.matchNumber} screenshot`}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
