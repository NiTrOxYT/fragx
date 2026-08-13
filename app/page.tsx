import Link from "next/link";
import { getMVP, getSessionSummary, getRecentMatches } from "@/lib/services/stats";
import GoldenGunAward from "@/components/common/GoldenGunAward";
import EmptyState from "@/components/common/EmptyState";

export const revalidate = 60; // 60-second ISR for fast public page delivery

export default async function HomePage() {
  const [mvpData, summary, recentMatches] = await Promise.all([
    getMVP(),
    getSessionSummary(),
    getRecentMatches(5),
  ]);

  const mainMvp = mvpData?.players[0];

  return (
    <main className="pt-header-safe md:pt-24 px-safe-margin max-w-7xl mx-auto space-y-stack-lg flex flex-col items-center w-full pb-[100px] md:pb-12">

      {/* Hero Section: MVP */}
      {mainMvp ? (
        <section className="w-full max-w-3xl relative rounded-xl overflow-hidden glass-panel elite-glow border border-[#D4AF37]/30 p-1">
          <div className="absolute inset-0 bg-gradient-to-br from-[#171717] to-[#0A0A0A] z-0" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none z-0" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center p-stack-md md:p-stack-lg gap-stack-md">
            {/* Avatar / Badge Area */}
            <div className="relative flex-shrink-0 group">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-2 border-[#D4AF37]/50 overflow-hidden relative shadow-[0_0_30px_rgba(212,175,55,0.2)]">
                <img
                  src={mainMvp.avatarUrl}
                  alt={mainMvp.name}
                  className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-surface-container border border-[#D4AF37] rounded-full p-3 shadow-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                <span
                  className="material-symbols-outlined text-[#D4AF37] text-3xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  workspace_premium
                </span>
              </div>
            </div>

            {/* MVP Details */}
            <div className="flex-1 text-center md:text-left space-y-stack-sm">
              <div className="inline-block px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] font-label-caps text-label-caps mb-2 shadow-[0_0_10px_rgba(212,175,55,0.1)]">
                {mvpData.players.length > 1 ? "CO-MVP OF THE SESSION" : "LAST NIGHT'S MVP"}
              </div>
              <h2 className="font-headline text-headline-lg-mobile md:text-headline-lg text-on-surface uppercase tracking-tight">
                {mvpData.players.map((p) => p.name).join(" & ")}
              </h2>
              
              <GoldenGunAward
                peakKills={mvpData.peakKills}
                winnerName={mvpData.goldenGunWinner?.name}
              />
              
              <p className="font-body text-body-md text-on-surface-variant max-w-md">
                Top fragger from last night's session. Unstoppable momentum.
              </p>
            </div>

            {/* Highlight Stat */}
            <div className="flex flex-col items-center md:items-end md:ml-auto">
              <span className="font-display-stat text-display-stat text-primary drop-shadow-[0_0_15px_rgba(255,181,158,0.3)]">
                {mvpData.peakKills}
              </span>
              <span className="font-label-caps text-label-caps text-on-surface-variant tracking-widest mt-1">
                PEAK KILLS
              </span>
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

      {/* Session Summary Grid */}
      <section className="w-full max-w-3xl space-y-stack-md">
        <h3 className="font-label-caps text-label-caps text-on-surface-variant tracking-widest pl-2 border-l-2 border-primary/50">
          SESSION SUMMARY
        </h3>
        <div className="grid grid-cols-3 gap-3 md:gap-6">
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

          {/* Stat Card 3 */}
          <div className="glass-panel p-stack-md rounded-lg flex flex-col items-center justify-center hover:border-primary/50 transition-colors duration-300">
            <span className="material-symbols-outlined text-primary/70 mb-2 text-2xl">
              monitoring
            </span>
            <span className="font-headline text-headline-md text-on-surface">
              {summary.winRate}%
            </span>
            <span className="font-label-caps text-label-caps text-on-surface-variant mt-1">
              WIN RATE
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
              const totalKills = isMultiTeam
                ? match.matchTeams.reduce(
                    (acc: number, mt: any) =>
                      acc + mt.players.reduce((pAcc: number, p: any) => pAcc + p.kills, 0),
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
                          {totalKills} KILLS
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
