import Link from "next/link";
import {
  getLatestPublishedSession,
  getMVP,
  getGoldenGunAward,
  getSessionSummary,
  getRecentMatches,
} from "@/lib/services/stats";
import { formatSessionDate } from "@/lib/utils/dates";
import GoldenGunAward from "@/components/common/GoldenGunAward";
import EmptyState from "@/components/common/EmptyState";

export const revalidate = 60; // 60-second ISR for fast public page delivery

export default async function HomePage() {
  const latestSession = await getLatestPublishedSession();

  if (!latestSession) {
    return (
      <main className="pt-header-safe md:pt-24 px-safe-margin max-w-7xl mx-auto space-y-stack-lg flex flex-col items-center w-full pb-[100px] md:pb-12">
        <div className="w-full max-w-3xl">
          <EmptyState
            icon="emoji_events"
            title="Tonight's Battlefield Awaits"
            description="No published gaming sessions yet. Admin needs to log and publish tonight's BGMI match results."
          />
        </div>
      </main>
    );
  }

  const [mvpData, goldenGunData, summary, recentMatches] = await Promise.all([
    getMVP(latestSession.id),
    getGoldenGunAward(latestSession.id),
    getSessionSummary(latestSession.id),
    getRecentMatches(latestSession.id, 5),
  ]);

  const mainMvp = mvpData?.players[0];
  const sessionDateStr = formatSessionDate(latestSession.date);

  return (
    <main className="pt-header-safe md:pt-24 px-safe-margin max-w-7xl mx-auto space-y-6 md:space-y-8 flex flex-col items-center w-full pb-[100px] md:pb-12">
      {/* Hero Section: Championship MVP */}
      {mainMvp ? (
        <section className="w-full max-w-3xl relative rounded-2xl overflow-hidden bg-gradient-to-b from-[#14120D] via-[#0C0B08] to-[#080808] border border-[#D4AF37]/50 shadow-[0_0_50px_rgba(212,175,55,0.15)] p-5 md:p-8 transition-all duration-300 hover:border-[#D4AF37]/75 hover:shadow-[0_0_60px_rgba(212,175,55,0.25)]">
          {/* Volumetric Neon Ambient Glows */}
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-[#D4AF37]/20 blur-[110px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-[#FF4D00]/15 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#D4AF37]/10 via-transparent to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_20%,rgba(212,175,55,0.04)_45%,rgba(255,77,0,0.04)_50%,transparent_55%)] pointer-events-none" />

          {/* Tactical Cybernetic Corner Accents */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#D4AF37] rounded-tl-sm pointer-events-none" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#D4AF37] rounded-tr-sm pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#D4AF37] rounded-bl-sm pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#D4AF37] rounded-br-sm pointer-events-none" />

          {/* Header Badge */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-[#D4AF37]/20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/35 shadow-[0_0_15px_rgba(212,175,55,0.15)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F5D76E] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D4AF37]" />
              </span>
              <span className="font-label-caps text-xs font-bold tracking-[0.2em] text-[#F5D76E] uppercase">
                {mvpData.players.length > 1 ? "CO-MVP OF THE SESSION" : "👑 TOURNAMENT MVP"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-label-caps text-[11px] tracking-widest text-[#D4AF37]/80 font-mono uppercase bg-black/40 px-2.5 py-1 rounded border border-[#D4AF37]/20">
                {sessionDateStr}
              </span>
            </div>
          </div>

          {/* Main Hero Card Body */}
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-8">
            {/* 3D Championship Avatar Pedestal */}
            <div className="relative shrink-0 group">
              <div className="relative flex items-center justify-center p-1 rounded-full bg-gradient-to-tr from-[#D4AF37] via-[#FFF3B0] to-[#996515] shadow-[0_0_35px_rgba(212,175,55,0.35)] group-hover:shadow-[0_0_45px_rgba(212,175,55,0.5)] transition-all duration-300">
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden bg-[#0A0A0A] relative border-2 border-black">
                  <img
                    src={mainMvp.avatarUrl}
                    alt={mainMvp.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>

              {/* Floating Crown Badge */}
              <div className="absolute -bottom-2 -right-2 bg-[#120F08] border-2 border-[#D4AF37] rounded-full p-2 shadow-[0_0_20px_rgba(212,175,55,0.5)] flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                <span
                  className="material-symbols-outlined text-[#F5D76E] text-2xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  military_tech
                </span>
              </div>
            </div>

            {/* MVP Player Info & Summary */}
            <div className="flex-1 text-center md:text-left space-y-2">
              <span className="font-label-caps text-xs text-[#D4AF37]/80 tracking-widest uppercase font-mono">
                TOP COMBAT PERFORMANCE
              </span>
              <h2 className="font-headline text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight bg-gradient-to-r from-white via-[#FCE99B] to-[#D4AF37] bg-clip-text text-transparent drop-shadow-[0_4px_16px_rgba(212,175,55,0.25)]">
                {mvpData.players.map((p) => p.name).join(" & ")}
              </h2>
              <p className="font-body text-sm text-[#E5E2E1]/80 max-w-md">
                Crowned MVP for outstanding frag count and round dominance in the latest competitive session.
              </p>
            </div>

            {/* HUD Stat Showcase (Peak & Total Kills) */}
            <div className="flex md:flex-col items-center md:items-end justify-center gap-3 shrink-0 border-t md:border-t-0 md:border-l border-[#D4AF37]/25 pt-4 md:pt-0 md:pl-6 w-full md:w-auto">
              <div className="flex flex-col items-center md:items-end bg-black/40 px-4 py-2 rounded-xl border border-[#D4AF37]/20 shadow-inner">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-stat-value text-3xl sm:text-4xl font-extrabold text-[#F5D76E] font-mono drop-shadow-[0_0_12px_rgba(245,215,110,0.4)]">
                    {mvpData.peakKills}
                  </span>
                  <span className="font-label-caps text-xs text-[#F5D76E] font-bold">
                    FRAGS
                  </span>
                </div>
                <span className="font-label-caps text-[10px] text-[#D4AF37]/80 tracking-widest uppercase mt-0.5">
                  PEAK SINGLE MATCH
                </span>
              </div>

              {mainMvp.totalKills > 0 && (
                <div className="flex flex-col items-center md:items-end bg-black/40 px-4 py-2 rounded-xl border border-[#D4AF37]/20 shadow-inner">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-stat-value text-2xl sm:text-3xl font-extrabold text-white font-mono">
                      {mainMvp.totalKills}
                    </span>
                    <span className="font-label-caps text-xs text-[#E5E2E1]/70 font-bold">
                      KILLS
                    </span>
                  </div>
                  <span className="font-label-caps text-[10px] text-on-surface-variant tracking-widest uppercase mt-0.5">
                    SESSION TOTAL
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>
      ) : (
        <div className="w-full max-w-3xl">
          <EmptyState
            icon="emoji_events"
            title="Tonight's Battlefield Awaits"
            description="No published gaming sessions yet. Admin needs to log and publish tonight's BGMI match results."
          />
        </div>
      )}

      {/* Standalone Golden Gun Award Banner */}
      <section className="w-full max-w-3xl">
        <GoldenGunAward
          totalKills={goldenGunData?.totalKills || 0}
          winners={goldenGunData?.winners || []}
        />
      </section>


      {/* Session Summary Grid */}
      <section className="w-full max-w-3xl space-y-stack-md">
        <h3 className="font-label-caps text-label-caps text-on-surface-variant tracking-widest pl-2 border-l-2 border-primary/50">
          SESSION SUMMARY
        </h3>
        <div className="grid grid-cols-2 gap-3 md:gap-6">
          {/* Stat Card 1 */}
          <div className="glass-panel p-stack-md rounded-lg flex flex-col items-center justify-center hover:border-primary/50 transition-colors duration-300">
            <span
              className="material-symbols-outlined text-primary/70 mb-2 text-2xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              sports_esports
            </span>
            <span className="font-headline text-headline-md text-on-surface">
              {summary.matchCount}
            </span>
            <span className="font-label-caps text-label-caps text-on-surface-variant mt-1">
              MATCHES
            </span>
          </div>

          {/* Stat Card 2 */}
          <div className="glass-panel p-stack-md rounded-lg flex flex-col items-center justify-center hover:border-primary/50 transition-colors duration-300 bg-primary/5 border-primary/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none" />
            <span
              className="material-symbols-outlined text-primary mb-2 text-2xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              local_fire_department
            </span>
            <span className="font-headline text-headline-md text-primary">
              {summary.totalKills}
            </span>
            <span className="font-label-caps text-label-caps text-primary/80 mt-1">
              TOTAL KILLS
            </span>
          </div>
        </div>

      </section>

      {/* Recent Matches List */}
      <section className="w-full max-w-3xl space-y-stack-md pb-8">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-label-caps text-label-caps text-on-surface-variant tracking-widest border-l-2 border-primary/50 pl-2">
            RECENT MATCHES
          </h3>
          <Link
            href="/matches"
            className="font-label-caps text-label-caps text-primary hover:text-primary-container transition-colors uppercase"
          >
            View All
          </Link>
        </div>

        {recentMatches.length > 0 ? (
          <div className="space-y-3">
            {recentMatches.map((match: any) => {
              const isMultiTeam = match.matchTeams && match.matchTeams.length > 0;
              const topTeam = isMultiTeam ? match.matchTeams[0] : null;
              const winnerKills = isMultiTeam
                ? (topTeam?.players || []).reduce(
                    (pAcc: number, p: any) => pAcc + (p.kills || 0),
                    0
                  )
                : match.kills || 0;
              const placement = isMultiTeam ? topTeam?.placement || 1 : match.placement || 1;
              const displayName = isMultiTeam ? topTeam?.team.name || "Squad" : match.player?.name || "Player";

              return (
                <Link
                  key={match.id}
                  href={`/matches/${match.id}`}
                  className="glass-panel p-3 rounded-lg flex items-center gap-4 hover:bg-surface-container transition-colors group cursor-pointer border-l-4 border-l-primary/80 block"
                >
                  <div className="flex items-center gap-4 w-full">
                    <div className="w-16 h-12 rounded bg-surface-container-low overflow-hidden relative border border-outline-variant/30 flex-shrink-0">
                      <img
                        src={match.screenshotUrl}
                        alt={`Match ${match.matchNumber}`}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                      />

                      <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded" />
                    </div>

                    <div className="flex-1 flex flex-col">
                      <span className="font-stat-value text-stat-value text-on-surface group-hover:text-primary transition-colors">
                        Match {match.matchNumber < 10 ? `0${match.matchNumber}` : match.matchNumber}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-label-caps text-[10px] text-on-surface-variant">
                          {displayName}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-outline-variant" />
                        <span className="font-label-caps text-[10px] text-primary/80">
                          {winnerKills} KILLS
                        </span>
                      </div>
                    </div>


                    <div className="flex-shrink-0 px-3 py-1 rounded bg-surface-container-low border border-outline-variant/50 flex flex-col items-center justify-center">
                      <span className="font-label-caps text-[10px] text-on-surface-variant">
                        RANK
                      </span>
                      <span
                        className={`font-stat-value text-stat-value ${
                          placement === 1 ? "text-gold" : "text-on-surface"
                        }`}
                      >
                        #{placement}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <EmptyState title="No Recent Matches" description="Matches logged by admin will appear here." />
        )}
      </section>
    </main>
  );
}
