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
      className={`relative w-full rounded-2xl border border-[#D4AF37]/45 bg-[#0D0D0D] overflow-hidden shadow-[0_0_40px_rgba(212,175,55,0.08)] transition-all duration-300 hover:border-[#D4AF37]/70 hover:shadow-[0_0_50px_rgba(212,175,55,0.15)] animate-in fade-in slide-in-from-bottom-2 duration-500 motion-reduce:animate-none ${className}`}
    >
      {/* Background Gradients & Glows */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-[#0F0E0B] via-[#1A160C] to-[#0D0D0D] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 w-72 h-72 bg-[#D4AF37]/10 blur-[90px] rounded-full pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute top-0 right-0 w-48 h-48 bg-[#FF4D00]/5 blur-[70px] rounded-full pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-[linear-gradient(115deg,transparent_20%,rgba(212,175,55,0.05)_45%,rgba(255,181,158,0.08)_50%,transparent_55%)] pointer-events-none"
        aria-hidden="true"
      />

      {/* Decorative Corner Accents */}
      <div
        className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#D4AF37]/80 rounded-tl-sm pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#D4AF37]/80 rounded-tr-sm pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#D4AF37]/80 rounded-bl-sm pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#D4AF37]/80 rounded-br-sm pointer-events-none"
        aria-hidden="true"
      />

      {/* Banner Content */}
      <div className="relative z-10 p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-5 text-center md:text-left">
        {/* Left Section: Badge + Winner Info */}
        <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-5 w-full md:w-auto">
          {/* Trophy Badge */}
          <div className="relative shrink-0 flex items-center justify-center w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-b from-[#2A2312] to-[#120F08] border border-[#D4AF37]/60 shadow-[0_0_20px_rgba(212,175,55,0.25)]">
            <span
              className="material-symbols-outlined text-3xl sm:text-4xl text-[#F5D76E] drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]"
              style={{ fontVariationSettings: "'FILL' 1" }}
              aria-hidden="true"
            >
              military_tech
            </span>
          </div>

          {/* Winner Details */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <span className="font-label-caps text-xs sm:text-sm font-bold tracking-[0.2em] text-[#D4AF37] uppercase">
                🏆 GOLDEN GUN AWARD
              </span>
              <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-[#D4AF37]/60" />
              <span className="hidden sm:inline-block font-label-caps text-[9px] tracking-widest text-[#D4AF37]/70 font-mono uppercase">
                SESSION AWARD
              </span>
            </div>

            <h3 className="font-headline text-2xl sm:text-3xl md:text-4xl font-extrabold text-on-surface uppercase tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
              {hasWinners
                ? activeWinners.map((w) => w.name).join(" • ")
                : "AWAITING THE NEXT BATTLE"}
            </h3>
          </div>
        </div>

        {/* Right Section: Kill Stat Counter / Empty State */}
        <div className="flex flex-col items-center md:items-end justify-center shrink-0 border-t md:border-t-0 md:border-l border-[#D4AF37]/20 pt-4 md:pt-0 md:pl-6 w-full md:w-auto">
          {hasWinners ? (
            <>
              <div className="flex items-baseline gap-1.5">
                <span className="font-stat-value text-3xl sm:text-4xl text-[#F5D76E] font-extrabold font-mono drop-shadow-[0_0_12px_rgba(245,215,110,0.3)]">
                  {displayKills}
                </span>
                <span className="font-label-caps text-sm text-[#F5D76E] font-bold">
                  KILLS
                </span>
              </div>
              <span className="font-label-caps text-[10px] sm:text-xs text-on-surface-variant font-bold tracking-widest uppercase mt-0.5">
                TOTAL SESSION KILLS
              </span>
            </>
          ) : (
            <div className="text-center md:text-right">
              <span className="font-label-caps text-xs text-[#D4AF37]/80 block font-bold">
                NO FRAGS RECORDED
              </span>
              <span className="font-body text-[11px] text-on-surface-variant italic">
                Publish a session to crown winner
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
