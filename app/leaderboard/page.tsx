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
    <main className="flex-1 w-full max-w-md mx-auto px-safe-margin flex flex-col gap-stack-lg pt-header-safe md:pt-20 pb-24">

      {/* Header Section */}
      <section className="flex flex-col gap-stack-sm">
        <h2 className="font-headline text-headline-md text-on-surface uppercase">
          SQUAD LEADERBOARD
        </h2>

        {/* Filters */}
        <div className="flex bg-surface-container rounded-lg p-1 mt-2">
          {(["ALL TIME", "THIS MONTH", "THIS WEEK"] as const).map((tf) => (
            <Link
              key={tf}
              href={`/leaderboard?timeframe=${encodeURIComponent(tf)}`}
              className={`flex-1 py-1.5 px-3 rounded text-center font-label-caps text-label-caps transition-all ${
                timeframe === tf
                  ? "bg-surface-variant text-on-surface shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {tf}
            </Link>
          ))}
        </div>
      </section>

      {/* Leaderboard Table */}
      {leaderboard.length > 0 ? (
        <section className="glass-panel rounded-xl overflow-hidden flex flex-col">
          {/* Table Header */}
          <div className="grid grid-cols-[30px_1fr_40px_50px] gap-gutter px-4 py-3 bg-surface-container-high border-b border-surface-variant">
            <div className="font-label-caps text-label-caps text-on-surface-variant text-center">#</div>
            <div className="font-label-caps text-label-caps text-on-surface-variant">PLAYER</div>
            <div className="font-label-caps text-label-caps text-on-surface-variant text-right">M</div>
            <div className="font-label-caps text-label-caps text-on-surface-variant text-right">K/D</div>
          </div>

          {/* List Container */}
          <div className="flex flex-col overflow-y-auto max-h-[60vh]">
            {leaderboard.map((item) => {
              let rankClass = "text-on-surface-variant";
              let sideBorderColor = "";
              let avatarBorder = "border-surface-variant";

              if (item.rank === 1) {
                rankClass = "rank-gold";
                sideBorderColor = "bg-[#D4AF37] opacity-80 shadow-[0_0_8px_rgba(212,175,55,0.6)]";
                avatarBorder = "border-[#D4AF37]/30";
              } else if (item.rank === 2) {
                rankClass = "rank-silver";
                sideBorderColor = "bg-[#C0C0C0] opacity-50";
              } else if (item.rank === 3) {
                rankClass = "rank-bronze";
                sideBorderColor = "bg-[#CD7F32] opacity-50";
              }

              return (
                <Link
                  key={item.id}
                  href={`/players/${item.id}`}
                  className="grid grid-cols-[30px_1fr_40px_50px] gap-gutter items-center px-4 py-3.5 border-b border-surface-variant/50 hover:bg-surface-container-lowest transition-colors relative overflow-hidden group"
                >
                  {sideBorderColor && (
                    <div className={`absolute inset-y-0 left-0 w-1 ${sideBorderColor}`} />
                  )}

                  <div className={`font-stat-value text-stat-value text-center ${rankClass}`}>
                    {item.rank}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded bg-surface-container border ${avatarBorder} flex items-center justify-center overflow-hidden flex-shrink-0`}>
                      <img
                        src={item.avatarUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-body text-body-md text-on-surface font-semibold group-hover:text-primary transition-colors">
                        {item.name}
                      </span>
                    </div>
                  </div>

                  <div className="font-body text-body-md text-on-surface-variant text-right">
                    {item.matchesCount}
                  </div>

                  <div
                    className={`font-stat-value text-stat-value text-right ${
                      item.rank === 1 ? "text-primary" : "text-on-surface"
                    }`}
                  >
                    {item.kd}
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

