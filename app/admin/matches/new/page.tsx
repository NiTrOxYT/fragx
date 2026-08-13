import { verifyAdminAuth } from "@/lib/services/admin";
import { getOrCreateActiveDraftSession, getAllSessions } from "@/lib/services/sessions";
import { getAllPlayers } from "@/lib/services/players";
import { formatSessionDate } from "@/lib/utils/dates";
import MatchFormClient from "./MatchFormClient";
import { redirect } from "next/navigation";

export const revalidate = 0;

export default async function AddMatchPage() {
  const isAuth = await verifyAdminAuth();
  if (!isAuth) {
    redirect("/admin");
  }

  const [activeDraft, sessions, players] = await Promise.all([
    getOrCreateActiveDraftSession(),
    getAllSessions(),
    getAllPlayers(),
  ]);

  // Next match number in current draft session
  const nextMatchNum = activeDraft.matches.length + 1;

  return (
    <MatchFormClient
      activeSessionId={activeDraft.id}
      nextMatchNumber={nextMatchNum}
      sessions={sessions.map((s) => ({
        id: s.id,
        dateStr: formatSessionDate(s.date),
        status: s.status,
      }))}
      initialPlayers={players.map((p) => ({
        id: p.id,
        name: p.name,
      }))}
    />
  );
}

