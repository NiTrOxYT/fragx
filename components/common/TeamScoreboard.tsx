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

  return (
    <div className="w-full max-w-6xl mx-auto py-2 sm:py-6 px-1 sm:px-4">
      {/* CANONICAL TOURNAMENT SCOREBOARD POSTER CONTAINER */}
      <section className="w-full relative bg-[#040508] border-2 border-[#1B2232] rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.95)] text-on-surface select-none">
        {/* Dynamic Dark Gritty Background with Lightning & Fire Energy Bursts */}
        <div className="absolute inset-0 bg-[#05070B] z-0" />
        
        {/* Electric Blue Burst Explosion Top-Left */}
        <div className="absolute -top-24 -left-24 w-[450px] h-[450px] bg-gradient-to-br from-blue-600/35 via-cyan-500/20 to-transparent blur-[110px] rounded-full pointer-events-none z-0" />
        
        {/* Gold/Amber Burst Explosion Top-Right */}
        <div className="absolute -top-24 -right-24 w-[450px] h-[450px] bg-gradient-to-bl from-amber-500/35 via-yellow-500/20 to-transparent blur-[110px] rounded-full pointer-events-none z-0" />
        
        {/* Central Dark Void Gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#06080E]/70 to-[#030406] pointer-events-none z-0" />

        {/* Diagonal Ray & Sparkle Texture Overlay */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none z-0 mix-blend-overlay"
          style={{
            backgroundImage: `radial-gradient(rgba(255,255,255,0.4) 1px, transparent 0)`,
            backgroundSize: "24px 24px"
          }}
        />

        {/* Main Content Layout */}
        <div className="relative z-10 p-4 sm:p-8 md:p-12 flex flex-col gap-6 sm:gap-9 items-center">
          
          {/* ============================================================ */}
          {/* 1. TOP TOURNAMENT HEADER */}
          {/* ============================================================ */}
          <div className="flex flex-col items-center text-center space-y-1.5 w-full">
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 via-amber-500/25 to-amber-500/10 border border-amber-400/60 text-amber-400 font-label-caps text-[10px] sm:text-xs tracking-[0.25em] font-extrabold uppercase shadow-[0_0_20px_rgba(212,175,55,0.3)]">
              <span className="material-symbols-outlined text-sm text-amber-400">emoji_events</span>
              <span>BGMI SQUAD TOURNAMENT</span>
            </div>

            {/* Giant Title: EPIC BATTLE */}
            <h1 className="font-headline text-5xl sm:text-7xl md:text-8xl lg:text-9xl text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-200 to-gray-400 uppercase font-black tracking-tight italic drop-shadow-[0_8px_20px_rgba(0,0,0,0.95)]">
              EPIC BATTLE
            </h1>

            {/* Subtitle Arrow Bar */}
            <div className="flex items-center gap-2 text-amber-400 font-label-caps text-[11px] sm:text-sm tracking-[0.25em] font-black uppercase">
              <span className="text-amber-500">»»»</span>
              <span className="text-white drop-shadow">EVERY ROUND MATTERS</span>
              <span className="text-amber-500">«««</span>
            </div>
          </div>

          {/* ============================================================ */}
          {/* 2. TEAM VS TEAM SECTION (Blue Left vs Gold Right) */}
          {/* ============================================================ */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-6 w-full">
            
            {/* TEAM 1 (Electric Blue Side) */}
            <div className="flex items-center gap-2 sm:gap-4 bg-gradient-to-r from-[#0A1A36]/90 via-[#071328]/80 to-[#040A18]/60 border-2 border-cyan-400/80 rounded-2xl p-2.5 sm:p-5 shadow-[0_0_35px_rgba(6,182,212,0.35)] relative overflow-hidden min-w-0">
              {/* Left Mascot Shield */}
              <div className="w-12 h-12 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-600 to-blue-950 border-2 border-cyan-300 flex items-center justify-center font-display-stat text-2xl sm:text-5xl text-white font-black flex-shrink-0 shadow-[0_0_25px_rgba(6,182,212,0.8)] relative">
                {/* SVG Mascot Emblem / Initial */}
                <svg className="w-8 h-8 sm:w-14 sm:h-14 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center font-black text-white drop-shadow">
                  {team1.initial}
                </span>
              </div>

              {/* Team 1 Info */}
              <div className="flex flex-col min-w-0">
                <span className="font-label-caps text-[9px] sm:text-[11px] text-cyan-400 font-extrabold uppercase tracking-widest">
                  TEAM 1
                </span>
                <h3 className="font-headline text-sm sm:text-3xl text-cyan-300 uppercase font-black tracking-wide truncate italic drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]">
                  {team1.name}
                </h3>
              </div>
            </div>

            {/* VS EMBLEM WITH LIGHTNING SLASH */}
            <div className="relative flex flex-col items-center justify-center px-1 sm:px-3">
              <div className="font-headline text-3xl sm:text-5xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-amber-300 font-black italic tracking-tighter drop-shadow-[0_0_25px_rgba(255,255,255,0.95)]">
                VS
              </div>
            </div>

            {/* TEAM 2 (Gold Side) */}
            <div className="flex items-center justify-end gap-2 sm:gap-4 bg-gradient-to-l from-[#362908]/90 via-[#261C04]/80 to-[#120D02]/60 border-2 border-amber-400/80 rounded-2xl p-2.5 sm:p-5 shadow-[0_0_35px_rgba(245,158,11,0.35)] relative overflow-hidden min-w-0 text-right">
              {/* Team 2 Info */}
              <div className="flex flex-col min-w-0 items-end">
                <span className="font-label-caps text-[9px] sm:text-[11px] text-amber-400 font-extrabold uppercase tracking-widest">
                  TEAM 2
                </span>
                <h3 className="font-headline text-sm sm:text-3xl text-amber-300 uppercase font-black tracking-wide truncate italic drop-shadow-[0_0_15px_rgba(245,158,11,0.6)]">
                  {team2.name}
                </h3>
              </div>

              {/* Right Mascot Shield */}
              <div className="w-12 h-12 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-800 border-2 border-amber-300 flex items-center justify-center font-display-stat text-2xl sm:text-5xl text-black font-black flex-shrink-0 shadow-[0_0_25px_rgba(245,158,11,0.8)] relative">
                {/* SVG Mascot Emblem / Initial */}
                <svg className="w-8 h-8 sm:w-14 sm:h-14 text-black drop-shadow" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center font-black text-black">
                  {team2.initial}
                </span>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* 3. HUGE SCORE DISPLAY & SCORE UPDATE CROSSHAIR */}
          {/* ============================================================ */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-6 w-full">
            
            {/* Team 1 Giant Score Frame (Blue Hex Box) */}
            <div
              className={`p-4 sm:p-9 rounded-2xl flex flex-col items-center justify-center border-2 transition-all relative overflow-hidden ${
                isTeam1Leading
                  ? "bg-gradient-to-b from-[#0B254E] via-[#061836] to-[#020A1A] border-cyan-400 shadow-[0_0_45px_rgba(6,182,212,0.45)]"
                  : "bg-gradient-to-b from-[#061734] via-[#030E22] to-[#010612] border-cyan-600/50"
              }`}
            >
              <span className="font-display-stat text-6xl sm:text-8xl md:text-9xl text-white font-black drop-shadow-[0_0_30px_rgba(6,182,212,0.85)] tracking-tighter">
                {team1.sessionWins}
              </span>
              <span className="font-label-caps text-[10px] sm:text-xs text-cyan-300 font-extrabold uppercase tracking-widest mt-1">
                SESSION WINS
              </span>
              <span className="font-mono text-[10px] sm:text-xs text-cyan-400/90 mt-0.5 font-extrabold">
                ({team1.tonightMatchesWon} Wins Tonight)
              </span>
            </div>

            {/* Score Update Crosshair Badge */}
            <div className="flex flex-col items-center justify-center p-1 sm:p-4 text-center">
              <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-[#121624] border-2 border-amber-400 flex items-center justify-center text-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.5)] mb-1">
                <span className="material-symbols-outlined text-2xl sm:text-4xl">
                  crosshair
                </span>
              </div>
              <span className="font-label-caps text-[8px] sm:text-[11px] text-on-surface-variant uppercase font-black tracking-widest">
                SCORE
              </span>
              <span className="font-label-caps text-[8px] sm:text-[11px] text-amber-400 uppercase font-black tracking-widest">
                UPDATE
              </span>
            </div>

            {/* Team 2 Giant Score Frame (Gold Hex Box) */}
            <div
              className={`p-4 sm:p-9 rounded-2xl flex flex-col items-center justify-center border-2 transition-all relative overflow-hidden ${
                isTeam2Leading
                  ? "bg-gradient-to-b from-[#3D2D08] via-[#241B03] to-[#120D01] border-amber-400 shadow-[0_0_45px_rgba(245,158,11,0.45)]"
                  : "bg-gradient-to-b from-[#261C05] via-[#140F02] to-[#0A0701] border-amber-600/50"
              }`}
            >
              <span className="font-display-stat text-6xl sm:text-8xl md:text-9xl text-white font-black drop-shadow-[0_0_30px_rgba(245,158,11,0.85)] tracking-tighter">
                {team2.sessionWins}
              </span>
              <span className="font-label-caps text-[10px] sm:text-xs text-amber-300 font-extrabold uppercase tracking-widest mt-1">
                SESSION WINS
              </span>
              <span className="font-mono text-[10px] sm:text-xs text-amber-400/90 mt-0.5 font-extrabold">
                ({team2.tonightMatchesWon} Wins Tonight)
              </span>
            </div>
          </div>

          {/* ============================================================ */}
          {/* 4. INTEGRATED TOURNAMENT STATISTICS BAR (3 Connected Panels) */}
          {/* ============================================================ */}
          <div className="w-full relative">
            <div className="grid grid-cols-3 gap-2 sm:gap-4 bg-[#090D18] border-2 border-surface-container-high p-2.5 sm:p-4 rounded-2xl shadow-2xl relative z-10">
              
              {/* Segment 1: Total Rounds */}
              <div className="bg-gradient-to-b from-[#0A1C36] to-[#040C1A] border-2 border-cyan-500/60 rounded-xl p-3 sm:p-5 flex flex-col items-center text-center shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                {/* Crossed Rifles Icon */}
                <span className="material-symbols-outlined text-cyan-400 text-2xl sm:text-4xl mb-1">
                  crosshair
                </span>
                <span className="font-display-stat text-2xl sm:text-5xl text-white font-black">
                  {totalTournamentMatches}
                </span>
                <span className="font-label-caps text-[9px] sm:text-xs text-cyan-300 font-black uppercase tracking-wider mt-1">
                  TOTAL ROUNDS
                </span>
              </div>

              {/* Segment 2: Matches Played */}
              <div className="bg-gradient-to-b from-[#332507] to-[#171003] border-2 border-amber-500/60 rounded-xl p-3 sm:p-5 flex flex-col items-center text-center shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                <span className="material-symbols-outlined text-amber-400 text-2xl sm:text-4xl mb-1">
                  calendar_month
                </span>
                <span className="font-display-stat text-2xl sm:text-5xl text-amber-400 font-black">
                  {tonightMatchCount}
                </span>
                <span className="font-label-caps text-[9px] sm:text-xs text-amber-300 font-black uppercase tracking-wider mt-1">
                  MATCHES PLAYED
                </span>
              </div>

              {/* Segment 3: Matches Remaining */}
              <div className="bg-gradient-to-b from-[#332507] to-[#171003] border-2 border-amber-500/60 rounded-xl p-3 sm:p-5 flex flex-col items-center text-center shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                <span className="material-symbols-outlined text-amber-400 text-2xl sm:text-4xl mb-1">
                  bar_chart
                </span>
                <span className="font-display-stat text-2xl sm:text-5xl text-amber-400 font-black">
                  {matchesRemaining}
                </span>
                <span className="font-label-caps text-[9px] sm:text-xs text-amber-300 font-black uppercase tracking-wider mt-1">
                  MATCHES REMAINING
                </span>
              </div>
            </div>

            {/* Overlapping Date Badge */}
            <div className="flex justify-center -mt-3 relative z-20">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#121624] border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)] font-mono text-xs font-bold text-amber-300">
                <span className="material-symbols-outlined text-sm text-amber-400">calendar_today</span>
                <span>TONIGHT'S MATCHES</span>
                <span>|</span>
                <span className="text-white">{latestSessionDateStr}</span>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* 5. FOOTER SLOGAN BANNER */}
          {/* ============================================================ */}
          <div className="flex flex-col items-center text-center pt-4 border-t border-surface-container-high/60 w-full space-y-2">
            <h2 className="font-headline text-sm sm:text-2xl md:text-3xl text-white uppercase tracking-widest font-black drop-shadow-md">
              ONE GOAL. ONE CHAMPION.
            </h2>
            <h3 className="font-headline text-lg sm:text-3xl md:text-4xl text-amber-400 uppercase tracking-wider font-black italic drop-shadow-[0_0_20px_rgba(245,158,11,0.6)]">
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
