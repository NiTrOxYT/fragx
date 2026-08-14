import React from "react";
import { Syne, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { TeamScoreboardData } from "@/lib/services/stats";

const syne = Syne({
  weight: ["700", "800"],
  subsets: ["latin"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  weight: ["500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  weight: ["500", "700", "800"],
  subsets: ["latin"],
  display: "swap",
});

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
    totalSessionsPlayed,
    latestSessionDateStr,
  } = data;

  const isTeam1Leading = team1.sessionWins > team2.sessionWins;
  const isTeam2Leading = team2.sessionWins > team1.sessionWins;

  const totalKillsCombined = (team1.totalKills || 0) + (team2.totalKills || 0);
  const team1KillPercent =
    totalKillsCombined > 0
      ? Math.round(((team1.totalKills || 0) / totalKillsCombined) * 100)
      : 50;
  const team2KillPercent = 100 - team1KillPercent;

  return (
    <div className={`w-full max-w-7xl mx-auto py-4 sm:py-8 px-2 sm:px-6 ${plusJakarta.className}`}>
      {/* ================================================================ */}
      {/* 1. MASTER COCKPIT ENCLOSURE (Awwwards Doppelrand Architecture) */}
      {/* ================================================================ */}
      <div className="relative rounded-[2.5rem] p-2 sm:p-3.5 bg-gradient-to-b from-white/[0.12] via-white/[0.04] to-transparent ring-1 ring-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.9)] overflow-hidden">
        
        {/* Deep Vantablack Inner Core */}
        <div className="relative rounded-[calc(2.5rem-0.875rem)] bg-[#040508] overflow-hidden p-4 sm:p-8 md:p-12 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
          
          {/* ============================================================ */}
          {/* AMBIENT LIGHTING MESH & SPATIAL ENERGY PARTICLES */}
          {/* ============================================================ */}
          <div className="absolute inset-0 pointer-events-none z-0">
            {/* Real BG Texture Overlay */}
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-screen"
              style={{ backgroundImage: "url('/images/scoreboard-bg.png')" }}
            />
            {/* Deep Left Electric Cyan Glow */}
            <div className="absolute -top-32 -left-32 w-[550px] h-[550px] bg-cyan-500/20 blur-[150px] rounded-full" />
            {/* Deep Right Solar Gold Glow */}
            <div className="absolute -top-32 -right-32 w-[550px] h-[550px] bg-amber-500/20 blur-[150px] rounded-full" />
            {/* Center Grid Matrix Texture */}
            <div 
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
                backgroundSize: "32px 32px",
              }}
            />
          </div>

          <div className="relative z-10 flex flex-col gap-8 sm:gap-12 items-center">
            
            {/* ========================================================== */}
            {/* 2. TOP TELEMETRY DECK & TITLE */}
            {/* ========================================================== */}
            <header className="flex flex-col items-center text-center space-y-3 w-full">
              {/* Telemetry Status Bar */}
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-xl shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                  <span className={`text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase text-white/90 ${jetbrainsMono.className}`}>
                    OFFICIAL SQUAD TOURNAMENT
                  </span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 backdrop-blur-xl">
                  <span className="material-symbols-outlined text-[14px] text-amber-400">military_tech</span>
                  <span className={`text-[10px] sm:text-[11px] font-bold tracking-[0.15em] uppercase ${jetbrainsMono.className}`}>
                    SERIES IV
                  </span>
                </div>
              </div>

              {/* Massive Title: EPIC BATTLE */}
              <div className="relative">
                <h1 className={`text-5xl sm:text-7xl md:text-8xl lg:text-[7.5rem] tracking-tight uppercase font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white via-neutral-100 to-neutral-400 leading-none drop-shadow-[0_10px_30px_rgba(0,0,0,0.9)] ${syne.className}`}>
                  EPIC BATTLE
                </h1>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-40 sm:w-60 h-[2px] bg-gradient-to-r from-cyan-500 via-white to-amber-500 opacity-60 blur-[0.5px]" />
              </div>

              {/* Subtitle Eyebrow */}
              <div className={`flex items-center justify-center gap-3 text-white/60 text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase pt-1 ${jetbrainsMono.className}`}>
                <span className="text-cyan-400 font-bold">»»»</span>
                <span className="text-white/90">EVERY ROUND MATTERS</span>
                <span className="text-amber-400 font-bold">«««</span>
              </div>
            </header>

            {/* ========================================================== */}
            {/* 3. MAIN ARENA: TEAM CARDS + ORBITAL VS NEXUS */}
            {/* ========================================================== */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] items-center gap-4 sm:gap-6">
              
              {/* -------------------------------------------------------- */}
              {/* TEAM 1 TITAN (Electric Cobalt / Cyan Card) */}
              {/* -------------------------------------------------------- */}
              <div className="relative rounded-[2rem] p-1.5 bg-gradient-to-br from-cyan-400/30 via-blue-600/10 to-transparent ring-1 ring-cyan-400/30 shadow-[0_0_50px_rgba(6,182,212,0.15)] group transition-all duration-500 hover:shadow-[0_0_70px_rgba(6,182,212,0.25)]">
                <div className="rounded-[calc(2rem-0.375rem)] bg-gradient-to-br from-[#060D1A]/95 via-[#030812]/90 to-[#020408]/95 p-5 sm:p-7 flex flex-col gap-6 relative overflow-hidden backdrop-blur-xl">
                  {/* Subtle Top Inner Edge Highlight */}
                  <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
                  
                  {/* Team 1 Header */}
                  <div className="flex items-center gap-4 sm:gap-5">
                    {/* Machined Hardware Shield */}
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl p-1 bg-gradient-to-br from-cyan-400 via-blue-600 to-transparent ring-1 ring-cyan-300/40 shadow-[0_0_30px_rgba(6,182,212,0.5)] flex-shrink-0 flex items-center justify-center">
                      <div className="w-full h-full rounded-[0.85rem] bg-[#030914] flex items-center justify-center">
                        <span className={`text-2xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white via-cyan-200 to-cyan-400 ${syne.className}`}>
                          {team1.initial}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col min-w-0">
                      <span className={`text-[10px] sm:text-xs font-bold tracking-[0.2em] text-cyan-400 uppercase ${jetbrainsMono.className}`}>
                        CHALLENGER SQUAD
                      </span>
                      <h2 className={`text-2xl sm:text-4xl text-white font-extrabold tracking-tight uppercase truncate ${syne.className}`}>
                        {team1.name}
                      </h2>
                    </div>
                  </div>

                  {/* Giant Score Node */}
                  <div className="flex items-end justify-between pt-3 border-t border-cyan-500/20">
                    <div className="flex flex-col">
                      <span className={`text-[11px] font-bold tracking-[0.15em] text-cyan-300/70 uppercase ${jetbrainsMono.className}`}>
                        SESSION SERIES
                      </span>
                      <span className={`text-xs sm:text-sm font-semibold text-white/70 mt-0.5 ${jetbrainsMono.className}`}>
                        {team1.tonightMatchesWon} Round Wins Tonight
                      </span>
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className={`text-6xl sm:text-8xl md:text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-100 to-cyan-400 leading-none drop-shadow-[0_0_35px_rgba(6,182,212,0.7)] ${syne.className}`}>
                        {team1.sessionWins}
                      </span>
                    </div>
                  </div>

                  {/* Frag Gauge */}
                  <div className="flex items-center justify-between text-xs text-cyan-300/70 pt-2 border-t border-white/[0.06]">
                    <span className={jetbrainsMono.className}>TOTAL FRAGS</span>
                    <span className={`font-bold text-white ${jetbrainsMono.className}`}>{team1.totalKills} KILLS</span>
                  </div>
                </div>
              </div>

              {/* -------------------------------------------------------- */}
              {/* CENTRAL ORBITAL NEXUS (VS & LIVE BATTLE MATRIX) */}
              {/* -------------------------------------------------------- */}
              <div className="flex flex-col items-center justify-center px-2 sm:px-6 py-2 my-auto">
                {/* Slashing Metallic VS Emblem */}
                <div className="relative flex items-center justify-center">
                  {/* Glowing Hologram Ring */}
                  <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full border border-white/15 bg-white/[0.02] backdrop-blur-md flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                    <span className={`text-3xl sm:text-5xl font-extrabold italic text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-amber-300 drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] ${syne.className}`}>
                      VS
                    </span>
                  </div>
                </div>

                {/* Score Update Status Indicator */}
                <div className="mt-3 flex flex-col items-center gap-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10">
                    <span className="material-symbols-outlined text-xs text-amber-400 animate-spin">
                      radar
                    </span>
                    <span className={`text-[9px] sm:text-[10px] font-bold tracking-[0.15em] text-white/80 uppercase ${jetbrainsMono.className}`}>
                      LIVE TELEMETRY
                    </span>
                  </div>
                </div>

                {/* Frag Balance Bar */}
                <div className="w-44 sm:w-56 mt-4 flex flex-col gap-1.5">
                  <div className={`flex justify-between text-[10px] font-bold ${jetbrainsMono.className}`}>
                    <span className="text-cyan-400">{team1KillPercent}%</span>
                    <span className="text-white/40">KILL RATIO</span>
                    <span className="text-amber-400">{team2KillPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden flex">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-700" 
                      style={{ width: `${team1KillPercent}%` }}
                    />
                    <div 
                      className="h-full bg-gradient-to-l from-amber-400 to-yellow-500 transition-all duration-700" 
                      style={{ width: `${team2KillPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* -------------------------------------------------------- */}
              {/* TEAM 2 TITAN (Solar Gold / Amber Card) */}
              {/* -------------------------------------------------------- */}
              <div className="relative rounded-[2rem] p-1.5 bg-gradient-to-bl from-amber-400/30 via-yellow-600/10 to-transparent ring-1 ring-amber-400/30 shadow-[0_0_50px_rgba(245,158,11,0.15)] group transition-all duration-500 hover:shadow-[0_0_70px_rgba(245,158,11,0.25)]">
                <div className="rounded-[calc(2rem-0.375rem)] bg-gradient-to-bl from-[#181104]/95 via-[#0F0B02]/90 to-[#050401]/95 p-5 sm:p-7 flex flex-col gap-6 relative overflow-hidden backdrop-blur-xl text-right">
                  {/* Subtle Top Inner Edge Highlight */}
                  <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />

                  {/* Team 2 Header */}
                  <div className="flex items-center justify-end gap-4 sm:gap-5">
                    <div className="flex flex-col min-w-0 items-end">
                      <span className={`text-[10px] sm:text-xs font-bold tracking-[0.2em] text-amber-400 uppercase ${jetbrainsMono.className}`}>
                        DEFENDING SQUAD
                      </span>
                      <h2 className={`text-2xl sm:text-4xl text-white font-extrabold tracking-tight uppercase truncate ${syne.className}`}>
                        {team2.name}
                      </h2>
                    </div>

                    {/* Machined Hardware Shield */}
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl p-1 bg-gradient-to-br from-amber-300 via-yellow-500 to-transparent ring-1 ring-amber-300/40 shadow-[0_0_30px_rgba(245,158,11,0.5)] flex-shrink-0 flex items-center justify-center">
                      <div className="w-full h-full rounded-[0.85rem] bg-[#120D02] flex items-center justify-center">
                        <span className={`text-2xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white via-amber-200 to-amber-400 ${syne.className}`}>
                          {team2.initial}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Giant Score Node */}
                  <div className="flex items-end justify-between pt-3 border-t border-amber-500/20 flex-row-reverse">
                    <div className="flex flex-col items-end">
                      <span className={`text-[11px] font-bold tracking-[0.15em] text-amber-300/70 uppercase ${jetbrainsMono.className}`}>
                        SESSION SERIES
                      </span>
                      <span className={`text-xs sm:text-sm font-semibold text-white/70 mt-0.5 ${jetbrainsMono.className}`}>
                        {team2.tonightMatchesWon} Round Wins Tonight
                      </span>
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className={`text-6xl sm:text-8xl md:text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white via-amber-100 to-amber-400 leading-none drop-shadow-[0_0_35px_rgba(245,158,11,0.7)] ${syne.className}`}>
                        {team2.sessionWins}
                      </span>
                    </div>
                  </div>

                  {/* Frag Gauge */}
                  <div className="flex items-center justify-between text-xs text-amber-300/70 pt-2 border-t border-white/[0.06] flex-row-reverse">
                    <span className={jetbrainsMono.className}>TOTAL FRAGS</span>
                    <span className={`font-bold text-white ${jetbrainsMono.className}`}>{team2.totalKills} KILLS</span>
                  </div>
                </div>
              </div>

            </div>

            {/* ========================================================== */}
            {/* 4. TOURNAMENT STATS BENTO (Doppelrand Triple Module) */}
            {/* ========================================================== */}
            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              
              {/* Module 1: Total Rounds */}
              <div className="rounded-2xl p-1 bg-white/[0.06] ring-1 ring-white/10 shadow-lg">
                <div className="rounded-[calc(1rem-0.125rem)] bg-[#070910] p-4 sm:p-5 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className={`text-[10px] sm:text-[11px] font-bold tracking-[0.15em] text-cyan-400 uppercase ${jetbrainsMono.className}`}>
                      TOTAL ROUNDS
                    </span>
                    <span className={`text-3xl sm:text-4xl font-extrabold text-white mt-1 ${syne.className}`}>
                      {totalTournamentMatches}
                    </span>
                    <span className="text-[11px] text-white/50 mt-0.5">Published Tournament Matches</span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                    <span className="material-symbols-outlined text-2xl">sports_esports</span>
                  </div>
                </div>
              </div>

              {/* Module 2: Tonight's Matches */}
              <div className="rounded-2xl p-1 bg-white/[0.06] ring-1 ring-white/10 shadow-lg">
                <div className="rounded-[calc(1rem-0.125rem)] bg-[#070910] p-4 sm:p-5 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className={`text-[10px] sm:text-[11px] font-bold tracking-[0.15em] text-amber-400 uppercase ${jetbrainsMono.className}`}>
                      TONIGHT'S BATTLES
                    </span>
                    <span className={`text-3xl sm:text-4xl font-extrabold text-amber-300 mt-1 ${syne.className}`}>
                      {tonightMatchCount}
                    </span>
                    <span className="text-[11px] text-white/50 mt-0.5">{latestSessionDateStr}</span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                    <span className="material-symbols-outlined text-2xl">calendar_today</span>
                  </div>
                </div>
              </div>

              {/* Module 3: Series Remaining */}
              <div className="rounded-2xl p-1 bg-white/[0.06] ring-1 ring-white/10 shadow-lg">
                <div className="rounded-[calc(1rem-0.125rem)] bg-[#070910] p-4 sm:p-5 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className={`text-[10px] sm:text-[11px] font-bold tracking-[0.15em] text-amber-400 uppercase ${jetbrainsMono.className}`}>
                      SERIES REMAINING
                    </span>
                    <span className={`text-3xl sm:text-4xl font-extrabold text-amber-300 mt-1 ${syne.className}`}>
                      {matchesRemaining}
                    </span>
                    <span className="text-[11px] text-white/50 mt-0.5">Rounds To Championship</span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                    <span className="material-symbols-outlined text-2xl">monitoring</span>
                  </div>
                </div>
              </div>

            </div>

            {/* ========================================================== */}
            {/* 5. CINEMATIC FOOTER SLOGAN */}
            {/* ========================================================== */}
            <footer className="w-full flex flex-col items-center text-center pt-6 border-t border-white/10 space-y-3">
              <span className={`text-xs sm:text-sm font-bold tracking-[0.3em] uppercase text-white/60 ${jetbrainsMono.className}`}>
                ONE GOAL · ONE CHAMPION
              </span>

              <h3 className={`text-2xl sm:text-4xl md:text-5xl font-extrabold uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 tracking-tight drop-shadow-[0_0_25px_rgba(245,158,11,0.5)] ${syne.className}`}>
                THE WAR IS NOT OVER!
              </h3>

              <div className="inline-flex items-center gap-2 sm:gap-4 px-5 py-2 rounded-full bg-white/[0.04] border border-white/10 text-white/70 text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase backdrop-blur-md">
                <span className="text-amber-400">🏆</span>
                <span>STAY FOCUSED</span>
                <span className="text-white/20">|</span>
                <span>STAY UNITED</span>
                <span className="text-white/20">|</span>
                <span>FINISH STRONG</span>
                <span className="text-amber-400">🏆</span>
              </div>
            </footer>

          </div>
        </div>
      </div>
    </div>
  );
}