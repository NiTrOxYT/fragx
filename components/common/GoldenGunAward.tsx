import React from "react";

interface GoldenGunAwardProps {
  peakKills: number;
  winnerName?: string;
  className?: string;
}

export default function GoldenGunAward({ peakKills, winnerName, className = "" }: GoldenGunAwardProps) {
  return (
    <div className={`flex items-center gap-2 text-primary ${className}`}>
      <span className="material-symbols-outlined text-lg text-gold" style={{ fontVariationSettings: "'FILL' 1" }}>
        stars
      </span>
      <span className="font-stat-value text-stat-value uppercase tracking-wider text-gold">
        GOLDEN GUN AWARD {winnerName ? `(${winnerName.toUpperCase()})` : ""}
      </span>
    </div>
  );
}
