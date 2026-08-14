import { verifyAdminAuth } from "@/lib/services/admin";
import { getMVP, getSessionSummary } from "@/lib/services/stats";
import { getOrCreateActiveDraftSession } from "@/lib/services/sessions";
import { getAllAdminMatches } from "@/lib/services/matches";
import { getAdminPlayersList } from "@/lib/services/players";
import { getAllTeams } from "@/lib/services/teams";
import {
  getSessionGoldenGunDetails,
  getAdminGoldenGunSessions,
} from "@/lib/services/goldengun";
import AdminDashboardClient from "./AdminDashboardClient";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const [
    isAuthenticated,
    activeDraft,
    summary,
    mvpData,
    allMatches,
    players,
    teams,
    initialGoldenGun,
    goldenGunSessions,
  ] = await Promise.all([
    verifyAdminAuth(),
    getOrCreateActiveDraftSession(),
    getSessionSummary(),
    getMVP(),
    getAllAdminMatches(),
    getAdminPlayersList(),
    getAllTeams(),
    getSessionGoldenGunDetails(),
    getAdminGoldenGunSessions(),
  ]);

  const currentMvp = mvpData?.players[0];

  return (
    <AdminDashboardClient
      isAuthenticated={isAuthenticated}
      activeDraftId={activeDraft.id}
      draftMatchCount={activeDraft.matches.length}
      initialMatches={allMatches}
      initialPlayers={players}
      initialTeams={teams.map((t) => ({
        id: t.id,
        name: t.name,
        avatarUrl: t.avatarUrl || null,
        isActive: t.isActive,
        players: t.players || [],
        playerCount: t.players?.length || 0,
      }))}
      initialGoldenGun={initialGoldenGun}
      initialGoldenGunSessions={goldenGunSessions}

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

