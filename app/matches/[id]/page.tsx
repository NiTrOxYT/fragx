import { getMatchById } from "@/lib/services/matches";
import { formatSessionDate } from "@/lib/utils/dates";
import { notFound } from "next/navigation";
import MatchDetailsClient from "./MatchDetailsClient";

export const revalidate = 60;

interface MatchDetailsPageProps {
  params: {
    id: string;
  };
}

export default async function MatchDetailsPage({ params }: MatchDetailsPageProps) {
  const match = await getMatchById(params.id);

  if (!match) {
    notFound();
  }

  const formattedDate = formatSessionDate(match.session.date);

  const matchTeams = match.matchTeams?.map((mt: any) => ({
    id: mt.id,
    teamName: mt.team.name,
    placement: mt.placement,
    players: mt.players.map((mp: any) => ({
      id: mp.player.id,
      name: mp.player.name,
      avatarUrl: mp.player.avatarUrl,
      kills: mp.kills,
    })),
  })) || [];

  return (
    <MatchDetailsClient
      match={{
        id: match.id,
        matchNumber: match.matchNumber,
        placement: match.placement || (matchTeams[0]?.placement || 1),
        kills: match.kills || 0,
        playerName: match.player?.name || "Squad",
        dateStr: formattedDate,
        screenshotUrl: match.screenshotUrl,
        duration: match.duration || "20:00 MIN",
        matchTeams,
      }}
    />
  );
}
