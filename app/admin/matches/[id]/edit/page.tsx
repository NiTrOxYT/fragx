import { verifyAdminAuth } from "@/lib/services/admin";
import { getAuthenticatedPlayer } from "@/lib/services/access";
import { getMatchById } from "@/lib/services/matches";
import { getAllSessions } from "@/lib/services/sessions";
import { getAllPlayers } from "@/lib/services/players";
import { getActiveTeams } from "@/lib/services/teams";
import { formatSessionDate } from "@/lib/utils/dates";
import { notFound, redirect } from "next/navigation";
import EditMatchFormClient from "./EditMatchFormClient";

export const revalidate = 0;

interface EditMatchPageProps {
  params: {
    id: string;
  };
}

export default async function EditMatchPage({ params }: EditMatchPageProps) {
  const isMasterAdmin = await verifyAdminAuth();
  const authPlayer = await getAuthenticatedPlayer();

  const isAuthorized =
    isMasterAdmin || authPlayer?.role === "ADMIN" || authPlayer?.role === "MODERATOR";

  if (!isAuthorized) {
    redirect("/admin");
  }

  const [match, sessions, players, teams] = await Promise.all([
    getMatchById(params.id),
    getAllSessions(),
    getAllPlayers(),
    getActiveTeams(),
  ]);

  if (!match) {
    notFound();
  }

  const sessionDateIso = match.session?.date
    ? new Date(match.session.date).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];

  const matchTeams =
    match.matchTeams?.map((mt: any) => ({
      teamId: mt.team.id,
      placement: mt.placement,
      players: mt.players.map((mp: any) => ({
        playerId: mp.player.id,
        kills: mp.kills,
      })),
    })) || [];

  return (
    <EditMatchFormClient
      existingMatch={{
        id: match.id,
        matchNumber: match.matchNumber,
        sessionDate: sessionDateIso,
        screenshotUrl: match.screenshotUrl,
        duration: match.duration || "20:00 MIN",
        matchTeams,
      }}
      sessions={sessions.map((s) => ({
        id: s.id,
        dateStr: formatSessionDate(s.date),
        status: s.status,
      }))}
      initialPlayers={players.map((p) => ({
        id: p.id,
        name: p.name,
      }))}
      initialTeams={teams.map((t) => ({
        id: t.id,
        name: t.name,
      }))}
    />
  );
}
