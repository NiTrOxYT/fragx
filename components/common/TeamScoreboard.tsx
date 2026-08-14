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
    totalSessionsPlayed,
    latestSessionDateStr,
  } = data;

  const isTeam1Leading = team1.sessionWins > team2.sessionWins;
  const isTeam2Leading = team2.sessionWins > team1.sessionWins;

  const clipChamfer = {
    clipPath:
      "polygon(14px 0, calc(100% - 14px) 0, 100% 14px, 100% calc(100% - 14px), calc(100% - 14px) 100%, 14px 100%, 0 calc(100% - 14px), 0 14px)",
  };

  const clipChamferSm = {
    clipPath:
      "polygon(10px 0, calc(100% - 10px) 0, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0 calc(100% - 10px), 0 10px)",
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-2 sm:py-6 px-1 sm:px-4">
      {/* Outer Tournament Poster Card Container */}
      <section className="w-full relative bg-[#07090E] border-2 border-surface-container-high rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.9)] text-on-surface">
        {/* Deep Textured Dynamic Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#090C14] via-[#0D0E12] to-[#050608] z-0" />
        {/* Electric Blue Aura Top-Left */}
        <div className="absolute -top-12 -left-12 w-80 h-80 bg-cyan-500/20 blur-[120px] rounded-full pointer-events-none z-0" />
        {/* Gold Aura Top-Right */}
        <div className="absolute -top-12 -right-12 w-80 h-80 bg-amber-500/20 blur-[120px] rounded-full pointer-events-none z-0" />
        {/* Diagonal Ray Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-amber-900/10 pointer-events-none z-0" />

        {/* Poster Content Grid */}
        <div className="relative z-10 p-3 sm:p-6 md:p-8 flex flex-col gap-4 sm:gap-7 items-center">
          {/* 1. TOP TOURNAMENT HEADER */}
          <div className="flex flex-col items-center text-center space-y-1 w-full">
            {/* Trophy Tagline Bar */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border-y border-amber-500/40 text-amber-400 font-label-caps text-[10px] sm:text-xs tracking-[0.25em] font-bold uppercase shadow-[0_0_15px_rgba(212,175,55,0.2)]">
              <span>🏆 BGMI WC TROPHY TOURNAMENT</span>
            </div>

            {/* Main Title: EPIC BATTLE */}
            <h1 className="font-headline text-3xl sm:text-5xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-100 to-gray-400 uppercase font-black tracking-tight italic drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
              EPIC BATTLE
            </h1>

            {/* Subtitle Arrow Bar */}
            <div className="flex items-center gap-2 text-amber-400 font-label-caps text-[10px] sm:text-xs tracking-[0.2em] font-extrabold uppercase">
              <span className="text-amber-500">»»»</span>
              <span className="text-on-surface">EVERY ROUND MATTERS</span>
              <span className="text-amber-500">«««</span>
            </div>
          </div>

          {/* 2. TEAM VS TEAM SECTION */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4 w-full">
            {/* TEAM 1 (Electric Blue Side) */}
            <div
              style={clipChamfer}
              className="bg-gradient-to-br from-[#0B1A30] via-[#081224] to-[#040914] border-2 border-cyan-500/60 p-2.5 sm:p-4 flex items-center gap-2 sm:gap-3 shadow-[0_0_25px_rgba(6,182,212,0.2)] relative overflow-hidden min-w-0"
            >
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-700 border-2 border-cyan-300 flex items-center justify-center font-display-stat text-xl sm:text-3xl text-black font-black flex-shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.6)]">
                {team1.initial}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-label-caps text-[9px] sm:text-[11px] text-cyan-400 font-bold uppercase tracking-wider">
                  TEAM 1
                </span>
                <h3 className="font-headline text-xs sm:text-xl text-white uppercase font-black truncate drop-shadow-md">
                  {team1.name}
                </h3>
              </div>
            </div>

            {/* VS LIGHTNING EMBLEM */}
            <div className="relative flex flex-col items-center justify-center px-1">
              <div className="font-headline text-xl sm:text-3xl md:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-amber-400 font-black italic tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">
                VS
              </div>
            </div>

            {/* TEAM 2 (Gold Side) */}
            <div
              style={clipChamfer}
              className="bg-gradient-to-bl from-[#2A210A] via-[#1E1707] to-[#0F0B03] border-2 border-amber-500/60 p-2.5 sm:p-4 flex items-center justify-end gap-2 sm:gap-3 shadow-[0_0_25px_rgba(245,158,11,0.2)] relative overflow-hidden min-w-0 text-right"
            >
              <div className="flex flex-col min-w-0 items-end">
                <span className="font-label-caps text-[9px] sm:text-[11px] text-amber-400 font-bold uppercase tracking-wider">
                  TEAM 2
                </span>
                <h3 className="font-headline text-xs sm:text-xl text-white uppercase font-black truncate drop-shadow-md">
                  {team2.name}
                </h3>
              </div>
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-700 border-2 border-amber-300 flex items-center justify-center font-display-stat text-xl sm:text-3xl text-black font-black flex-shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.6)]">
                {team2.initial}
              </div>
            </div>
          </div>

          {/* 3. MAIN GIANT SCORE DISPLAY */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4 w-full">
            {/* Team 1 Score Box (Blue Chamfered Frame) */}
            <div
              style={clipChamfer}
              className={`p-4 sm:p-7 flex flex-col items-center justify-center border-2 transition-all relative overflow-hidden ${
                isTeam1Leading
                  ? "bg-gradient-to-b from-[#0A2246] to-[#041126] border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.4)]"
                  : "bg-gradient-to-b from-[#06152B] to-[#030A16] border-cyan-600/40"
              }`}
            >
              <span className="font-display-stat text-5xl sm:text-7xl md:text-8xl text-white font-black drop-shadow-[0_0_20px_rgba(6,182,212,0.7)] tracking-tighter">
                {team1.sessionWins}
              </span>
              <span className="font-label-caps text-[10px] sm:text-xs text-cyan-300 font-extrabold uppercase tracking-widest mt-1">
                SESSION WINS
              </span>
              <span className="font-mono text-[10px] sm:text-xs text-cyan-400/80 mt-0.5 font-bold">
                ({team1.tonightMatchesWon} Wins Tonight)
              </span>
            </div>

            {/* Score Update Crosshair Center Badge */}
            <div className="flex flex-col items-center justify-center p-1 sm:p-3 text-center">
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-[#121620] border-2 border-primary/60 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(255,77,0,0.4)] mb-1">
                <span className="material-symbols-outlined text-lg sm:text-2xl">
                  crosshair
                </span>
              </div>
              <span className="font-label-caps text-[8px] sm:text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">
                SCORE
              </span>
              <span className="font-label-caps text-[8px] sm:text-[10px] text-primary uppercase font-bold tracking-widest">
                UPDATE
              </span>
            </div>

            {/* Team 2 Score Box (Gold Chamfered Frame) */}
            <div
              style={clipChamfer}
              className={`p-4 sm:p-7 flex flex-col items-center justify-center border-2 transition-all relative overflow-hidden ${
                isTeam2Leading
                  ? "bg-gradient-to-b from-[#382B09] to-[#1C1503] border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.4)]"
                  : "bg-gradient-to-b from-[#221A05] to-[#0E0B02] border-amber-600/40"
              }`}
            >
              <span className="font-display-stat text-5xl sm:text-7xl md:text-8xl text-white font-black drop-shadow-[0_0_20px_rgba(245,158,11,0.7)] tracking-tighter">
                {team2.sessionWins}
              </span>
              <span className="font-label-caps text-[10px] sm:text-xs text-amber-300 font-extrabold uppercase tracking-widest mt-1">
                SESSION WINS
              </span>
              <span className="font-mono text-[10px] sm:text-xs text-amber-400/80 mt-0.5 font-bold">
                ({team2.tonightMatchesWon} Wins Tonight)
              </span>
            </div>
          </div>

          {/* 4. THREE TOURNAMENT STAT PANELS */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full">
            {/* Panel 1: Total Rounds */}
            <div
              style={clipChamferSm}
              className="bg-gradient-to-b from-[#09182E] to-[#040C19] border-2 border-cyan-500/50 p-2.5 sm:p-4 flex flex-col items-center text-center shadow-[0_0_15px_rgba(6,182,212,0.15)]"
            >
              <span className="material-symbols-outlined text-cyan-400 text-lg sm:text-2xl mb-1">
                crosshair
              </span>
              <span className="font-display-stat text-xl sm:text-3xl text-white font-black">
                {totalTournamentMatches}
              </span>
              <span className="font-label-caps text-[9px] sm:text-[11px] text-cyan-300 font-bold uppercase tracking-wider mt-0.5">
                TOTAL ROUNDS
              </span>
              <span className="font-label-caps text-[8px] sm:text-[9px] text-cyan-400/70 font-semibold uppercase">
                TOURNAMENT
              </span>
            </div>

            {/* Panel 2: Matches Played Tonight */}
            <div
              style={clipChamferSm}
              className="bg-gradient-to-b from-[#322306] to-[#1A1203] border-2 border-amber-500/50 p-2.5 sm:p-4 flex flex-col items-center text-center shadow-[0_0_15px_rgba(245,158,11,0.15)]"
            >
              <span className="material-symbols-outlined text-amber-400 text-lg sm:text-2xl mb-1">
                calendar_month
              </span>
              <span className="font-display-stat text-xl sm:text-3xl text-amber-400 font-black">
                {tonightMatchCount}
              </span>
              <span className="font-label-caps text-[9px] sm:text-[11px] text-amber-300 font-bold uppercase tracking-wider mt-0.5">
                MATCHES PLAYED
              </span>
              <span className="font-label-caps text-[8px] sm:text-[9px] text-amber-400/70 font-semibold uppercase">
                TONIGHT ({latestSessionDateStr})
              </span>
            </div>

            {/* Panel 3: Sessions Played */}
            <div
              style={clipChamferSm}
              className="bg-gradient-to-b from-[#322306] to-[#1A1203] border-2 border-amber-500/50 p-2.5 sm:p-4 flex flex-col items-center text-center shadow-[0_0_15px_rgba(245,158,11,0.15)]"
            >
              <span className="material-symbols-outlined text-amber-400 text-lg sm:text-2xl mb-1">
                monitoring
              </span>
              <span className="font-display-stat text-xl sm:text-3xl text-amber-400 font-black">
                {totalSessionsPlayed}
              </span>
              <span className="font-label-caps text-[9px] sm:text-[11px] text-amber-300 font-bold uppercase tracking-wider mt-0.5">
                SESSIONS PLAYED
              </span>
              <span className="font-label-caps text-[8px] sm:text-[9px] text-amber-400/70 font-semibold uppercase">
                PUBLISHED
              </span>
            </div>
          </div>

          {/* 5. FOOTER SLOGAN BANNER */}
          <div className="flex flex-col items-center text-center pt-3 border-t border-surface-container-high/60 w-full space-y-1.5">
            <h2 className="font-headline text-xs sm:text-lg md:text-xl text-white uppercase tracking-widest font-black drop-shadow-md">
              ONE GOAL. ONE CHAMPION.
            </h2>
            <h3 className="font-headline text-sm sm:text-xl md:text-2xl text-amber-400 uppercase tracking-wider font-black italic drop-shadow-[0_0_10px_rgba(245,158,11,0.4)]">
              THE WAR IS NOT OVER!
            </h3>

            <div className="flex items-center gap-2 sm:gap-4 text-amber-400 font-label-caps text-[10px] sm:text-xs font-bold tracking-widest uppercase pt-1">
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
