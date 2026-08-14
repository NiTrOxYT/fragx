import Link from "next/link";
import { getLeaderboard } from "@/lib/services/stats";
import EmptyState from "@/components/common/EmptyState";

export const revalidate = 60;

interface LeaderboardPageProps {
  searchParams?: {
    timeframe?: "ALL TIME" | "THIS MONTH" | "THIS WEEK";
  };
}

export default async function LeaderboardPage({ searchParams }: LeaderboardPageProps) {
  const timeframe = searchParams?.timeframe || "ALL TIME";
  const leaderboard = await getLeaderboard(timeframe);

  return (
    <main className="flex-1 w-full max-w-4xl mx-auto px-2 sm:px-safe-margin flex flex-col gap-stack-lg pt-header-safe md:pt-20 pb-32">
      {/* Header Section */}
      <section className="flex flex-col gap-stack-sm px-1 sm:px-0 pt-2 sm:pt-0">
        <div className="flex items-center justify-between">
          <h2 className="font-headline text-headline-sm sm:text-headline-md text-on-surface uppercase">
            CUMULATIVE LEADERBOARD
          </h2>
          <span className="font-label-caps text-[10px] sm:text-xs text-on-surface-variant/80 uppercase">
            ALL-TIME FRAG STATS
          </span>
        </div>

        {/* Timeframe Filters */}
        <div className="flex bg-surface-container rounded-lg p-1 mt-1 sm:mt-2 max-w-xs">
          {(["ALL TIME", "THIS MONTH", "THIS WEEK"] as const).map((tf) => (
            <Link
              key={tf}
              href={`/leaderboard?timeframe=${encodeURIComponent(tf)}`}
              className={`flex-1 py-1.5 px-2.5 sm:px-3 rounded text-center font-label-caps text-[10px] sm:text-label-caps transition-all ${
                timeframe === tf
                  ? "bg-surface-variant text-on-surface shadow-sm font-bold"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {tf}
            </Link>
          ))}
        </div>
      </section>

      {/* Leaderboard Table */}
      {leaderboard && leaderboard.length > 0 ? (
        <section className="glass-panel rounded-2xl overflow-hidden flex flex-col border border-surface-container-high shadow-xl w-full">
          {/* Table Header */}
          <div className="grid grid-cols-[28px_minmax(0,1fr)_44px_54px_48px] sm:grid-cols-[40px_1fr_70px_90px_70px] gap-1.5 sm:gap-2 px-2.5 sm:px-5 py-3 bg-surface-container-high border-b border-surface-container-high items-center">
            <div className="font-label-caps text-[10px] sm:text-xs text-on-surface-variant text-center font-bold">
              #
            </div>
            <div className="font-label-caps text-[10px] sm:text-xs text-on-surface-variant font-bold">
              FRAGGER
            </div>
            <div className="font-label-caps text-[10px] sm:text-xs text-on-surface-variant text-center font-bold">
              MATCHES
            </div>
            <div className="font-label-caps text-[10px] sm:text-xs text-primary text-right font-bold">
              <span className="hidden sm:inline">TOTAL </span>KILLS
            </div>
            <div className="font-label-caps text-[10px] sm:text-xs text-on-surface-variant text-right font-bold">
              K/D
            </div>
          </div>

          {/* List Container */}
          <div className="flex flex-col divide-y divide-surface-container-high/40">
            {leaderboard.map((item) => {
              let rankClass = "text-on-surface-variant text-xs sm:text-base";
              let sideBorderColor = "";
              let avatarBorder = "border-surface-container-high";

              if (item.rank === 1) {
                rankClass = "rank-gold text-gold font-bold text-sm sm:text-lg";
                sideBorderColor =
                  "bg-[#D4AF37] opacity-80 shadow-[0_0_8px_rgba(212,175,55,0.6)]";
                avatarBorder = "border-[#D4AF37]/60";
              } else if (item.rank === 2) {
                rankClass = "rank-silver text-gray-300 font-bold text-xs sm:text-base";
                sideBorderColor = "bg-[#C0C0C0] opacity-50";
              } else if (item.rank === 3) {
                rankClass = "rank-bronze text-amber-600 font-bold text-xs sm:text-base";
                sideBorderColor = "bg-[#CD7F32] opacity-50";
              }

              return (
                <Link
                  key={item.id}
                  href={`/players/${item.id}`}
                  className="grid grid-cols-[28px_minmax(0,1fr)_44px_54px_48px] sm:grid-cols-[40px_1fr_70px_90px_70px] gap-1.5 sm:gap-2 items-center px-2.5 sm:px-5 py-3 sm:py-4 hover:bg-surface-container/60 transition-colors relative overflow-hidden group"
                >
                  {sideBorderColor && (
                    <div className={`absolute inset-y-0 left-0 w-1 ${sideBorderColor}`} />
                  )}

                  {/* Rank */}
                  <div className={`font-display-stat text-center ${rankClass}`}>
                    #{item.rank}
                  </div>

                  {/* Player Info & Golden Gun Badge */}
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div
                      className={`w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-surface-container border-2 ${avatarBorder} flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm`}
                    >
                      <img
                        src={item.avatarUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-headline text-xs sm:text-headline-sm text-on-surface truncate group-hover:text-primary transition-colors">
                        {item.name}
                      </span>

                      {/* Golden Gun Indicator */}
                      <div className="flex items-center gap-0.5 sm:gap-1 mt-0.5 whitespace-nowrap">
                        <span
                          className="material-symbols-outlined text-[13px] sm:text-[15px] text-gold"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                          title="Golden Gun Session Awards"
                        >
                          military_tech
                        </span>
                        <span className="font-label-caps text-[9px] sm:text-[11px] text-gold font-bold">
                          <span className="sm:hidden">GG</span>
                          <span className="hidden sm:inline">GOLDEN GUN</span> ×{" "}
                          {item.goldenGunCount || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Matches Count */}
                  <div className="font-mono text-xs sm:text-sm text-on-surface-variant text-center">
                    {item.matchesCount}
                  </div>

                  {/* Total Kills */}
                  <div className="font-display-stat text-sm sm:text-lg text-primary text-right font-bold">
                    {item.totalKills}
                  </div>

                  {/* K/D */}
                  <div className="font-mono text-xs sm:text-sm text-on-surface text-right font-bold pr-0.5 sm:pr-0">
                    {item.kd.toFixed(2)}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ) : (
        <EmptyState
          icon="leaderboard"
          title="No Leaderboard Data"
          description="Leaderboard will populate automatically as players log and publish match sessions."
        />
      )}
    </main>
  );
}
