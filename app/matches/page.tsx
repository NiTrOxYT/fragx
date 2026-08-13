import Link from "next/link";
import { getGroupedMatchHistory } from "@/lib/services/matches";
import EmptyState from "@/components/common/EmptyState";

export const revalidate = 60;

interface MatchHistoryPageProps {
  searchParams?: {
    filter?: string;
  };
}

export default async function MatchHistoryPage({ searchParams }: MatchHistoryPageProps) {
  const activeFilter = searchParams?.filter || "ALL";
  let dateGroups = await getGroupedMatchHistory();

  if (activeFilter === "BEST") {
    // Filter to top placement matches (#1 or top kills)
    dateGroups = dateGroups
      .map((group) => ({
        ...group,
        matches: group.matches.filter((m) => m.placement <= 3 || m.kills >= 10),
      }))
      .filter((group) => group.matches.length > 0);
  } else if (activeFilter === "RECENT") {
    dateGroups = dateGroups.slice(0, 2);
  }

  return (
    <main className="pt-20 px-safe-margin max-w-3xl mx-auto space-y-stack-lg md:pt-16 pb-24 w-full">
      {/* Header & Filters */}
      <div className="flex flex-col space-y-stack-sm pt-4">
        <h2 className="font-headline text-headline-lg text-on-surface">Match History</h2>
        
        {/* Filter Pills */}
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
          <Link
            href="/matches?filter=ALL"
            className={`px-4 py-2 rounded-full font-label-caps text-label-caps whitespace-nowrap transition-transform active:scale-95 ${
              activeFilter === "ALL"
                ? "bg-primary-container text-on-primary-container"
                : "bg-surface-container border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            ALL MATCHES
          </Link>
          <Link
            href="/matches?filter=RECENT"
            className={`px-4 py-2 rounded-full font-label-caps text-label-caps whitespace-nowrap transition-transform active:scale-95 ${
              activeFilter === "RECENT"
                ? "bg-primary-container text-on-primary-container"
                : "bg-surface-container border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            RECENT SESSIONS
          </Link>
          <Link
            href="/matches?filter=BEST"
            className={`px-4 py-2 rounded-full font-label-caps text-label-caps whitespace-nowrap transition-transform active:scale-95 ${
              activeFilter === "BEST"
                ? "bg-primary-container text-on-primary-container"
                : "bg-surface-container border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            BEST FRAGS
          </Link>
        </div>
      </div>

      {dateGroups.length > 0 ? (
        dateGroups.map((group) => (
          <section key={group.date} className="space-y-stack-md">
            <h3 className="font-label-caps text-label-caps text-on-surface-variant flex items-center gap-2">
              <span className="w-4 h-[1px] bg-outline-variant" />
              {group.date}
              <span className="flex-1 h-[1px] bg-outline-variant" />
            </h3>

            {group.matches.map((match) => {
              const isFirst = match.placement === 1;
              const isDnf = match.placement > 10;

              return (
                <Link
                  key={match.id}
                  href={`/matches/${match.id}`}
                  className="bg-surface-container rounded-xl border border-[#262626] p-4 flex items-center justify-between hover:border-outline/50 transition-colors cursor-pointer group block relative overflow-hidden"
                >
                  {isFirst && (
                    <div className="absolute inset-0 bg-secondary/5 opacity-5 pointer-events-none" />
                  )}

                  <div className="flex items-center gap-4 relative z-10">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center border border-outline-variant/30 ${
                        isFirst
                          ? "bg-secondary/10 text-gold border-gold/30 shadow-[0_0_15px_rgba(212,175,55,0.1)]"
                          : "bg-surface-container-high text-on-surface-variant"
                      }`}
                    >
                      <span className="material-symbols-outlined">
                        {isFirst ? "emoji_events" : isDnf ? "cancel" : "format_list_numbered"}
                      </span>
                    </div>

                    <div>
                      <div className="font-stat-value text-stat-value text-on-surface group-hover:text-primary transition-colors flex items-center gap-2">
                        {match.placement === 1 ? "1st Place" : `${match.placement}th Place`}
                        {isFirst && (
                          <span className="bg-secondary/20 text-gold text-[10px] px-2 py-0.5 rounded font-label-caps">
                            WIN
                          </span>
                        )}
                      </div>
                      <div className="font-body text-body-md text-on-surface-variant">
                        Battle Royale • {match.player.name}
                      </div>
                    </div>
                  </div>

                  <div className="text-right relative z-10">
                    <div
                      className={`font-stat-value text-stat-value ${
                        isFirst ? "text-gold" : "text-primary"
                      }`}
                    >
                      {match.kills} Kills
                    </div>
                    {match.duration && (
                      <div className="font-label-caps text-label-caps text-on-surface-variant mt-1">
                        {match.duration}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </section>
        ))
      ) : (
        <EmptyState
          icon="sports_esports"
          title="No Matches Found"
          description="No matches match the selected filter criteria."
        />
      )}
    </main>
  );
}
