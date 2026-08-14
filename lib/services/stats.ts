import { cache } from "react";
import { prisma } from "@/lib/db";

export interface MVPResult {
  players: {
    id: string;
    name: string;
    avatarUrl: string;
    totalKills: number;
    bestPlacement: number;
  }[];
  peakKills: number;
}

export interface GoldenGunAwardResult {
  winners: {
    id: string;
    name: string;
    avatarUrl: string;
  }[];
  totalKills: number;
}

export const getLatestPublishedSession = cache(async () => {
  const sessionWithMatches = await (prisma.gamingSession as any).findFirst({
    where: {
      status: "PUBLISHED",
      matches: {
        some: {},
      },
    },

    orderBy: [
      { date: "desc" },
      { publishedAt: "desc" },
      { createdAt: "desc" },
    ],

    select: {
      id: true,
      date: true,
      status: true,
      matches: {
        select: {
          id: true,
          matchNumber: true,
          kills: true,
          placement: true,
          playerId: true,
          player: {
            select: { id: true, name: true, avatarUrl: true },
          },
          matchTeams: {
            select: {
              id: true,
              placement: true,
              team: {
                select: { id: true, name: true },
              },
              players: {
                select: {
                  kills: true,
                  player: {
                    select: { id: true, name: true, avatarUrl: true },
                  },
                },
              },
            },
          },
        },
        orderBy: { matchNumber: "asc" },
      },
    },
  });

  if (sessionWithMatches) {
    return sessionWithMatches;
  }

  return await (prisma.gamingSession as any).findFirst({
    where: { status: "PUBLISHED" },
    orderBy: [
      { date: "desc" },
      { publishedAt: "desc" },
      { createdAt: "desc" },
    ],

    select: {
      id: true,
      date: true,
      status: true,
      matches: {
        select: {
          id: true,
          matchNumber: true,
          kills: true,
          placement: true,
          playerId: true,
          player: {
            select: { id: true, name: true, avatarUrl: true },
          },
          matchTeams: {
            select: {
              id: true,
              placement: true,
              team: {
                select: { id: true, name: true },
              },
              players: {
                select: {
                  kills: true,
                  player: {
                    select: { id: true, name: true, avatarUrl: true },
                  },
                },
              },
            },
          },
        },
        orderBy: { matchNumber: "asc" },
      },
    },
  });
});


/**
 * Calculates Golden Gun Award: Highest CUMULATIVE TOTAL KILLS across the ENTIRE Gaming Session.
 * Handles ties by returning all players who achieved that max total session kills.
 */
