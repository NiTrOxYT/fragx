import { prisma } from "@/lib/db";

export async function getAllPlayers() {
  return await prisma.player.findMany({
    select: {
      id: true,
      name: true,
      avatarUrl: true,
    },
    orderBy: { name: "asc" },
  });
}

export async function getPlayerById(id: string) {
  const [player, matches] = await Promise.all([
    prisma.player.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
      },
    }),
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

export async function createPlayer(name: string, avatarUrl?: string) {
  const defaultAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`;

  try {
    return await prisma.player.create({
      data: {
        name,
        avatarUrl: avatarUrl || defaultAvatar,
      },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
      },
    });
  } catch (err: any) {
    if (err?.code === "P2002") {
      const existing = await prisma.player.findUnique({
        where: { name },
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      });
      if (existing) return existing;
    }
    throw err;
  }
}

