import React from "react";

export interface GoldenGunWinner {
  id: string;
  name: string;
  avatarUrl?: string;
}

interface GoldenGunAwardProps {
  totalKills?: number;
  peakKills?: number;
  winners?: GoldenGunWinner[];
  winnerName?: string;
  className?: string;
}

export default function GoldenGunAward({
  totalKills,
  peakKills,
  winners = [],
  winnerName,
  className = "",
}: GoldenGunAwardProps) {
  const displayKills = totalKills ?? peakKills ?? 0;
  const activeWinners =
    winners.length > 0
      ? winners
      : winnerName
      ? [{ id: "legacy", name: winnerName }]
      : [];

  const hasWinners = activeWinners.length > 0 && displayKills > 0;

  return (
    <div
      className={`glass-panel rounded-xl p-4 border border-[#D4AF37]/30 bg-gradient-to-br from-[#171717] to-[#1f190e] flex items-center justify-between gap-4 ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/40 flex items-center justify-center text-gold shadow-[0_0_12px_rgba(212,175,55,0.2)]">
          <span
            className="material-symbols-outlined text-2xl text-gold"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            military_tech
          </span>
        </div>

        <div>
          <span className="font-label-caps text-xs text-gold/90 uppercase tracking-widest block font-bold">
            🏆 GOLDEN GUN AWARD
          </span>

          <span className="font-headline text-headline-sm text-on-surface uppercase">
            {hasWinners
              ? activeWinners.map((w) => w.name).join(" & ")
              : "NO WINNER YET"}
          </span>
        </div>
      </div>

      <div className="text-right">
        {hasWinners ? (
          <>
            <span className="font-stat-value text-stat-value text-gold block font-mono font-bold">
              {displayKills} KILLS
            </span>
            <span className="font-label-caps text-[10px] text-on-surface-variant uppercase">
              TOTAL SESSION KILLS
            </span>
          </>
        ) : (
          <span className="font-body text-xs text-on-surface-variant italic">
            No frags recorded
          </span>
        )}
      </div>
    </div>
  );
}