export const getGoldenGunAward = cache(async (sessionId?: string): Promise<GoldenGunAwardResult | null> => {

  let session;
  if (sessionId) {
    session = await (prisma.gamingSession as any).findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        matches: {
          select: {
            id: true,
            matchNumber: true,
            kills: true,
            playerId: true,
            player: {
              select: { id: true, name: true, avatarUrl: true },
            },
            matchTeams: {
              select: {
                players: {
                  select: {
                    kills: true,
                    player: {
                      select: { id: true, name: true, avatarUrl: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  } else {
    session = await getLatestPublishedSession();
  }

  if (!session || session.matches.length === 0) {
    return null;
  }

  // Aggregate total kills across all matches in the session per player
  const playerKillsMap = new Map<
    string,
    { id: string; name: string; avatarUrl: string; totalKills: number }
  >();

  for (const match of session.matches) {
    if (match.matchTeams && match.matchTeams.length > 0) {
      for (const mt of match.matchTeams) {
        for (const mp of mt.players) {
          const pId = mp.player.id;
          const existing = playerKillsMap.get(pId) || {
            id: pId,
            name: mp.player.name,
            avatarUrl: mp.player.avatarUrl,
            totalKills: 0,
          };
          existing.totalKills += mp.kills;
          playerKillsMap.set(pId, existing);
        }
      }
    } else if (match.playerId && match.player) {
      const pId = match.playerId;
      const existing = playerKillsMap.get(pId) || {
        id: pId,
        name: match.player.name,
        avatarUrl: match.player.avatarUrl,
        totalKills: 0,
      };
      existing.totalKills += match.kills || 0;
      playerKillsMap.set(pId, existing);
    }
  }

  const allPlayers = Array.from(playerKillsMap.values());
  if (allPlayers.length === 0) {
    return { winners: [], totalKills: 0 };
  }

  let maxTotalKills = 0;
  for (const p of allPlayers) {
    if (p.totalKills > maxTotalKills) {
      maxTotalKills = p.totalKills;
    }
  }

  if (maxTotalKills === 0) {
    return { winners: [], totalKills: 0 };
  }

  const winners = allPlayers.filter((p) => p.totalKills === maxTotalKills);

  return {
    winners: winners.map((w) => ({
      id: w.id,
      name: w.name,
      avatarUrl: w.avatarUrl,
    })),
    totalKills: maxTotalKills,
  };
});


export const getMVP = cache(async (sessionId?: string): Promise<MVPResult | null> => {

  let session;
  if (sessionId) {
    session = await (prisma.gamingSession as any).findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        matches: {
          select: {
            id: true,
            kills: true,
            placement: true,
            playerId: true,
            player: {
              select: { id: true, name: true, avatarUrl: true },
            },
            matchTeams: {
              select: {
                id: true,
                placement: true,
                team: {
                  select: { id: true, name: true },
                },
                players: {
                  select: {
                    kills: true,
                    player: {
                      select: { id: true, name: true, avatarUrl: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  } else {
    session = await getLatestPublishedSession();
  }

  if (!session || session.matches.length === 0) {
    return null;
  }

  // Aggregate total session stats per player for MVP (total kills + placement tie-breaker)
  const playerStatsMap = new Map<
    string,
    {
      id: string;
      name: string;
      avatarUrl: string;
      totalKills: number;
      bestPlacement: number;
    }
  >();

  let maxSingleMatchKills = 0;

  for (const match of session.matches) {
    if (match.matchTeams && match.matchTeams.length > 0) {
      // Multi-team match structure
      for (const mt of match.matchTeams) {
        for (const mp of mt.players) {
          const pId = mp.player.id;
          const existing = playerStatsMap.get(pId) || {
            id: pId,
            name: mp.player.name,
            avatarUrl: mp.player.avatarUrl,
            totalKills: 0,
            bestPlacement: 999,
          };

          existing.totalKills += mp.kills;
          if (mt.placement < existing.bestPlacement) {
            existing.bestPlacement = mt.placement;
          }

          playerStatsMap.set(pId, existing);

          if (mp.kills > maxSingleMatchKills) {
            maxSingleMatchKills = mp.kills;
          }
        }
      }
    } else if (match.playerId && match.player) {
      // Legacy single-player match structure
      const pId = match.playerId;
      const existing = playerStatsMap.get(pId) || {
        id: pId,
        name: match.player.name,
        avatarUrl: match.player.avatarUrl,
        totalKills: 0,
        bestPlacement: 999,
      };

      existing.totalKills += match.kills || 0;
      if ((match.placement || 999) < existing.bestPlacement) {
        existing.bestPlacement = match.placement;
      }

      playerStatsMap.set(pId, existing);

      if ((match.kills || 0) > maxSingleMatchKills) {
        maxSingleMatchKills = match.kills;
      }
    }
  }

  const aggregated = Array.from(playerStatsMap.values());
  if (aggregated.length === 0) return null;

  // Sort by totalKills desc, bestPlacement asc
  aggregated.sort((a, b) => {
    if (b.totalKills !== a.totalKills) {
      return b.totalKills - a.totalKills;
    }
    return a.bestPlacement - b.bestPlacement;
  });

  const topPlayer = aggregated[0];
  const mvps = aggregated.filter(
    (p) =>
      p.totalKills === topPlayer.totalKills &&
      p.bestPlacement === topPlayer.bestPlacement
  );

  return {
    players: mvps.map((p) => ({
      id: p.id,
      name: p.name,
      avatarUrl: p.avatarUrl,
      totalKills: p.totalKills,
      bestPlacement: p.bestPlacement,
    })),
    peakKills: maxSingleMatchKills,
  };
});


export const getSessionSummary = cache(async (sessionId?: string) => {

  let session;
  if (sessionId) {
    session = await (prisma.gamingSession as any).findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        matches: {
          select: {
            kills: true,
            placement: true,
            matchTeams: {
              select: {
                placement: true,
                players: {
                  select: { kills: true },
                },
              },
            },
          },
        },
      },
    });
  } else {
    session = await getLatestPublishedSession();
  }

  if (!session || session.matches.length === 0) {
    return {
      matchCount: 0,
      totalKills: 0,
      winRate: 0,
    };
  }

  const matchCount = session.matches.length;
  let totalKills = 0;
  let wins = 0;

  for (const match of session.matches) {
    if (match.matchTeams && match.matchTeams.length > 0) {
      for (const mt of match.matchTeams) {
        if (mt.placement === 1) wins += 1;
        for (const mp of mt.players) {
          totalKills += mp.kills;
        }
      }
    } else {
      totalKills += match.kills || 0;
      if (match.placement === 1) wins += 1;
    }
  }

  const winRate = matchCount > 0 ? Math.round((wins / matchCount) * 100) : 0;

  return {
    matchCount,
    totalKills,
    winRate,
  };
});


export const getRecentMatches = cache(async (sessionId?: string, limit = 10) => {
  let targetSessionId = sessionId;
  if (!targetSessionId) {
    const latest = await getLatestPublishedSession();
    if (!latest) return [];
    targetSessionId = latest.id;
  }

  const matches = await (prisma.match as any).findMany({
    where: {
      sessionId: targetSessionId,
      session: {
        status: "PUBLISHED",
      },
    },
    orderBy: [{ matchNumber: "desc" }, { createdAt: "desc" }],
    take: limit,

    select: {
      id: true,
      matchNumber: true,
      kills: true,
      placement: true,
      screenshotUrl: true,
      createdAt: true,
      player: {
        select: { id: true, name: true, avatarUrl: true },
      },
      session: {
        select: { id: true, date: true },
      },
      matchTeams: {
        select: {
          id: true,
          placement: true,
          team: {
            select: { id: true, name: true },
          },
          players: {
            select: {
              kills: true,
              player: {
                select: { id: true, name: true, avatarUrl: true },
              },
            },
            orderBy: { kills: "desc" },
          },
        },
        orderBy: { placement: "asc" },
      },
    },
  });

  return matches;
});


export const getLeaderboard = cache(async (filter: "ALL TIME" | "THIS MONTH" | "THIS WEEK" = "ALL TIME") => {

  const now = new Date();
  let startDate: Date | undefined;

  if (filter === "THIS MONTH") {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (filter === "THIS WEEK") {
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    startDate = new Date(now.setDate(diff));
    startDate.setHours(0, 0, 0, 0);
  }

  const matchesPromise = (prisma.match as any).findMany({
    where: {
      session: {
        status: "PUBLISHED",
        ...(startDate ? { date: { gte: startDate } } : {}),
      },
    },
    select: {
      id: true,
      playerId: true,
      kills: true,
      placement: true,
      player: {
        select: { id: true, name: true, avatarUrl: true },
      },
      matchTeams: {
        select: {
          placement: true,
          players: {
            select: {
              playerId: true,
              kills: true,
              player: {
                select: { id: true, name: true, avatarUrl: true },
              },
            },
          },
        },
      },
    },
  });

  const allPlayersPromise =
    filter === "ALL TIME"
      ? (prisma.player as any).findMany({
          select: { id: true, name: true, avatarUrl: true },
        })
      : Promise.resolve([]);

  const [matches, allPlayers] = await Promise.all([matchesPromise, allPlayersPromise]);

  const playerMap = new Map<
    string,
    {
      id: string;
      name: string;
      avatarUrl: string;
      matchesCount: number;
      totalKills: number;
      wins: number;
    }
  >();

  for (const match of matches) {
    if (match.matchTeams && match.matchTeams.length > 0) {
      // Multi-team match
      for (const mt of match.matchTeams) {
        for (const mp of mt.players) {
          const pId = mp.playerId;
          const existing = playerMap.get(pId) || {
            id: pId,
            name: mp.player.name,
            avatarUrl: mp.player.avatarUrl,
            matchesCount: 0,
            totalKills: 0,
            wins: 0,
          };

          existing.matchesCount += 1;
          existing.totalKills += mp.kills;
          if (mt.placement === 1) {
            existing.wins += 1;
          }

          playerMap.set(pId, existing);
        }
      }
    } else if (match.playerId && match.player) {
      // Legacy single-player match
      const pId = match.playerId;
      const existing = playerMap.get(pId) || {
        id: pId,
        name: match.player.name,
        avatarUrl: match.player.avatarUrl,
        matchesCount: 0,
        totalKills: 0,
        wins: 0,
      };

      existing.matchesCount += 1;
      existing.totalKills += match.kills || 0;
      if (match.placement === 1) {
        existing.wins += 1;
      }

      playerMap.set(pId, existing);
    }
  }

  // Also include players with 0 matches if filter is ALL TIME
  if (filter === "ALL TIME") {
    for (const p of allPlayers) {
      if (!playerMap.has(p.id)) {
        playerMap.set(p.id, {
          id: p.id,
          name: p.name,
          avatarUrl: p.avatarUrl,
          matchesCount: 0,
          totalKills: 0,
          wins: 0,
        });
      }
    }
  }

  const leaderboard = Array.from(playerMap.values()).map((p) => {
    const kd = p.matchesCount > 0 ? Number((p.totalKills / p.matchesCount).toFixed(1)) : 0;
    return {
      ...p,
      kd,
    };
  });

  // Sort by K/D desc, then totalKills desc, then matchesCount desc
  leaderboard.sort((a, b) => {
    if (b.kd !== a.kd) return b.kd - a.kd;
    if (b.totalKills !== a.totalKills) return b.totalKills - a.totalKills;
    return b.matchesCount - a.matchesCount;
  });

  return leaderboard.map((item, index) => ({
    rank: index + 1,
    ...item,
  }));
});

