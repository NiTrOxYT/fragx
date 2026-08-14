import { verifyAdminAuth } from "@/lib/services/admin";
import { getMVP, getSessionSummary } from "@/lib/services/stats";
import { getOrCreateActiveDraftSession } from "@/lib/services/sessions";
import { getAllAdminMatches } from "@/lib/services/matches";
import { getAllPlayers } from "@/lib/services/players";
import { getAllTeams } from "@/lib/services/teams";
import AdminDashboardClient from "./AdminDashboardClient";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const [isAuthenticated, activeDraft, summary, mvpData, allMatches, players, teams] = await Promise.all([
    verifyAdminAuth(),
    getOrCreateActiveDraftSession(),
    getSessionSummary(),
    getMVP(),
    getAllAdminMatches(),
    getAllPlayers(),
    getAllTeams(),
  ]);

  const currentMvp = mvpData?.players[0];

  return (
    <AdminDashboardClient
      isAuthenticated={isAuthenticated}
      activeDraftId={activeDraft.id}
      draftMatchCount={activeDraft.matches.length}
      initialMatches={allMatches}
      initialPlayers={players.map((p) => ({
        id: p.id,
        name: p.name,
        avatarUrl: p.avatarUrl,
        role: (p.role || "PLAYER") as "PLAYER" | "MODERATOR" | "ADMIN",
        isActive: p.isActive !== false,
      }))}
      initialTeams={teams.map((t) => ({
        id: t.id,
        name: t.name,
        isActive: t.isActive,
        playerCount: t.playerCount || 0,
      }))}
      stats={{
        totalMatches: summary.matchCount,
        totalKills: summary.totalKills,
        mvpName: currentMvp?.name || "None",
        mvpAvatar: currentMvp?.avatarUrl || "",
        mvpKills: currentMvp?.totalKills || 0,
      }}
    />
  );
}
