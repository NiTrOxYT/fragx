import { cache } from "react";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { cryptoNative } from "@/lib/auth-crypto";
import { getGoldenGunCounts } from "@/lib/services/stats";

export type PlayerRole = "PLAYER" | "MODERATOR" | "ADMIN";

export interface PlayerRecord {
  id: string;
  name: string;
  avatarUrl: string;
  role: PlayerRole;
  isActive: boolean;
}

const getAllPlayersInternal = async (): Promise<PlayerRecord[]> => {
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
};

export const getAllPlayers = unstable_cache(
  getAllPlayersInternal,
  ["all-players"],
  { revalidate: 60, tags: ["players"] }
);

const getPlayerByIdInternal = async (id: string) => {
  const [player, legacyMatches, multiTeamMatchPlayers] = await Promise.all([
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
    (prisma.match as any).findMany({
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
    (prisma as any).matchPlayer.findMany({
      where: {
        playerId: id,
        matchTeam: {
          match: {
            session: { status: "PUBLISHED" },
          },
        },
      },
      select: {
        id: true,
        kills: true,
        createdAt: true,
        matchTeam: {
          select: {
            placement: true,
            match: {
              select: {
                id: true,
                matchNumber: true,
                createdAt: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!player) return null;

  // Combine matches
  const combinedMatches = [
    ...legacyMatches.map((m: any) => ({
      id: m.id,
      matchNumber: m.matchNumber,
      kills: m.kills || 0,
      placement: m.placement || 999,
      createdAt: m.createdAt,
    })),
    ...multiTeamMatchPlayers.map((mp: any) => ({
      id: mp.matchTeam.match.id,
      matchNumber: mp.matchTeam.match.matchNumber,
      kills: mp.kills || 0,
      placement: mp.matchTeam.placement || 999,
      createdAt: mp.createdAt,
    })),
  ];

  combinedMatches.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const matchesCount = combinedMatches.length;
  const totalKills = combinedMatches.reduce((acc, m) => acc + m.kills, 0);
  const wins = combinedMatches.filter((m) => m.placement === 1).length;
  const avgKills = matchesCount > 0 ? Number((totalKills / matchesCount).toFixed(1)) : 0;
  const kd = matchesCount > 0 ? Number((totalKills / matchesCount).toFixed(1)) : 0;

  // Performance chart data: last 10 matches in chronological order
  const performanceMatches = [...combinedMatches].reverse().slice(-10);
  const performance = performanceMatches.map((m, idx) => ({
    matchIndex: idx + 1,
    kills: m.kills,
    placement: m.placement,
    date: new Date(m.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));

  const goldenGunCounts = await getGoldenGunCounts();
  const goldenGunCount = goldenGunCounts[id] || 0;

  return {
    ...player,
    stats: {
      matches: matchesCount,
      wins,
      kills: totalKills,
      avgKills,
      kd,
      goldenGunCount,
    },
    performance,
    recentMatches: combinedMatches.slice(0, 10),
  };
};

export const getPlayerById = (id: string) => {
  return unstable_cache(
    async () => getPlayerByIdInternal(id),
    [`player-${id}`],
    { revalidate: 60, tags: ["players", `player-${id}`] }
  )();
};





export async function createPlayer(
  name: string,
  secretKey?: string,
  role?: PlayerRole
): Promise<PlayerRecord> {
  const defaultAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`;
  const keyToUse =
    secretKey && secretKey.trim() !== ""
      ? secretKey.trim()
      : `FRAGX-${name.toUpperCase().replace(/\s+/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`;

  const accessKeyHash = cryptoNative(keyToUse);

  try {
    return await (prisma.player as any).create({
      data: {
        name,
        avatarUrl: defaultAvatar,
        role: role || "PLAYER",
        accessKeyHash,
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
    secretKey?: string;
  }
): Promise<PlayerRecord> {
  const updateData: any = { ...data };
  if (data.secretKey && data.secretKey.trim() !== "") {
    delete updateData.secretKey;
    updateData.accessKeyHash = cryptoNative(data.secretKey.trim());
  }

  return await (prisma.player as any).update({
    where: { id },
    data: updateData,
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

/**
 * Updates a player's cumulative Golden Gun count by calculating the adjustment from raw awards.
 */
export async function updatePlayerGoldenGunCount(playerId: string, targetCount: number) {
  if (!Number.isInteger(targetCount) || targetCount < 0) {
    throw new Error("Golden Gun count must be a non-negative integer");
  }

  // 1. Calculate raw awards count for this player across all published sessions
  const publishedSessions = await (prisma.gamingSession as any).findMany({
    where: { status: "PUBLISHED" },
    select: {
      id: true,
      goldenGunAward: { select: { playerId: true } },
      matches: {
        select: {
          id: true,
          kills: true,
          playerId: true,
          matchTeams: {
            select: {
              players: { select: { playerId: true, kills: true } },
            },
          },
        },
      },
    },
  });

  let rawAwardsCount = 0;
  for (const session of publishedSessions) {
    if (session.goldenGunAward?.playerId) {
      if (session.goldenGunAward.playerId === playerId) {
        rawAwardsCount += 1;
      }
      continue;
    }

    if (!session.matches || session.matches.length === 0) continue;
    const sessionPlayerKills: { [id: string]: number } = {};
    for (const match of session.matches) {
      if (match.matchTeams && match.matchTeams.length > 0) {
        for (const mt of match.matchTeams) {
          for (const mp of mt.players || []) {
            sessionPlayerKills[mp.playerId] = (sessionPlayerKills[mp.playerId] || 0) + (mp.kills || 0);
          }
        }
      } else if (match.playerId) {
        sessionPlayerKills[match.playerId] = (sessionPlayerKills[match.playerId] || 0) + (match.kills || 0);
      }
    }

    let maxSessionKills = 0;
    for (const kills of Object.values(sessionPlayerKills)) {
      if (kills > maxSessionKills) maxSessionKills = kills;
    }

    if (maxSessionKills > 0) {
      const topFraggers = Object.entries(sessionPlayerKills).filter(([_, k]) => k === maxSessionKills);
      if (topFraggers.length === 1 && topFraggers[0][0] === playerId) {
        rawAwardsCount += 1;
      }
    }
  }

  const adjustment = targetCount - rawAwardsCount;

  return await (prisma.player as any).update({
    where: { id: playerId },
    data: { goldenGunAdjustment: adjustment },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      role: true,
      isActive: true,
      goldenGunAdjustment: true,
    },
  });
}

/**
 * Returns players with cumulative kills, matches, and Golden Gun counts for Admin panel.
 */
export async function getAdminPlayersList() {
  const [players, goldenGunCounts, legacyMatches, multiTeamMatchPlayers] = await Promise.all([
    (prisma.player as any).findMany({
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        role: true,
        isActive: true,
        goldenGunAdjustment: true,
      },
      orderBy: { name: "asc" },
    }),
    getGoldenGunCounts(),
    (prisma.match as any).findMany({
      where: { session: { status: "PUBLISHED" } },
      select: { playerId: true, kills: true },
    }),
    (prisma as any).matchPlayer.findMany({
      where: { matchTeam: { match: { session: { status: "PUBLISHED" } } } },
      select: { playerId: true, kills: true },
    }),
  ]);

  const statsMap = new Map<string, { kills: number; matches: number }>();
  for (const p of players) {
    statsMap.set(p.id, { kills: 0, matches: 0 });
  }

  for (const m of legacyMatches) {
    if (m.playerId && statsMap.has(m.playerId)) {
      const s = statsMap.get(m.playerId)!;
      s.kills += m.kills || 0;
      s.matches += 1;
    }
  }

  for (const mp of multiTeamMatchPlayers) {
    if (mp.playerId && statsMap.has(mp.playerId)) {
      const s = statsMap.get(mp.playerId)!;
      s.kills += mp.kills || 0;
      s.matches += 1;
    }
  }

  return players.map((p: any) => ({
    id: p.id,
    name: p.name,
    avatarUrl: p.avatarUrl,
    role: p.role,
    isActive: p.isActive,
    goldenGunCount: goldenGunCounts[p.id] || 0,
    totalKills: statsMap.get(p.id)?.kills || 0,
    matchesCount: statsMap.get(p.id)?.matches || 0,
  }));
}






