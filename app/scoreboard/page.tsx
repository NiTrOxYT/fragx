import { getScoreboardData } from "@/lib/services/stats";
import TeamScoreboard from "@/components/common/TeamScoreboard";
import EmptyState from "@/components/common/EmptyState";

export const revalidate = 60;

export default async function ScoreboardPage() {
  let scoreboardData = null;
  try {
    scoreboardData = await getScoreboardData();
  } catch (error) {
    console.error("[Scoreboard] Failed to load scoreboard data from database:", error);
  }

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-safe-margin flex flex-col items-center pt-header-safe md:pt-20 pb-32">
      {scoreboardData ? (
        <TeamScoreboard data={scoreboardData} />
      ) : (
        <div className="w-full max-w-3xl">
          <EmptyState
            icon="military_tech"
            title="Scoreboard Unavailable"
            description="At least two registered squad teams and published match sessions are required to display the tournament scoreboard."
          />
        </div>
      )}
    </main>
  );
}
