import { prisma } from "@/lib/db";
import { formatSessionDate } from "@/lib/utils/dates";

export async function getMatchById(id: string) {
  return await prisma.match.findUnique({
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
    },
  });
}

export async function getGroupedMatchHistory() {
  const matches = await prisma.match.findMany({
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
    },
    orderBy: [
      { session: { date: "desc" } },
      { matchNumber: "asc" },
    ],
  });

  // Group by session date string (e.g., "AUG 13, 2026")
  const groupsMap = new Map<string, typeof matches>();

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

export async function deleteMatch(id: string) {
  return await prisma.match.delete({
    where: { id },
  });
}

