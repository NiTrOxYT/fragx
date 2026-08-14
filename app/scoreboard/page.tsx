import { getScoreboardData } from "@/lib/services/stats";
import TeamScoreboard from "@/components/common/TeamScoreboard";
import EmptyState from "@/components/common/EmptyState";

export const revalidate = 60;

export default async function ScoreboardPage() {
  const scoreboardData = await getScoreboardData();

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-safe-margin flex flex-col items-center pt-header-safe md:pt-20 pb-32">
      {scoreboardData ? (
        <TeamScoreboard data={scoreboardData} />
      ) : (
        <div className="w-full max-w-3xl">
          <EmptyState
            icon="military_tech"
            title="No Scoreboard Data"
            description="Scoreboard will populate automatically once squad teams complete and publish match sessions."
          />
        </div>
      )}
    </main>
  );
}
