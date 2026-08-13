import { getMatchById } from "@/lib/services/matches";
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

  const dateObj = new Date(match.session.date);
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).toUpperCase();

  return (
    <MatchDetailsClient
      match={{
        id: match.id,
        matchNumber: match.matchNumber,
        placement: match.placement,
        kills: match.kills,
        playerName: match.player.name,
        dateStr: formattedDate,
        screenshotUrl: match.screenshotUrl,
        duration: match.duration || "20:00 MIN",
      }}
    />
  );
}
