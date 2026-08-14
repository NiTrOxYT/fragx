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

  return (
    <section className="w-full max-w-3xl relative rounded-2xl overflow-hidden glass-panel border border-surface-container-high p-1 shadow-2xl">
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0F141C] via-[#121110] to-[#0A0A0A] z-0" />
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-600/10 blur-[110px] rounded-full -translate-x-1/3 -translate-y-1/3 pointer-events-none z-0" />
      <div className="absolute top-0 right-0 w-72 h-72 bg-[#D4AF37]/10 blur-[110px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none z-0" />

      {/* Main Container */}
      <div className="relative z-10 p-4 sm:p-6 md:p-8 flex flex-col gap-5 sm:gap-6">
        {/* Top Header Badge */}
        <div className="flex flex-col items-center text-center space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] font-label-caps text-[10px] sm:text-xs tracking-widest uppercase shadow-[0_0_12px_rgba(212,175,55,0.15)]">
            <span>🏆 BGMI SQUAD TOURNAMENT</span>
          </div>

          <h2 className="font-headline text-2xl sm:text-4xl md:text-5xl text-on-surface uppercase tracking-tight font-black drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
            EPIC BATTLE
          </h2>

          <div className="flex items-center gap-2 text-on-surface-variant font-label-caps text-[10px] sm:text-xs tracking-widest uppercase">
            <span className="text-primary font-bold">»»»</span>
            <span>EVERY ROUND MATTERS</span>
            <span className="text-primary font-bold">«««</span>
          </div>
        </div>

        {/* Team VS Banner Header */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
          {/* Team 1 (Blue Side) */}
          <div className="flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-blue-950/40 to-blue-900/10 border border-blue-500/40 rounded-xl p-2.5 sm:p-4 shadow-[0_0_20px_rgba(37,99,235,0.15)] min-w-0">
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg bg-gradient-to-br from-blue-600 to-blue-950 border-2 border-blue-400 flex items-center justify-center font-display-stat text-xl sm:text-3xl text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] flex-shrink-0">
              {team1.initial}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label-caps text-[9px] sm:text-[11px] text-blue-400 font-bold uppercase tracking-wider">
                TEAM 1
              </span>
              <h3 className="font-headline text-sm sm:text-xl text-on-surface uppercase truncate font-bold">
                {team1.name}
              </h3>
            </div>
          </div>

          {/* VS Center Emblem */}
          <div className="relative flex flex-col items-center justify-center px-1">
            <span className="font-headline text-xl sm:text-3xl md:text-4xl text-primary font-black italic tracking-tighter drop-shadow-[0_0_10px_rgba(255,77,0,0.6)]">
              VS
            </span>
          </div>

          {/* Team 2 (Gold Side) */}
          <div className="flex items-center justify-end gap-2 sm:gap-3 bg-gradient-to-l from-[#201C10]/60 to-[#171717] border border-[#D4AF37]/40 rounded-xl p-2.5 sm:p-4 shadow-[0_0_20px_rgba(212,175,55,0.15)] min-w-0 text-right">
            <div className="flex flex-col min-w-0 items-end">
              <span className="font-label-caps text-[9px] sm:text-[11px] text-gold font-bold uppercase tracking-wider">
                TEAM 2
              </span>
              <h3 className="font-headline text-sm sm:text-xl text-on-surface uppercase truncate font-bold">
                {team2.name}
              </h3>
            </div>
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#785E10] border-2 border-gold flex items-center justify-center font-display-stat text-xl sm:text-3xl text-black shadow-[0_0_15px_rgba(212,175,55,0.5)] flex-shrink-0">
              {team2.initial}
            </div>
          </div>
        </div>

        {/* Big Score Cards (Series / Session Score) */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-4">
          {/* Team 1 Score Box */}
          <div
            className={`rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center border-2 transition-all relative overflow-hidden ${
              isTeam1Leading
                ? "bg-blue-950/50 border-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.3)]"
                : "bg-surface-container/60 border-blue-500/30"
            }`}
          >
            <span className="font-display-stat text-4xl sm:text-6xl md:text-7xl text-blue-400 font-black drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
              {team1.sessionWins}
            </span>
            <span className="font-label-caps text-[10px] sm:text-xs text-blue-300 font-bold uppercase tracking-widest mt-1">
              SESSION WINS
            </span>
            <div className="text-[11px] text-on-surface-variant font-mono mt-0.5">
              ({team1.tonightMatchesWon} Wins Tonight)
            </div>
          </div>

          {/* Center Indicator */}
          <div className="flex flex-col items-center justify-center p-2 text-center">
            <div className="w-10 h-10 rounded-full bg-surface-container border border-surface-container-high flex items-center justify-center text-primary mb-1 shadow-inner">
              <span className="material-symbols-outlined text-xl">target</span>
            </div>
            <span className="font-label-caps text-[9px] sm:text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">
              SCORE
            </span>
            <span className="font-label-caps text-[9px] sm:text-[10px] text-primary uppercase font-bold tracking-widest">
              UPDATE
            </span>
          </div>

          {/* Team 2 Score Box */}
          <div
            className={`rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center border-2 transition-all relative overflow-hidden ${
              isTeam2Leading
                ? "bg-[#201C10]/80 border-gold shadow-[0_0_25px_rgba(212,175,55,0.3)]"
                : "bg-surface-container/60 border-[#D4AF37]/30"
            }`}
          >
            <span className="font-display-stat text-4xl sm:text-6xl md:text-7xl text-gold font-black drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]">
              {team2.sessionWins}
            </span>
            <span className="font-label-caps text-[10px] sm:text-xs text-gold font-bold uppercase tracking-widest mt-1">
              SESSION WINS
            </span>
            <div className="text-[11px] text-on-surface-variant font-mono mt-0.5">
              ({team2.tonightMatchesWon} Wins Tonight)
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {/* Total Rounds */}
          <div className="glass-panel rounded-xl p-3 sm:p-4 border border-blue-500/30 flex flex-col items-center text-center bg-blue-950/20">
            <span className="material-symbols-outlined text-blue-400 text-xl sm:text-2xl mb-1">
              military_tech
            </span>
            <span className="font-display-stat text-xl sm:text-3xl text-on-surface font-bold">
              {totalTournamentMatches}
            </span>
            <span className="font-label-caps text-[9px] sm:text-[11px] text-blue-300 font-bold uppercase tracking-wider mt-0.5">
              TOTAL MATCHES
            </span>
            <span className="font-label-caps text-[8px] sm:text-[9px] text-on-surface-variant uppercase">
              TOURNAMENT
            </span>
          </div>

          {/* Tonight Matches */}
          <div className="glass-panel rounded-xl p-3 sm:p-4 border border-primary/30 flex flex-col items-center text-center bg-primary/5">
            <span className="material-symbols-outlined text-primary text-xl sm:text-2xl mb-1">
              calendar_today
            </span>
            <span className="font-display-stat text-xl sm:text-3xl text-primary font-bold">
              {tonightMatchCount}
            </span>
            <span className="font-label-caps text-[9px] sm:text-[11px] text-primary/90 font-bold uppercase tracking-wider mt-0.5">
              TONIGHT MATCHES
            </span>
            <span className="font-label-caps text-[8px] sm:text-[9px] text-on-surface-variant uppercase">
              {latestSessionDateStr}
            </span>
          </div>

          {/* Sessions Played */}
          <div className="glass-panel rounded-xl p-3 sm:p-4 border border-[#D4AF37]/30 flex flex-col items-center text-center bg-[#201C10]/30">
            <span className="material-symbols-outlined text-gold text-xl sm:text-2xl mb-1">
              bar_chart
            </span>
            <span className="font-display-stat text-xl sm:text-3xl text-gold font-bold">
              {totalSessionsPlayed}
            </span>
            <span className="font-label-caps text-[9px] sm:text-[11px] text-gold font-bold uppercase tracking-wider mt-0.5">
              SESSIONS PLAYED
            </span>
            <span className="font-label-caps text-[8px] sm:text-[9px] text-on-surface-variant uppercase">
              PUBLISHED
            </span>
          </div>
        </div>

        {/* Motivational Motto Banner */}
        <div className="flex flex-col items-center text-center pt-2 border-t border-surface-container-high/60 space-y-1">
          <h4 className="font-headline text-xs sm:text-base md:text-lg text-on-surface uppercase tracking-widest font-black">
            ONE GOAL. ONE CHAMPION. THE WAR IS NOT OVER!
          </h4>

          <div className="flex items-center gap-2 sm:gap-4 text-gold font-label-caps text-[10px] sm:text-xs font-bold tracking-widest uppercase">
            <span className="material-symbols-outlined text-sm">emoji_events</span>
            <span>STAY FOCUSED</span>
            <span>|</span>
            <span>STAY UNITED</span>
            <span>|</span>
            <span>FINISH STRONG</span>
            <span className="material-symbols-outlined text-sm">emoji_events</span>
          </div>
        </div>
      </div>
    </section>
  );
}
