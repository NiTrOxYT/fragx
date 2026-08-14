import { cache } from "react";
import { prisma } from "@/lib/db";
import { cryptoNative } from "@/lib/auth-crypto";

export type PlayerRole = "PLAYER" | "MODERATOR" | "ADMIN";

export interface PlayerRecord {
  id: string;
  name: string;
  avatarUrl: string;
  role: PlayerRole;
  isActive: boolean;
}

export const getAllPlayers = cache(async (): Promise<PlayerRecord[]> => {
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
});

export const getPlayerById = cache(async (id: string) => {

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
    recentMatches: combinedMatches.slice(0, 10),
  };
});



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





