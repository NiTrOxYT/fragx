import { verifyAdminAuth } from "@/lib/services/admin";
import { getSessionById } from "@/lib/services/sessions";
import { getMVP } from "@/lib/services/stats";
import { formatSessionDate } from "@/lib/utils/dates";
import { notFound, redirect } from "next/navigation";
import SessionReviewClient from "./SessionReviewClient";

export const revalidate = 0;

interface ReviewSessionPageProps {
  params: {
    id: string;
  };
}

export default async function ReviewSessionPage({ params }: ReviewSessionPageProps) {
  const isAuth = await verifyAdminAuth();
  if (!isAuth) {
    redirect("/admin");
  }

  const [session, mvpData] = await Promise.all([
    getSessionById(params.id),
    getMVP(params.id),
  ]);

  if (!session) {
    notFound();
  }

  const mainMvp = mvpData?.players[0];
  const formattedDate = formatSessionDate(session.date);
  const totalKills = session.matches.reduce((acc, m) => acc + m.kills, 0);


  return (
    <SessionReviewClient
      session={{
        id: session.id,
        dateStr: formattedDate,
        status: session.status,
        matchCount: session.matches.length,
        totalKills,
        mvpName: mainMvp?.name || "None",
        mvpKills: mainMvp?.totalKills || 0,
        matches: session.matches.map((m) => ({
          id: m.id,
          matchNumber: m.matchNumber,
          playerName: m.player.name,
          kills: m.kills,
          placement: m.placement,
          isWin: m.placement === 1,
        })),
      }}
    />
  );
}
