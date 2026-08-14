import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FRAGX — World Cup Rules",
  description:
    "Official FRAGX World Cup tournament rules, match format, Golden Gun award rules, tie-breakers and competitive regulations.",
};

export default function RulesPage() {
  return (
    <main className="min-h-screen bg-background text-on-background pt-header-safe md:pt-24 pb-24 md:pb-16 px-safe-margin">
      <div className="max-w-5xl mx-auto flex flex-col gap-8 md:gap-12">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-b from-[#18120c] via-[#0f0d0a] to-[#0a0a0a] p-6 sm:p-10 md:p-14 text-center shadow-[0_0_50px_rgba(255,77,0,0.08)]">
          {/* Ambient Lighting Accents */}
          <div
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/15 blur-[120px] rounded-full pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute top-1/2 right-0 w-72 h-72 bg-[#D4AF37]/10 blur-[100px] rounded-full pointer-events-none"
            aria-hidden="true"
          />

          {/* Decorative Corner Accents */}
          <div
            className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary/60 rounded-tl-sm pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary/60 rounded-tr-sm pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary/60 rounded-bl-sm pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary/60 rounded-br-sm pointer-events-none"
            aria-hidden="true"
          />

          {/* Header Content */}
          <div className="relative z-10 space-y-3 sm:space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary font-label-caps text-xs sm:text-sm font-bold tracking-[0.25em] uppercase">
              <span>🏆 WORLD CUP</span>
            </div>

            <h1 className="font-headline text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white uppercase drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
              RULES
            </h1>

            <p className="font-label-caps text-xs sm:text-sm md:text-base tracking-[0.3em] text-[#D4AF37] font-semibold uppercase">
              OFFICIAL TOURNAMENT RULEBOOK
            </p>

            <div className="pt-2">
              <span className="inline-block font-headline text-lg sm:text-xl text-on-surface-variant/90 tracking-wide font-medium">
                World Cup Rules : -
              </span>
            </div>
          </div>
        </section>

        {/* RULEBOOK CARDS GRID */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* RULE 01 */}
          <div className="relative glass-panel rounded-2xl p-6 sm:p-7 border border-surface-container-high hover:border-primary/40 transition-all duration-300 flex flex-col justify-between group overflow-hidden bg-[#0d0d0d]">
            <div className="flex items-start justify-between gap-4 mb-4">
              <span className="font-mono text-3xl sm:text-4xl font-extrabold text-primary/80 group-hover:text-primary transition-colors tracking-tighter">
                01
              </span>
              <span className="px-2.5 py-1 rounded-md bg-primary/10 border border-primary/30 text-primary font-label-caps text-[10px] font-bold uppercase tracking-wider">
                SERIES STRUCTURE
              </span>
            </div>

            <div className="space-y-3">
              <p className="font-body text-base sm:text-lg text-white font-medium leading-relaxed">
                1. The World Cup will consist of a total of 21 rounds. 🏆
              </p>
              <p className="font-body text-base sm:text-lg text-white font-medium leading-relaxed">
                The team that wins the most rounds will be crowned the World Cup Champion. 🏆🔥
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-surface-container-high/60 flex items-center justify-between text-on-surface-variant font-label-caps text-xs">
              <span className="text-primary font-bold">21 TOTAL ROUNDS</span>
              <span className="text-base">🏆</span>
            </div>
          </div>

          {/* RULE 02 */}
          <div className="relative glass-panel rounded-2xl p-6 sm:p-7 border border-surface-container-high hover:border-primary/40 transition-all duration-300 flex flex-col justify-between group overflow-hidden bg-[#0d0d0d]">
            <div className="flex items-start justify-between gap-4 mb-4">
              <span className="font-mono text-3xl sm:text-4xl font-extrabold text-primary/80 group-hover:text-primary transition-colors tracking-tighter">
                02
              </span>
              <span className="px-2.5 py-1 rounded-md bg-primary/10 border border-primary/30 text-primary font-label-caps text-[10px] font-bold uppercase tracking-wider">
                ROUND FORMAT
              </span>
            </div>

            <div className="space-y-3">
              <p className="font-body text-base sm:text-lg text-white font-medium leading-relaxed">
                2. Each round will consist of 10 matches. The team that wins the most matches in that round will win the round. 🏆🔥
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-surface-container-high/60 flex items-center justify-between text-on-surface-variant font-label-caps text-xs">
              <span className="text-primary font-bold">10 MATCHES / ROUND</span>
              <span className="text-base">🔥</span>
            </div>
          </div>

          {/* RULE 03 */}
          <div className="relative glass-panel rounded-2xl p-6 sm:p-7 border border-surface-container-high hover:border-primary/40 transition-all duration-300 flex flex-col justify-between group overflow-hidden bg-[#0d0d0d]">
            <div className="flex items-start justify-between gap-4 mb-4">
              <span className="font-mono text-3xl sm:text-4xl font-extrabold text-amber-400/80 group-hover:text-amber-400 transition-colors tracking-tighter">
                03
              </span>
              <span className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 font-label-caps text-[10px] font-bold uppercase tracking-wider">
                TIE-BREAKER PROTOCOL
              </span>
            </div>

            <div className="space-y-3">
              <p className="font-body text-base sm:text-lg text-white font-medium leading-relaxed">
                3. If the daily round ends in a tie, there will be 3 final deciding matches. The team that wins 2 out of those 3 matches will be declared the winner. 🏆🔥
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-surface-container-high/60 flex items-center justify-between text-on-surface-variant font-label-caps text-xs">
              <span className="text-amber-400 font-bold">BEST OF 3 DECIDER</span>
              <span className="text-base">⚔️</span>
            </div>
          </div>

          {/* RULE 04 */}
          <div className="relative glass-panel rounded-2xl p-6 sm:p-7 border border-red-500/30 hover:border-red-500/50 transition-all duration-300 flex flex-col justify-between group overflow-hidden bg-[#0e0a0a]">
            <div className="flex items-start justify-between gap-4 mb-4">
              <span className="font-mono text-3xl sm:text-4xl font-extrabold text-red-400/90 group-hover:text-red-400 transition-colors tracking-tighter">
                04
              </span>
              <span className="px-2.5 py-1 rounded-md bg-red-500/15 border border-red-500/40 text-red-400 font-label-caps text-[10px] font-bold uppercase tracking-wider">
                PROHIBITED WEAPON
              </span>
            </div>

            <div className="space-y-3">
              <p className="font-body text-base sm:text-lg text-white font-medium leading-relaxed">
                4. The DBS gun is strictly prohibited and cannot be used under any circumstances. If a player uses the DBS gun, the points for that match will automatically be awarded to the opposing team. 🚫🎯🏆
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-red-500/20 flex items-center justify-between text-red-400 font-label-caps text-xs font-bold">
              <span>ZERO TOLERANCE: FORFEIT MATCH POINTS</span>
              <span className="text-base">🚫</span>
            </div>
          </div>

          {/* RULE 05 */}
          <div className="relative glass-panel rounded-2xl p-6 sm:p-7 border border-surface-container-high hover:border-primary/40 transition-all duration-300 flex flex-col justify-between group overflow-hidden bg-[#0d0d0d]">
            <div className="flex items-start justify-between gap-4 mb-4">
              <span className="font-mono text-3xl sm:text-4xl font-extrabold text-primary/80 group-hover:text-primary transition-colors tracking-tighter">
                05
              </span>
              <span className="px-2.5 py-1 rounded-md bg-primary/10 border border-primary/30 text-primary font-label-caps text-[10px] font-bold uppercase tracking-wider">
                TECHNICAL GLITCH
              </span>
            </div>

            <div className="space-y-3">
              <p className="font-body text-base sm:text-lg text-white font-medium leading-relaxed">
                5. If a team's game experiences a glitch, that team must exit immediately during the first match. If they fail to do so and exit from a later match, the opponent will be declared the winner of that match. 🏆
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-surface-container-high/60 flex items-center justify-between text-on-surface-variant font-label-caps text-xs">
              <span className="text-primary font-bold">MATCH 1 IMMEDIATE EXIT ONLY</span>
              <span className="text-base">⚠️</span>
            </div>
          </div>

          {/* RULE 06 - SPECIAL GOLDEN GUN & BALLON D'OR HIGHLIGHT */}
          <div className="relative md:col-span-2 glass-panel rounded-3xl p-7 sm:p-9 border-2 border-[#D4AF37]/60 bg-gradient-to-br from-[#1b170c] via-[#120f08] to-[#0d0d0d] shadow-[0_0_40px_rgba(212,175,55,0.15)] hover:border-[#D4AF37]/90 transition-all duration-300 overflow-hidden">
            {/* Ambient Gold Glow */}
            <div
              className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/15 blur-[90px] rounded-full pointer-events-none"
              aria-hidden="true"
            />
            <div
              className="absolute bottom-0 left-0 w-60 h-60 bg-primary/10 blur-[80px] rounded-full pointer-events-none"
              aria-hidden="true"
            />

            {/* Corner Gold Brackets */}
            <div
              className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#D4AF37] rounded-tl-sm pointer-events-none"
              aria-hidden="true"
            />
            <div
              className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#D4AF37] rounded-tr-sm pointer-events-none"
              aria-hidden="true"
            />
            <div
              className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#D4AF37] rounded-bl-sm pointer-events-none"
              aria-hidden="true"
            />
            <div
              className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#D4AF37] rounded-br-sm pointer-events-none"
              aria-hidden="true"
            />

            <div className="relative z-10">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-4xl sm:text-5xl font-extrabold text-[#F5D76E] tracking-tighter drop-shadow-[0_0_12px_rgba(212,175,55,0.4)]">
                    06
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl sm:text-3xl">🏆</span>
                    <span className="text-2xl sm:text-3xl">⚽</span>
                  </div>
                </div>

                <span className="px-3.5 py-1.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#F5D76E] font-label-caps text-xs sm:text-sm font-bold uppercase tracking-[0.2em] shadow-sm">
                  🏆 BALLON D’OR AWARD
                </span>
              </div>

              <div className="space-y-4 max-w-3xl">
                <p className="font-body text-lg sm:text-xl md:text-2xl text-white font-bold leading-relaxed">
                  6. The player who wins the most Golden Gun awards will be crowned the Ballon d’Or winner. 🏆⚽
                </p>

                <p className="font-body text-base sm:text-lg md:text-xl text-[#F5D76E] font-semibold leading-relaxed pl-4 border-l-2 border-[#D4AF37]/60">
                  If two or more players have the same number of Golden Gun awards, the player with the most total kills with the Golden Gun will be declared the Ballon d’Or winner.
                </p>
              </div>

              <div className="mt-8 pt-5 border-t border-[#D4AF37]/30 flex flex-wrap items-center justify-between gap-4 text-xs font-label-caps text-[#F5D76E]/90 font-bold uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">military_tech</span>
                  <span>HIGHEST GOLDEN GUN AWARDS → BALLON D’OR CHAMPION</span>
                </div>
                <div className="flex items-center gap-2 text-on-surface-variant font-mono">
                  <span>TIE-BREAKER: TOTAL GOLDEN GUN KILLS</span>
                </div>
              </div>
            </div>
          </div>

          {/* RULE 07 */}
          <div className="relative md:col-span-2 glass-panel rounded-2xl p-6 sm:p-8 border border-surface-container-high hover:border-primary/40 transition-all duration-300 flex flex-col justify-between group overflow-hidden bg-[#0d0d0d]">
            <div className="flex items-start justify-between gap-4 mb-4">
              <span className="font-mono text-3xl sm:text-4xl font-extrabold text-primary/80 group-hover:text-primary transition-colors tracking-tighter">
                07
              </span>
              <span className="px-2.5 py-1 rounded-md bg-primary/10 border border-primary/30 text-primary font-label-caps text-[10px] font-bold uppercase tracking-wider">
                LOBBY & DISCIPLINE
              </span>
            </div>

            <div className="space-y-3">
              <p className="font-body text-base sm:text-lg text-white font-medium leading-relaxed">
                7. The team that loses a round must join the call or BGMI lobby for the next round. Failure to do so will be considered a violation of the tournament rules and may result in disciplinary action.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-surface-container-high/60 flex items-center justify-between text-on-surface-variant font-label-caps text-xs">
              <span className="text-primary font-bold">MANDATORY LOBBY PRESENCE</span>
              <span className="text-base">📢</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
