import { prisma } from "@/lib/db";

export type PlayerRole = "PLAYER" | "MODERATOR" | "ADMIN";

export interface PlayerRecord {
  id: string;
  name: string;
  avatarUrl: string;
  role: PlayerRole;
  isActive: boolean;
}

export async function getAllPlayers(): Promise<PlayerRecord[]> {
  return await (prisma.player as any).findMany({
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      role: true,
      isActive: true,
    },
    orderBy: { name: "asc" },
  });
}

export async function getPlayerById(id: string) {
  const [player, matches] = await Promise.all([
    (prisma.player as any).findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        role: true,
        isActive: true,
      },
    }) as Promise<PlayerRecord | null>,
    prisma.match.findMany({
      where: {
        playerId: id,
        session: {
          status: "PUBLISHED",
        },
      },
      select: {
        id: true,
        matchNumber: true,
        kills: true,
        placement: true,
        createdAt: true,
        session: {
          select: { date: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!player) return null;

  const matchesCount = matches.length;
  const totalKills = matches.reduce((acc, m) => acc + m.kills, 0);
  const wins = matches.filter((m) => m.placement === 1).length;
  const avgKills = matchesCount > 0 ? Number((totalKills / matchesCount).toFixed(1)) : 0;
  const kd = matchesCount > 0 ? Number((totalKills / matchesCount).toFixed(1)) : 0;

  // Performance chart data: last 10 matches in chronological order
  const performanceMatches = [...matches].reverse().slice(-10);
  const performance = performanceMatches.map((m, idx) => ({
    matchIndex: idx + 1,
    kills: m.kills,
    placement: m.placement,
    date: new Date(m.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));

  return {
    ...player,
    stats: {
      matches: matchesCount,
      wins,
      kills: totalKills,
      avgKills,
      kd,
    },
    performance,
    recentMatches: matches.slice(0, 10),
  };
}

export async function createPlayer(name: string, avatarUrl?: string, role?: PlayerRole): Promise<PlayerRecord> {
  const defaultAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`;

  try {
    return await (prisma.player as any).create({
      data: {
        name,
        avatarUrl: avatarUrl || defaultAvatar,
        role: role || "PLAYER",
      },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        role: true,
        isActive: true,
      },
    });
  } catch (err: any) {
    if (err?.code === "P2002") {
      const existing = await (prisma.player as any).findUnique({
        where: { name },
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          role: true,
          isActive: true,
        },
      });
      if (existing) return existing;
    }
    throw err;
  }
}

export async function updatePlayer(
  id: string,
  data: {
    name?: string;
    avatarUrl?: string;
    role?: PlayerRole;
    isActive?: boolean;
  }
): Promise<PlayerRecord> {
  return await (prisma.player as any).update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      role: true,
      isActive: true,
    },
  });
}

export async function deletePlayer(id: string) {
  return await prisma.player.delete({
    where: { id },
  });
}





