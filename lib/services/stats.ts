import { cache } from "react";
import { unstable_cache } from "next/cache";
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
  isManual?: boolean;
  isTie?: boolean;
}

/**
 * Pure in-memory calculation of MVP from an already-loaded session object.
 */
export function extractMVPFromSession(session: any): MVPResult | null {
  if (!session || !session.matches || session.matches.length === 0) {
    return null;
  }

  const playerKillsMap = new Map<
    string,
    { id: string; name: string; avatarUrl: string; totalKills: number; bestPlacement: number }
  >();

  let maxSingleMatchKills = 0;

  for (const match of session.matches) {
    if (match.matchTeams && match.matchTeams.length > 0) {
      for (const mt of match.matchTeams) {
        for (const mp of mt.players || []) {
          const pId = mp.player?.id || mp.playerId;
          if (!pId) continue;
          const kills = mp.kills || 0;
          if (kills > maxSingleMatchKills) {
            maxSingleMatchKills = kills;
          }
          const existing = playerKillsMap.get(pId) || {
            id: pId,
            name: mp.player?.name || "Player",
            avatarUrl: mp.player?.avatarUrl || "",
            totalKills: 0,
            bestPlacement: 999,
          };
          existing.totalKills += kills;
          if (mt.placement < existing.bestPlacement) {
            existing.bestPlacement = mt.placement;
          }
          playerKillsMap.set(pId, existing);
        }
      }
    } else if (match.playerId && match.player) {
      const pId = match.playerId;
      const kills = match.kills || 0;
      if (kills > maxSingleMatchKills) {
        maxSingleMatchKills = kills;
      }
      const existing = playerKillsMap.get(pId) || {
        id: pId,
        name: match.player.name,
        avatarUrl: match.player.avatarUrl,
        totalKills: 0,
        bestPlacement: 999,
      };
      existing.totalKills += kills;
      if ((match.placement || 999) < existing.bestPlacement) {
        existing.bestPlacement = match.placement || 999;
      }
      playerKillsMap.set(pId, existing);
    }
  }

  const allPlayers = Array.from(playerKillsMap.values());
  if (allPlayers.length === 0) {
    return null;
  }

  let maxTotalKills = 0;
  for (const p of allPlayers) {
    if (p.totalKills > maxTotalKills) {
      maxTotalKills = p.totalKills;
    }
  }

  if (maxTotalKills === 0) {
    return null;
  }

  const topKillers = allPlayers.filter((p) => p.totalKills === maxTotalKills);
  let bestPlacement = 999;
  for (const p of topKillers) {
    if (p.bestPlacement < bestPlacement) {
      bestPlacement = p.bestPlacement;
    }
  }

  const mvpWinners = topKillers.filter((p) => p.bestPlacement === bestPlacement);

  return {
    players: mvpWinners.map((p) => ({
      id: p.id,
      name: p.name,
      avatarUrl: p.avatarUrl,
      totalKills: p.totalKills,
      bestPlacement: p.bestPlacement,
    })),
    peakKills: maxSingleMatchKills,
  };
}

/**
 * Pure in-memory calculation of Golden Gun from an already-loaded session object.
 */
