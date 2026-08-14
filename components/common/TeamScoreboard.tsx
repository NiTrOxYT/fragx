import React from "react";
import { TeamScoreboardData } from "@/lib/services/stats";

interface TeamScoreboardProps {
  data: TeamScoreboardData;
}

export default function TeamScoreboard({ data }: TeamScoreboardProps) {
  const {
    team1,
    team2,
    tonightMatchCount,
    totalTournamentMatches,
    matchesRemaining,
    latestSessionDateStr,
  } = data;

  const isTeam1Leading = team1.sessionWins > team2.sessionWins;
  const isTeam2Leading = team2.sessionWins > team1.sessionWins;

  const clipChamferLg = {
    clipPath:
      "polygon(16px 0, calc(100% - 16px) 0, 100% 16px, 100% calc(100% - 16px), calc(100% - 16px) 100%, 16px 100%, 0 calc(100% - 16px), 0 16px)",
  };

  const clipChamferMd = {
    clipPath:
      "polygon(12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 12px), 0 12px)",
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-2 sm:py-6 px-1 sm:px-4">
      {/* Outer Tournament Poster Card Container */}
      <section className="w-full relative bg-[#050608] border-2 border-[#1E2536] rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.95)] text-on-surface">
        {/* Dynamic Backdrop Lighting */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#080B12] via-[#0C0D11] to-[#040507] z-0" />
        {/* Left Blue Radial Energy Glow */}
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-cyan-500/25 blur-[140px] rounded-full pointer-events-none z-0" />
        {/* Right Gold Radial Energy Glow */}
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-amber-500/25 blur-[140px] rounded-full pointer-events-none z-0" />

        {/* Diagonal Light Rays & Scratch Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/15 via-transparent to-amber-900/15 pointer-events-none z-0" />

        {/* Poster Content Canvas */}
        <div className="relative z-10 p-3 sm:p-6 md:p-10 flex flex-col gap-5 sm:gap-8 items-center">
          {/* 1. TOP TOURNAMENT HEADER */}
          <div className="flex flex-col items-center text-center space-y-1.5 w-full">
            {/* Gold Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1 bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 border-y-2 border-amber-400/60 text-amber-300 font-label-caps text-[10px] sm:text-xs tracking-[0.25em] font-extrabold uppercase shadow-[0_0_20px_rgba(212,175,55,0.25)]">
              <span>🏆 BGMI SQUAD TOURNAMENT</span>
            </div>

            {/* Main Title: EPIC BATTLE */}
            <h1 className="font-headline text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-100 to-gray-400 uppercase font-black tracking-tight italic drop-shadow-[0_6px_16px_rgba(0,0,0,0.95)]">
              EPIC BATTLE
            </h1>

            {/* Subtitle Arrow Bar */}
            <div className="flex items-center gap-2 text-amber-400 font-label-caps text-[10px] sm:text-sm tracking-[0.25em] font-black uppercase">
              <span className="text-amber-500 font-bold">»»»</span>
              <span className="text-white drop-shadow-sm">EVERY ROUND MATTERS</span>
              <span className="text-amber-500 font-bold">«««</span>
            </div>
          </div>

          {/* 2. TEAM VS TEAM SECTION */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-6 w-full">
            {/* TEAM 1 (Electric Blue Side) */}
            <div
              style={clipChamferLg}
              className="bg-gradient-to-br from-[#0B1E38] via-[#071428] to-[#030914] border-2 border-cyan-400/80 p-2.5 sm:p-5 flex items-center gap-2.5 sm:gap-4 shadow-[0_0_30px_rgba(6,182,212,0.3)] relative overflow-hidden min-w-0"
            >
              <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-900 border-2 border-cyan-300 flex items-center justify-center font-display-stat text-xl sm:text-4xl text-black font-black flex-shrink-0 shadow-[0_0_20px_rgba(6,182,212,0.7)]">
                {team1.initial}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-label-caps text-[9px] sm:text-[11px] text-cyan-300 font-black uppercase tracking-wider">
                  TEAM 1
                </span>
                <h3 className="font-headline text-xs sm:text-2xl text-white uppercase font-black truncate drop-shadow-md">
                  {team1.name}
                </h3>
              </div>
            </div>

            {/* VS EMBLEM */}
            <div className="relative flex flex-col items-center justify-center px-1">
              <div className="font-headline text-2xl sm:text-4xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-amber-300 font-black italic tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.9)]">
                VS
              </div>
            </div>

            {/* TEAM 2 (Gold Side) */}
            <div
              style={clipChamferLg}
              className="bg-gradient-to-bl from-[#332709] via-[#201804] to-[#0D0A02] border-2 border-amber-400/80 p-2.5 sm:p-5 flex items-center justify-end gap-2.5 sm:gap-4 shadow-[0_0_30px_rgba(245,158,11,0.3)] relative overflow-hidden min-w-0 text-right"
            >
              <div className="flex flex-col min-w-0 items-end">
                <span className="font-label-caps text-[9px] sm:text-[11px] text-amber-300 font-black uppercase tracking-wider">
                  TEAM 2
                </span>
                <h3 className="font-headline text-xs sm:text-2xl text-white uppercase font-black truncate drop-shadow-md">
                  {team2.name}
                </h3>
              </div>
              <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-700 border-2 border-amber-300 flex items-center justify-center font-display-stat text-xl sm:text-4xl text-black font-black flex-shrink-0 shadow-[0_0_20px_rgba(245,158,11,0.7)]">
                {team2.initial}
              </div>
            </div>
          </div>

          {/* 3. MAIN GIANT SCORE DISPLAY */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-6 w-full">
            {/* Team 1 Score Box (Blue Chamfered Octagonal Frame) */}
            <div
              style={clipChamferLg}
              className={`p-4 sm:p-8 flex flex-col items-center justify-center border-2 transition-all relative overflow-hidden ${
                isTeam1Leading
                  ? "bg-gradient-to-b from-[#0A2750] via-[#051733] to-[#020A17] border-cyan-400 shadow-[0_0_40px_rgba(6,182,212,0.4)]"
                  : "bg-gradient-to-b from-[#061A36] via-[#030F22] to-[#010610] border-cyan-600/50"
              }`}
            >
              <span className="font-display-stat text-6xl sm:text-8xl md:text-9xl text-white font-black drop-shadow-[0_0_25px_rgba(6,182,212,0.8)] tracking-tighter">
                {team1.sessionWins}
              </span>
              <span className="font-label-caps text-[10px] sm:text-xs text-cyan-300 font-black uppercase tracking-widest mt-1">
                SESSION WINS
              </span>
              <span className="font-mono text-[10px] sm:text-xs text-cyan-400/90 mt-0.5 font-extrabold">
                ({team1.tonightMatchesWon} Wins Tonight)
              </span>
            </div>

            {/* Score Update Crosshair Center Badge */}
            <div className="flex flex-col items-center justify-center p-1 sm:p-3 text-center">
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-[#10141F] border-2 border-amber-400 flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.5)] mb-1">
                <span className="material-symbols-outlined text-xl sm:text-3xl">
                  crosshair
                </span>
              </div>
              <span className="font-label-caps text-[8px] sm:text-[10px] text-on-surface-variant uppercase font-black tracking-widest">
                SCORE
              </span>
              <span className="font-label-caps text-[8px] sm:text-[10px] text-amber-400 uppercase font-black tracking-widest">
                UPDATE
              </span>
            </div>

            {/* Team 2 Score Box (Gold Chamfered Octagonal Frame) */}
            <div
              style={clipChamferLg}
              className={`p-4 sm:p-8 flex flex-col items-center justify-center border-2 transition-all relative overflow-hidden ${
                isTeam2Leading
                  ? "bg-gradient-to-b from-[#3D2F09] via-[#241B03] to-[#120D01] border-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.4)]"
                  : "bg-gradient-to-b from-[#261D05] via-[#140F02] to-[#0A0701] border-amber-600/50"
              }`}
            >
              <span className="font-display-stat text-6xl sm:text-8xl md:text-9xl text-white font-black drop-shadow-[0_0_25px_rgba(245,158,11,0.8)] tracking-tighter">
                {team2.sessionWins}
              </span>
              <span className="font-label-caps text-[10px] sm:text-xs text-amber-300 font-black uppercase tracking-widest mt-1">
                SESSION WINS
              </span>
              <span className="font-mono text-[10px] sm:text-xs text-amber-400/90 mt-0.5 font-extrabold">
                ({team2.tonightMatchesWon} Wins Tonight)
              </span>
            </div>
          </div>

          {/* 4. INTEGRATED TOURNAMENT STATISTICS STRIP (3 Chamfered Bento Cards) */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full">
            {/* Section 1: Total Rounds */}
            <div
              style={clipChamferMd}
              className="bg-gradient-to-b from-[#0B1E38] to-[#040C1A] border-2 border-cyan-500/60 p-3 sm:p-5 flex flex-col items-center text-center shadow-[0_0_20px_rgba(6,182,212,0.2)]"
            >
              <span className="material-symbols-outlined text-cyan-400 text-xl sm:text-3xl mb-1">
                crosshair
              </span>
              <span className="font-display-stat text-2xl sm:text-4xl md:text-5xl text-white font-black">
                {totalTournamentMatches}
              </span>
              <span className="font-label-caps text-[9px] sm:text-xs text-cyan-300 font-black uppercase tracking-wider mt-1">
                TOTAL ROUNDS
              </span>
              <span className="font-label-caps text-[8px] sm:text-[10px] text-cyan-400/80 font-bold uppercase">
                TOURNAMENT
              </span>
            </div>

            {/* Section 2: Matches Played Tonight */}
            <div
              style={clipChamferMd}
              className="bg-gradient-to-b from-[#332608] to-[#171103] border-2 border-amber-500/60 p-3 sm:p-5 flex flex-col items-center text-center shadow-[0_0_20px_rgba(245,158,11,0.2)]"
            >
              <span className="material-symbols-outlined text-amber-400 text-xl sm:text-3xl mb-1">
                calendar_month
              </span>
              <span className="font-display-stat text-2xl sm:text-4xl md:text-5xl text-amber-400 font-black">
                {tonightMatchCount}
              </span>
              <span className="font-label-caps text-[9px] sm:text-xs text-amber-300 font-black uppercase tracking-wider mt-1">
                MATCHES PLAYED
              </span>
              <span className="font-label-caps text-[8px] sm:text-[10px] text-amber-400/80 font-bold uppercase">
                TONIGHT
              </span>
            </div>

            {/* Section 3: Matches Remaining */}
            <div
              style={clipChamferMd}
              className="bg-gradient-to-b from-[#332608] to-[#171103] border-2 border-amber-500/60 p-3 sm:p-5 flex flex-col items-center text-center shadow-[0_0_20px_rgba(245,158,11,0.2)]"
            >
              <span className="material-symbols-outlined text-amber-400 text-xl sm:text-3xl mb-1">
                bar_chart
              </span>
              <span className="font-display-stat text-2xl sm:text-4xl md:text-5xl text-amber-400 font-black">
                {matchesRemaining}
              </span>
              <span className="font-label-caps text-[9px] sm:text-xs text-amber-300 font-black uppercase tracking-wider mt-1">
                MATCHES
              </span>
              <span className="font-label-caps text-[8px] sm:text-[10px] text-amber-400/80 font-bold uppercase">
                REMAINING
              </span>
            </div>
          </div>

          {/* 5. SESSION DATE STRIP */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#101420] border border-surface-container-high rounded-full font-mono text-xs text-on-surface-variant font-bold">
            <span className="text-primary font-bold">TONIGHT'S MATCHES</span>
            <span>|</span>
            <span className="text-white">{latestSessionDateStr}</span>
          </div>

          {/* 6. BOTTOM SLOGAN FOOTER */}
          <div className="flex flex-col items-center text-center pt-4 border-t border-surface-container-high/60 w-full space-y-2">
            <h2 className="font-headline text-sm sm:text-xl md:text-2xl text-white uppercase tracking-widest font-black drop-shadow-md">
              ONE GOAL. ONE CHAMPION.
            </h2>
            <h3 className="font-headline text-base sm:text-2xl md:text-3xl text-amber-400 uppercase tracking-wider font-black italic drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
              THE WAR IS NOT OVER!
            </h3>

            <div className="flex items-center gap-2 sm:gap-4 text-amber-300 font-label-caps text-[10px] sm:text-xs font-black tracking-widest uppercase pt-2">
              <span>🏆</span>
              <span>STAY FOCUSED</span>
              <span>|</span>
              <span>STAY UNITED</span>
              <span>|</span>
              <span>FINISH STRONG</span>
              <span>🏆</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
