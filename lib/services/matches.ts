import { prisma } from "@/lib/db";

export async function getMatchById(id: string) {
  return await prisma.match.findUnique({
    where: { id },
    include: {
      player: true,
      session: true,
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
    include: {
      player: true,
      session: true,
    },
    orderBy: [
      { session: { date: "desc" } },
      { matchNumber: "asc" },
    ],
  });

  // Group by session date string (e.g., "AUG 13, 2026")
  const groupsMap = new Map<string, typeof matches>();

  for (const match of matches) {
    const dateObj = new Date(match.session.date);
    const dateStr = dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }).toUpperCase();

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
  // Check for duplicate match number in the same session
  const existing = await prisma.match.findUnique({
    where: {
      sessionId_matchNumber: {
        sessionId: data.sessionId,
        matchNumber: data.matchNumber,
      },
    },
  });

  if (existing) {
    throw new Error(`Match #${data.matchNumber} already exists in this session.`);
  }

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
    include: {
      player: true,
      session: true,
    },
  });
}

export async function deleteMatch(id: string) {
  return await prisma.match.delete({
    where: { id },
  });
}
