import { getPlayerById } from "@/lib/services/players";
import { notFound } from "next/navigation";
import PerformanceChart from "@/components/players/PerformanceChart";
import Link from "next/link";

export const revalidate = 60;

interface PlayerProfilePageProps {
  params: {
    id: string;
  };
}

export default async function PlayerProfilePage({ params }: PlayerProfilePageProps) {
  const player = await getPlayerById(params.id);

  if (!player) {
    notFound();
  }

  return (
    <main className="max-w-md mx-auto px-safe-margin pt-20 pb-24 flex flex-col gap-stack-lg w-full">
      {/* Profile Header */}
      <section className="flex flex-col items-center pt-stack-sm text-center">
        <div className="relative mb-stack-sm">
          <img
            src={player.avatarUrl}
            alt={player.name}
            className="w-24 h-24 rounded-full object-cover border-2 border-primary shadow-[0_0_15px_rgba(255,181,158,0.3)]"
          />
          <div className="absolute -bottom-2 -right-2 bg-secondary-container text-on-secondary-container px-2 py-1 rounded-full font-label-caps text-[10px] flex items-center gap-1">
            <span
              className="material-symbols-outlined text-[12px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              star
            </span>{" "}
            ELITE
          </div>
        </div>
        <h2 className="font-headline text-headline-lg-mobile text-on-background uppercase tracking-tight">
          {player.name}
        </h2>
        <p className="font-body text-body-md text-on-surface-variant flex items-center gap-1 mt-1 justify-center">
          <span className="material-symbols-outlined text-sm text-emerald-400">wifi</span> Online
        </p>
      </section>

      {/* Stats Bento Grid */}
      <section className="grid grid-cols-2 gap-gutter">
        {/* Matches */}
        <div className="glass-panel rounded-xl p-stack-md flex flex-col justify-between">
          <span className="font-label-caps text-label-caps text-on-surface-variant mb-2">MATCHES</span>
          <span className="font-display-stat text-display-stat text-on-background">{player.stats.matches}</span>
        </div>

        {/* Wins */}
        <div className="glass-panel rounded-xl p-stack-md flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-20">
            <span
              className="material-symbols-outlined text-4xl text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              emoji_events
            </span>
          </div>
          <span className="font-label-caps text-label-caps text-on-surface-variant mb-2 relative z-10">WINS</span>
          <span className="font-display-stat text-display-stat text-primary relative z-10 glow-effect">{player.stats.wins}</span>
        </div>

        {/* Kills */}
        <div className="glass-panel rounded-xl p-stack-md flex flex-col justify-between">
          <span className="font-label-caps text-label-caps text-on-surface-variant mb-2">KILLS</span>
          <span className="font-display-stat text-display-stat text-on-background">{player.stats.kills}</span>
        </div>

        {/* Avg Kills */}
        <div className="glass-panel rounded-xl p-stack-md flex flex-col justify-between">
          <span className="font-label-caps text-label-caps text-on-surface-variant mb-2">AVG KILLS</span>
          <span className="font-display-stat text-display-stat text-on-background">{player.stats.avgKills}</span>
        </div>
      </section>

      {/* Performance Chart */}
      <section className="glass-panel rounded-xl p-stack-md">
        <div className="flex justify-between items-center mb-stack-md">
          <h3 className="font-headline text-headline-md text-on-background">Performance</h3>
          <span className="font-label-caps text-label-caps text-primary">LAST 10 MATCHES</span>
        </div>
        <PerformanceChart data={player.performance} />
      </section>

      {/* Recent Matches */}
      <section className="flex flex-col gap-stack-sm pb-stack-lg">
        <h3 className="font-headline text-headline-md text-on-background mb-stack-sm">
          Recent Matches
        </h3>
        {player.recentMatches.length > 0 ? (
          player.recentMatches.map((match) => {
            const isWin = match.placement === 1;
            return (
              <Link
                key={match.id}
                href={`/matches/${match.id}`}
                className="glass-panel rounded-lg p-stack-sm flex items-center justify-between hover:bg-surface-container transition-colors group cursor-pointer block"
              >
                <div className="flex items-center gap-stack-sm">
                  <div
                    className={`w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center ${
                      isWin ? "text-primary" : "text-on-surface-variant"
                    }`}
                  >
                    <span className="material-symbols-outlined">swords</span>
                  </div>
                  <div>
                    <div className="font-stat-value text-stat-value text-on-background group-hover:text-primary transition-colors">
                      Match #{match.matchNumber}
                    </div>
                    <div className="font-label-caps text-label-caps text-on-surface-variant">
                      PLACEMENT #{match.placement}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-stat-value text-stat-value ${isWin ? "text-primary" : "text-on-surface"}`}>
                    {isWin ? "VICTORY" : "COMPLETE"}
                  </div>
                  <div className="font-label-caps text-label-caps text-on-surface-variant">
                    {match.kills} KILLS
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="text-center py-6 text-on-surface-variant font-label-caps text-label-caps">
            NO MATCHES LOGGED YET FOR THIS PLAYER
          </div>
        )}
      </section>
    </main>
  );
}
