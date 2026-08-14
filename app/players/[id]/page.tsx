import { getPlayerById } from "@/lib/services/players";
import { getAuthenticatedPlayer } from "@/lib/services/access";
import { notFound } from "next/navigation";
import PlayerProfileClient from "./PlayerProfileClient";

export const revalidate = 60;

interface PlayerProfilePageProps {
  params: {
    id: string;
  };
}

export default async function PlayerProfilePage({ params }: PlayerProfilePageProps) {
  const [player, authPlayer] = await Promise.all([
    getPlayerById(params.id),
    getAuthenticatedPlayer(),
  ]);

  if (!player) {
    notFound();
  }

  const isOwner = authPlayer?.id === player.id;
  const canEdit = Boolean(authPlayer && (isOwner || authPlayer.isAdmin));

  return (
    <PlayerProfileClient
      player={{
        id: player.id,
        name: player.name,
        avatarUrl: player.avatarUrl,
        role: player.role,
        isActive: player.isActive,
        stats: player.stats,
        performance: player.performance,
        recentMatches: player.recentMatches,
      }}
      canEdit={canEdit}
    />
  );
}
