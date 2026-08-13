import { verifyAdminAuth } from "@/lib/services/admin";
import { getOrCreateActiveDraftSession, getAllSessions } from "@/lib/services/sessions";
import { getAllPlayers } from "@/lib/services/players";
import MatchFormClient from "./MatchFormClient";
import { redirect } from "next/navigation";

export const revalidate = 0;

export default async function AddMatchPage() {
  const isAuth = await verifyAdminAuth();
  if (!isAuth) {
    redirect("/admin");
  }

  const activeDraft = await getOrCreateActiveDraftSession();
  const sessions = await getAllSessions();
  const players = await getAllPlayers();

  // Next match number in current draft session
  const nextMatchNum = activeDraft.matches.length + 1;

  return (
    <MatchFormClient
      activeSessionId={activeDraft.id}
      nextMatchNumber={nextMatchNum}
      sessions={sessions.map((s) => ({
        id: s.id,
        dateStr: new Date(s.date).toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }),
        status: s.status,
      }))}
      initialPlayers={players.map((p) => ({
        id: p.id,
        name: p.name,
      }))}
    />
  );
}
