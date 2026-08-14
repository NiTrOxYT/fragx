import { prisma } from "@/lib/db";
import { formatSessionDate } from "@/lib/utils/dates";
import { getOrCreateSessionForDate } from "@/lib/services/sessions";

export interface CreateMultiTeamMatchInput {
  sessionDate: string; // YYYY-MM-DD
  matchNumber: number;
  screenshotUrl: string;
  duration?: string;
  teams: {
    teamId: string;
    placement: number;
    players: {
      playerId: string;
      kills: number;
    }[];
  }[];
}

export async function getMatchById(id: string) {
  const match = await (prisma.match as any).findUnique({
    where: { id },
    select: {
      id: true,
      matchNumber: true,
      placement: true,
      kills: true,
      screenshotUrl: true,
      duration: true,
      createdAt: true,
      player: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
      session: {
        select: {
          id: true,
          date: true,
          status: true,
        },
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
              id: true,
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

  return match;
}

export async function getGroupedMatchHistory() {
  const matches = await (prisma.match as any).findMany({
    where: {
      session: {
        status: "PUBLISHED",
      },
    },
    select: {
      id: true,
      matchNumber: true,
      placement: true,
      kills: true,
      duration: true,
      createdAt: true,
      player: {
        select: {
          id: true,
          name: true,
        },
      },
      session: {
        select: {
          date: true,
        },
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
              id: true,
              kills: true,
              player: {
                select: { id: true, name: true },
              },
            },
            orderBy: { kills: "desc" },
          },
        },
        orderBy: { placement: "asc" },
      },
    },
    orderBy: [
      { session: { date: "desc" } },
      { matchNumber: "asc" },
    ],
  });

  // Group by session date string (e.g., "AUG 14, 2026")
  const groupsMap = new Map<string, any[]>();

  for (const match of matches) {
    const dateStr = formatSessionDate(match.session.date);

    const existing = groupsMap.get(dateStr) || [];
    existing.push(match);
    groupsMap.set(dateStr, existing);
  }

  const result = Array.from(groupsMap.entries()).map(([date, matchesList]) => ({
    date,
    matches: matchesList,
  }));

  return result;
}

/**
 * Creates a multi-team match atomically using a Prisma Transaction.
 */
export async function createMultiTeamMatch(input: CreateMultiTeamMatchInput) {
  const { sessionDate, matchNumber, screenshotUrl, duration, teams } = input;

  // 1. Get or create session for sessionDate
  const session = await getOrCreateSessionForDate(sessionDate);

  // 2. Perform atomic transaction
  return await prisma.$transaction(async (tx) => {
    // Check if matchNumber already exists for this session
    const existingMatch = await tx.match.findUnique({
      where: {
        sessionId_matchNumber: {
          sessionId: session.id,
          matchNumber,
        },
      },
    });

    if (existingMatch) {
      throw new Error(`Match #${matchNumber} already exists for session date ${formatSessionDate(session.date)}.`);
    }

    // Create Match record
    const match = await tx.match.create({
      data: {
        sessionId: session.id,
        matchNumber,
        screenshotUrl,
        duration: duration || "20:00 MIN",
      },
      select: { id: true, matchNumber: true, sessionId: true },
    });

    // Create MatchTeam & MatchPlayer records
    for (const t of teams) {
      const matchTeam = await tx.matchTeam.create({
        data: {
          matchId: match.id,
          teamId: t.teamId,
          placement: t.placement,
        },
        select: { id: true },
      });

      for (const p of t.players) {
        await tx.matchPlayer.create({
          data: {
            matchTeamId: matchTeam.id,
            playerId: p.playerId,
            kills: p.kills,
          },
        });
      }
    }

    return match;
  });
}

// Legacy single-player match creation support
export async function createMatch(data: {
  sessionId: string;
  matchNumber: number;
  playerId: string;
  kills: number;
  placement: number;
  screenshotUrl: string;
  duration?: string;
}) {
  try {
    return await prisma.match.create({
      data: {
        sessionId: data.sessionId,
        matchNumber: data.matchNumber,
        playerId: data.playerId,
        kills: data.kills,
        placement: data.placement,
        screenshotUrl: data.screenshotUrl,
        duration: data.duration || "20:00 MIN",
      },
      select: {
        id: true,
        matchNumber: true,
        playerId: true,
        kills: true,
        placement: true,
        screenshotUrl: true,
        duration: true,
        player: {
          select: { id: true, name: true, avatarUrl: true },
        },
        session: {
          select: { id: true, date: true, status: true },
        },
      },
    });
  } catch (err: any) {
    if (err?.code === "P2002") {
      throw new Error(`Match #${data.matchNumber} already exists in this session.`);
    }
    throw err;
  }
}

export interface AdminMatchItem {
  id: string;
  matchNumber: number;
  dateStr: string;
  sessionStatus: "DRAFT" | "PUBLISHED";
  sessionId: string;
  totalKills: number;
  topTeamName: string;
  topPlacement: number;
}

export async function getAllAdminMatches(): Promise<AdminMatchItem[]> {
  const matches = await (prisma.match as any).findMany({
    orderBy: [
      { createdAt: "desc" },
    ],
    select: {
      id: true,
      matchNumber: true,
      kills: true,
      placement: true,
      createdAt: true,
      player: {
        select: { id: true, name: true },
      },
      session: {
        select: { id: true, date: true, status: true },
      },
      matchTeams: {
        select: {
          id: true,
          placement: true,
          team: {
            select: { id: true, name: true },
          },
          players: {
            select: { kills: true },
          },
        },
        orderBy: { placement: "asc" },
      },
    },
  });

  return matches.map((m: any) => {
    const isMultiTeam = m.matchTeams && m.matchTeams.length > 0;
    const topTeam = isMultiTeam ? m.matchTeams[0] : null;
    const totalKills = isMultiTeam
      ? m.matchTeams.reduce(
          (acc: number, mt: any) =>
            acc + mt.players.reduce((pAcc: number, p: any) => pAcc + p.kills, 0),
          0
        )
      : m.kills || 0;
    const topPlacement = isMultiTeam ? topTeam?.placement || 1 : m.placement || 1;
    const topTeamName = isMultiTeam ? topTeam?.team.name || "Squad" : m.player?.name || "Player";
    const dateStr = formatSessionDate(m.session.date);

    return {
      id: m.id,
      matchNumber: m.matchNumber,
      dateStr,
      sessionStatus: m.session.status,
      sessionId: m.session.id,
      totalKills,
      topTeamName,
      topPlacement,
    };
  });
}

export async function deleteMatch(id: string) {
  return await prisma.$transaction(async (tx) => {
    // 1. Delete dependent MatchPlayer records
    await (tx as any).matchPlayer.deleteMany({
      where: {
        matchTeam: {
          matchId: id,
        },
      },
    });

    // 2. Delete dependent MatchTeam records
    await (tx as any).matchTeam.deleteMany({
      where: { matchId: id },
    });

    // 3. Delete Match record
    const deletedMatch = await tx.match.delete({
      where: { id },
    });

    return deletedMatch;
  });
}

