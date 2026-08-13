import { verifyAdminAuth } from "@/lib/services/admin";
import { getLatestPublishedSession, getMVP, getSessionSummary } from "@/lib/services/stats";
import { getOrCreateActiveDraftSession } from "@/lib/services/sessions";
import { getAllPlayers } from "@/lib/services/players";
import AdminDashboardClient from "./AdminDashboardClient";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const [isAuthenticated, activeDraft, summary, mvpData, players] = await Promise.all([
    verifyAdminAuth(),
    getOrCreateActiveDraftSession(),
    getSessionSummary(),
    getMVP(),
    getAllPlayers(),
  ]);

  const currentMvp = mvpData?.players[0];

  return (
    <AdminDashboardClient
      isAuthenticated={isAuthenticated}
      activeDraftId={activeDraft.id}
      draftMatchCount={activeDraft.matches.length}
      initialPlayers={players.map((p) => ({
        id: p.id,
        name: p.name,
        avatarUrl: p.avatarUrl,
        role: (p.role || "PLAYER") as "PLAYER" | "MODERATOR" | "ADMIN",
        isActive: p.isActive !== false,
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