export function extractGoldenGunFromSession(session: any): GoldenGunAwardResult | null {
  if (!session) {
    return null;
  }

  const playerKillsMap = new Map<
    string,
    { id: string; name: string; avatarUrl: string; totalKills: number }
  >();

  for (const match of session.matches || []) {
    if (match.matchTeams && match.matchTeams.length > 0) {
      for (const mt of match.matchTeams) {
        for (const mp of mt.players || []) {
          const pId = mp.player?.id || mp.playerId;
          if (!pId) continue;
          const existing = playerKillsMap.get(pId) || {
            id: pId,
            name: mp.player?.name || "Player",
            avatarUrl: mp.player?.avatarUrl || "",
            totalKills: 0,
          };
          existing.totalKills += mp.kills || 0;
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

  // 1. If explicit manual GoldenGunAward record exists in DB
  if (session.goldenGunAward && session.goldenGunAward.player) {
    const p = session.goldenGunAward.player;
    const kills = playerKillsMap.get(session.goldenGunAward.playerId)?.totalKills || 0;
    return {
      winners: [
        {
          id: p.id,
          name: p.name,
          avatarUrl: p.avatarUrl || "",
        },
      ],
      totalKills: kills,
      isManual: true,
      isTie: false,
    };
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
  const isTie = winners.length > 1;

  return {
    winners: winners.map((w) => ({
      id: w.id,
      name: w.name,
      avatarUrl: w.avatarUrl,
    })),
    totalKills: maxTotalKills,
    isManual: false,
    isTie,
  };
}

/**
 * Pure in-memory calculation of Session Summary from an already-loaded session object.
 */
export function extractSessionSummaryFromSession(session: any) {
  if (!session || !session.matches || session.matches.length === 0) {
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
        for (const mp of mt.players || []) {
          totalKills += mp.kills || 0;
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
}

const getLatestPublishedSessionInternal = async () => {
  const sessionWithMatches = await (prisma as any).gamingSession.findFirst({
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
      goldenGunAward: {
        select: {
          id: true,
          playerId: true,
          player: {
            select: { id: true, name: true, avatarUrl: true },
          },
        },
      },
      matches: {
        select: {
          id: true,
          matchNumber: true,
          kills: true,
          placement: true,
          screenshotUrl: true,
          duration: true,
          playerId: true,
          player: {
            select: { id: true, name: true, avatarUrl: true },
          },
          matchTeams: {
            select: {
              id: true,
              placement: true,
              team: {
                select: { id: true, name: true, avatarUrl: true },
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

  return await (prisma as any).gamingSession.findFirst({
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
      goldenGunAward: {
        select: {
          id: true,
          playerId: true,
          player: {
            select: { id: true, name: true, avatarUrl: true },
          },
        },
      },
      matches: {
        select: {
          id: true,
          matchNumber: true,
          kills: true,
          placement: true,
          screenshotUrl: true,
          duration: true,
          playerId: true,
          player: {
            select: { id: true, name: true, avatarUrl: true },
          },
          matchTeams: {
            select: {
              id: true,
              placement: true,
              team: {
                select: { id: true, name: true, avatarUrl: true },
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
};

export const getLatestPublishedSession = unstable_cache(
  getLatestPublishedSessionInternal,
  ["latest-published-session"],
  { revalidate: 60, tags: ["stats", "sessions", "matches"] }
);

/**
 * Calculates Golden Gun Award: Highest CUMULATIVE TOTAL KILLS across the ENTIRE Gaming Session.
 */
export const getGoldenGunAward = cache(async (sessionId?: string): Promise<GoldenGunAwardResult | null> => {
  const latestSession = await getLatestPublishedSession();
  if (!sessionId || (latestSession && sessionId === latestSession.id)) {
    return extractGoldenGunFromSession(latestSession);
  }

  const session = await (prisma as any).gamingSession.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
      goldenGunAward: {
        select: {
          id: true,
          playerId: true,
          player: {
            select: { id: true, name: true, avatarUrl: true },
          },
        },
      },
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

  return extractGoldenGunFromSession(session);
});

export const getMVP = cache(async (sessionId?: string): Promise<MVPResult | null> => {
  const latestSession = await getLatestPublishedSession();
  if (!sessionId || (latestSession && sessionId === latestSession.id)) {
    return extractMVPFromSession(latestSession);
  }

  const session = await (prisma as any).gamingSession.findUnique({
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

  return extractMVPFromSession(session);
});

export const getSessionSummary = cache(async (sessionId?: string) => {
  const latestSession = await getLatestPublishedSession();
  if (!sessionId || (latestSession && sessionId === latestSession.id)) {
    return extractSessionSummaryFromSession(latestSession);
  }

  const session = await (prisma as any).gamingSession.findUnique({
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

  return extractSessionSummaryFromSession(session);
});

export const getRecentMatches = cache(async (sessionId?: string, limit = 10) => {
  const latestSession = await getLatestPublishedSession();
  if (!sessionId || (latestSession && sessionId === latestSession.id)) {
    if (!latestSession || !latestSession.matches) return [];
    const reversed = [...latestSession.matches].reverse();
    return reversed.slice(0, limit);
  }

  const matches = await (prisma as any).match.findMany({
    where: {
      sessionId,
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
      duration: true,
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
            select: { id: true, name: true, avatarUrl: true },
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



/**
 * Calculates cumulative Golden Gun awards won count for each player across ALL published sessions.
 */
const getGoldenGunCountsInternal = async (): Promise<{ [playerId: string]: number }> => {
  const publishedSessions = await (prisma as any).gamingSession.findMany({
    where: {
      status: "PUBLISHED",
      matches: {
        some: {},
      },
    },
    select: {
      id: true,
      goldenGunAward: {
        select: { playerId: true },
      },
      matches: {
        select: {
          id: true,
          kills: true,
          playerId: true,
          matchTeams: {
            select: {
              players: {
                select: {
                  playerId: true,
                  kills: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const goldenGunCounts: { [playerId: string]: number } = {};

  for (const session of publishedSessions) {
    // If an authoritative award is assigned for this session, use it directly
    if (session.goldenGunAward?.playerId) {
      const pId = session.goldenGunAward.playerId;
      goldenGunCounts[pId] = (goldenGunCounts[pId] || 0) + 1;
      continue;
    }

    if (!session.matches || session.matches.length === 0) continue;

    const sessionPlayerKills: { [playerId: string]: number } = {};

    for (const match of session.matches) {
      if (match.matchTeams && match.matchTeams.length > 0) {
        for (const mt of match.matchTeams) {
          for (const mp of mt.players || []) {
            sessionPlayerKills[mp.playerId] = (sessionPlayerKills[mp.playerId] || 0) + (mp.kills || 0);
          }
        }
      } else if (match.playerId) {
        sessionPlayerKills[match.playerId] =
          (sessionPlayerKills[match.playerId] || 0) + (match.kills || 0);
      }
    }

    let maxSessionKills = 0;
    for (const kills of Object.values(sessionPlayerKills)) {
      if (kills > maxSessionKills) {
        maxSessionKills = kills;
      }
    }

    if (maxSessionKills > 0) {
      const topFraggers = Object.entries(sessionPlayerKills).filter(
        ([_, kills]) => kills === maxSessionKills
      );
      if (topFraggers.length === 1) {
        const pId = topFraggers[0][0];
        goldenGunCounts[pId] = (goldenGunCounts[pId] || 0) + 1;
      }
    }
  }

  // Apply player manual adjustments
  const players = await (prisma as any).player.findMany({
    select: { id: true, goldenGunAdjustment: true },
  });

  for (const p of players) {
    const raw = goldenGunCounts[p.id] || 0;
    const adjusted = Math.max(0, raw + (p.goldenGunAdjustment || 0));
    goldenGunCounts[p.id] = adjusted;
  }

  return goldenGunCounts;
};

export const getGoldenGunCounts = unstable_cache(
  getGoldenGunCountsInternal,
  ["golden-gun-counts"],
  { revalidate: 60, tags: ["stats", "matches", "sessions", "golden-gun", "players"] }
);

const getLeaderboardInternal = async (filter: "ALL TIME" | "THIS MONTH" | "THIS WEEK" = "ALL TIME") => {
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

  const [allPlayers, goldenGunCounts, multiTeamMatchPlayers, legacyMatches] = await Promise.all([
    (prisma as any).player.findMany({
      select: { id: true, name: true, avatarUrl: true },
    }),
    getGoldenGunCounts(),
    (prisma as any).matchPlayer.findMany({
      where: {
        matchTeam: {
          match: {
            session: {
              status: "PUBLISHED",
              ...(startDate ? { date: { gte: startDate } } : {}),
            },
          },
        },
      },
      select: {
        playerId: true,
        kills: true,
        matchTeam: {
          select: { placement: true },
        },
      },
    }),
    (prisma as any).match.findMany({
      where: {
        playerId: { not: null },
        session: {
          status: "PUBLISHED",
          ...(startDate ? { date: { gte: startDate } } : {}),
        },
      },
      select: {
        playerId: true,
        kills: true,
        placement: true,
      },
    }),
  ]);

  const playerDict = new Map<string, { id: string; name: string; avatarUrl: string }>();
  for (const p of allPlayers) {
    playerDict.set(p.id, p);
  }

  const playerMap = new Map<
    string,
    {
      id: string;
      name: string;
      avatarUrl: string;
      matchesCount: number;
      totalKills: number;
      wins: number;
      goldenGunCount: number;
    }
  >();

  // Process multi-team match players
  for (const mp of multiTeamMatchPlayers) {
    const pId = mp.playerId;
    if (!pId) continue;

    const pMeta = playerDict.get(pId);
    const existing = playerMap.get(pId) || {
      id: pId,
      name: pMeta?.name || "Player",
      avatarUrl: pMeta?.avatarUrl || "",
      matchesCount: 0,
      totalKills: 0,
      wins: 0,
      goldenGunCount: goldenGunCounts[pId] || 0,
    };

    existing.matchesCount += 1;
    existing.totalKills += mp.kills || 0;
    if (mp.matchTeam?.placement === 1) {
      existing.wins += 1;
    }

    playerMap.set(pId, existing);
  }

  // Process legacy single-player matches
  for (const match of legacyMatches) {
    const pId = match.playerId;
    if (!pId) continue;

    const pMeta = playerDict.get(pId);
    const existing = playerMap.get(pId) || {
      id: pId,
      name: pMeta?.name || "Player",
      avatarUrl: pMeta?.avatarUrl || "",
      matchesCount: 0,
      totalKills: 0,
      wins: 0,
      goldenGunCount: goldenGunCounts[pId] || 0,
    };

    existing.matchesCount += 1;
    existing.totalKills += match.kills || 0;
    if (match.placement === 1) {
      existing.wins += 1;
    }

    playerMap.set(pId, existing);
  }

  // Ensure all registered players appear on the ALL TIME leaderboard
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
          goldenGunCount: goldenGunCounts[p.id] || 0,
        });
      }
    }
  }

  const leaderboard = Array.from(playerMap.values()).map((p) => {
    const kd = p.matchesCount > 0 ? Number((p.totalKills / p.matchesCount).toFixed(2)) : 0;
    return {
      ...p,
      kd,
      goldenGunCount: goldenGunCounts[p.id] || 0,
    };
  });

  leaderboard.sort((a, b) => {
    if (b.totalKills !== a.totalKills) return b.totalKills - a.totalKills;
    if (b.kd !== a.kd) return b.kd - a.kd;
    return b.matchesCount - a.matchesCount;
  });

  return leaderboard.map((item, index) => ({
    rank: index + 1,
    ...item,
  }));
};


export const getLeaderboard = (filter: "ALL TIME" | "THIS MONTH" | "THIS WEEK" = "ALL TIME") => {
  return unstable_cache(
    async () => getLeaderboardInternal(filter),
    [`leaderboard-${filter}`],
    { revalidate: 60, tags: ["stats", "leaderboard", "matches", "players"] }
  )();
};

export interface TeamScoreboardData {
  team1: {
    id: string;
    name: string;
    initial: string;
    avatarUrl?: string | null;
    sessionWins: number;
    tonightMatchesWon: number;
    totalKills: number;
  };
  team2: {
    id: string;
    name: string;
    initial: string;
    avatarUrl?: string | null;
    sessionWins: number;
    tonightMatchesWon: number;
    totalKills: number;
  };
  tonightMatchCount: number;
  totalTournamentMatches: number;
  seriesRemaining: number;
  matchesRemaining: number;
  totalSessionsPlayed: number;
  latestSessionDateStr: string;
}

const getScoreboardDataInternal = async (): Promise<TeamScoreboardData | null> => {
  // Fetch active teams
  const activeTeams = await (prisma as any).team.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    take: 2,
    select: { id: true, name: true, avatarUrl: true },
  });

  if (activeTeams.length < 2) {
    const allTeams = await (prisma as any).team.findMany({
      orderBy: { name: "asc" },
      take: 2,
      select: { id: true, name: true, avatarUrl: true },
    });

    if (allTeams.length < 2) {
      return null;
    }
    activeTeams.push(...allTeams.slice(activeTeams.length));
  }

  const team1Info = activeTeams[0];
  const team2Info = activeTeams[1];

  const publishedSessions = await (prisma as any).gamingSession.findMany({
    where: {
      status: "PUBLISHED",
      matches: {
        some: {},
      },
    },
    orderBy: [
      { date: "desc" },
      { publishedAt: "desc" },
    ],
    select: {
      id: true,
      date: true,
      matches: {
        select: {
          id: true,
          matchTeams: {
            select: {
              teamId: true,
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

  if (publishedSessions.length === 0) {
    return null;
  }

  const latestSession = publishedSessions[0];

  let team1SessionWins = 0;
  let team2SessionWins = 0;

  let team1TonightMatchWins = 0;
  let team2TonightMatchWins = 0;

  let team1TotalKills = 0;
  let team2TotalKills = 0;

  let totalTournamentMatches = 0;

  for (const session of publishedSessions) {
    let sessionTeam1Wins = 0;
    let sessionTeam2Wins = 0;

    for (const match of session.matches) {
      totalTournamentMatches += 1;

      for (const mt of match.matchTeams || []) {
        const killsInMatch = (mt.players || []).reduce(
          (acc: number, p: any) => acc + (p.kills || 0),
          0
        );

        if (mt.teamId === team1Info.id) {
          team1TotalKills += killsInMatch;
          if (mt.placement === 1) sessionTeam1Wins += 1;
        } else if (mt.teamId === team2Info.id) {
          team2TotalKills += killsInMatch;
          if (mt.placement === 1) sessionTeam2Wins += 1;
        }
      }
    }

    if (session.id === latestSession.id) {
      team1TonightMatchWins = sessionTeam1Wins;
      team2TonightMatchWins = sessionTeam2Wins;
    }

    if (sessionTeam1Wins > sessionTeam2Wins) {
      team1SessionWins += 1;
    } else if (sessionTeam2Wins > sessionTeam1Wins) {
      team2SessionWins += 1;
    }
  }

  const latestDateStr = latestSession.date
    ? new Date(latestSession.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  const totalNightsInSeries = 21;
  const seriesRemaining = Math.max(0, totalNightsInSeries - publishedSessions.length);

  return {
    team1: {
      id: team1Info.id,
      name: team1Info.name,
      initial: team1Info.name.charAt(0).toUpperCase(),
      avatarUrl: team1Info.avatarUrl || null,
      sessionWins: team1SessionWins,
      tonightMatchesWon: team1TonightMatchWins,
      totalKills: team1TotalKills,
    },
    team2: {
      id: team2Info.id,
      name: team2Info.name,
      initial: team2Info.name.charAt(0).toUpperCase(),
      avatarUrl: team2Info.avatarUrl || null,
      sessionWins: team2SessionWins,
      tonightMatchesWon: team2TonightMatchWins,
      totalKills: team2TotalKills,
    },
    tonightMatchCount: latestSession.matches.length,
    totalTournamentMatches,
    seriesRemaining,
    matchesRemaining: seriesRemaining,
    totalSessionsPlayed: publishedSessions.length,
    latestSessionDateStr: latestDateStr,
  };
};

export const getScoreboardData = unstable_cache(
  getScoreboardDataInternal,
  ["scoreboard-data"],
  { revalidate: 60, tags: ["stats", "scoreboard", "matches", "teams"] }
);







