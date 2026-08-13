import { verifyAdminAuth } from "@/lib/services/admin";
import { getLatestPublishedSession, getMVP, getSessionSummary } from "@/lib/services/stats";
import { getOrCreateActiveDraftSession } from "@/lib/services/sessions";
import AdminDashboardClient from "./AdminDashboardClient";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const [isAuthenticated, activeDraft, summary, mvpData] = await Promise.all([
    verifyAdminAuth(),
    getOrCreateActiveDraftSession(),
    getSessionSummary(),
    getMVP(),
  ]);

  const currentMvp = mvpData?.players[0];

  return (
    <AdminDashboardClient
      isAuthenticated={isAuthenticated}
      activeDraftId={activeDraft.id}
      draftMatchCount={activeDraft.matches.length}
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
