import Link from "next/link";
import { getAllPlayers } from "@/lib/services/players";
import { getLeaderboard } from "@/lib/services/stats";
import EmptyState from "@/components/common/EmptyState";

export const revalidate = 60;

export default async function PlayersPage() {
  const leaderboard = await getLeaderboard("ALL TIME");

  return (
    <main className="max-w-md mx-auto px-safe-margin pt-20 pb-24 flex flex-col gap-stack-lg w-full">
      <section className="flex flex-col gap-stack-sm pt-stack-sm">
        <h2 className="font-headline text-headline-md text-on-surface uppercase">
          SQUAD MEMBERS
        </h2>
        <p className="font-body text-body-md text-on-surface-variant">
          Active BGMI fraggers in the squad.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-gutter">
        {leaderboard.length > 0 ? (
          leaderboard.map((player) => (
            <Link
              key={player.id}
              href={`/players/${player.id}`}
              className="glass-panel rounded-xl p-stack-md flex items-center justify-between hover:border-primary/50 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border border-primary/40 overflow-hidden relative flex-shrink-0">
                  <img
                    src={player.avatarUrl}
                    alt={player.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div>
                  <h3 className="font-headline text-headline-md text-on-surface group-hover:text-primary transition-colors">
                    {player.name}
                  </h3>
                  <div className="font-label-caps text-label-caps text-on-surface-variant flex items-center gap-2 mt-0.5">
                    <span>{player.matchesCount} MATCHES</span>
                    <span>•</span>
                    <span>{player.wins} WINS</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-stat-value text-stat-value text-primary">
                  {player.kd} <span className="text-[10px] text-on-surface-variant">K/D</span>
                </div>
                <span className="font-label-caps text-[10px] text-gold uppercase mt-1 inline-block">
                  RANK #{player.rank}
                </span>
              </div>
            </Link>
          ))
        ) : (
          <EmptyState
            icon="group"
            title="No Squad Members"
            description="No players have been registered yet. Admin can create squad players when logging matches."
          />
        )}
      </section>
    </main>
  );
}

