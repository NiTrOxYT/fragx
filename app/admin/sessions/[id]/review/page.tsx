import { verifyAdminAuth } from "@/lib/services/admin";
import { getSessionById } from "@/lib/services/sessions";
import { getMVP, getGoldenGunAward } from "@/lib/services/stats";
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

  const [session, mvpData, goldenGunData] = await Promise.all([
    getSessionById(params.id),
    getMVP(params.id),
    getGoldenGunAward(params.id),
  ]);

  if (!session) {
    notFound();
  }

  const mainMvp = mvpData?.players[0];
  const formattedDate = formatSessionDate(session.date);

  const mappedMatches = session.matches.map((m: any) => {
    const isMultiTeam = m.matchTeams && m.matchTeams.length > 0;
    const topTeam = isMultiTeam ? m.matchTeams[0] : null;
    const kills = isMultiTeam
      ? m.matchTeams.reduce(
          (acc: number, mt: any) =>
            acc + mt.players.reduce((pAcc: number, p: any) => pAcc + p.kills, 0),
          0
        )
      : m.kills || 0;
    const placement = isMultiTeam ? topTeam?.placement || 1 : m.placement || 1;
    const playerName = isMultiTeam ? topTeam?.team.name || "Team" : m.player?.name || "Player";

    return {
      id: m.id,
      matchNumber: m.matchNumber,
      playerName,
      kills,
      placement,
      isWin: placement === 1,
    };
  });

  const totalKills = mappedMatches.reduce((acc, m) => acc + m.kills, 0);
  const goldenGunNames = goldenGunData?.winners.map((w) => w.name).join(" & ") || "None";
  const goldenGunKills = goldenGunData?.totalKills || 0;


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
        goldenGunNames,
        goldenGunKills,
        matches: mappedMatches,
      }}
    />
  );
}
