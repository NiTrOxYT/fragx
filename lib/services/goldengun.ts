import { prisma } from "@/lib/db";
import { formatSessionDate } from "@/lib/utils/dates";

export interface GoldenGunCandidate {
  id: string;
  name: string;
  avatarUrl: string;
  totalKills: number;
}

export interface SessionGoldenGunDetails {
  sessionId: string;
  sessionDate: string;
  sessionStatus: "DRAFT" | "PUBLISHED";
  winner: GoldenGunCandidate | null;
  isManual: boolean;
  isTie: boolean;
  tiedPlayers: GoldenGunCandidate[];
  candidates: GoldenGunCandidate[];
  totalKills: number;
}

/**
 * Calculates session total kills per player and inspects any explicit GoldenGunAward record.
 */
export async function getSessionGoldenGunDetails(
  sessionId?: string
): Promise<SessionGoldenGunDetails | null> {
  // 1. Resolve target session
  let session: any = null;
  const sessionSelect = {
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
        playerId: true,
        player: {
          select: { id: true, name: true, avatarUrl: true },
        },
        matchTeams: {
          select: {
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
    },
  };

  if (sessionId) {
    session = await (prisma.gamingSession as any).findUnique({
      where: { id: sessionId },
      select: sessionSelect,
    });
  } else {
    // Default to latest published session, or latest session overall
    session = await (prisma.gamingSession as any).findFirst({
      where: { status: "PUBLISHED" },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      select: sessionSelect,
    });

    if (!session) {
      session = await (prisma.gamingSession as any).findFirst({
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
        select: sessionSelect,
      });
    }
  }

  if (!session) return null;


  // 2. Aggregate session total kills per participating player
  const playerMap = new Map<string, GoldenGunCandidate>();

  for (const match of session.matches || []) {
    if (match.matchTeams && match.matchTeams.length > 0) {
      for (const mt of match.matchTeams) {
        for (const mp of mt.players || []) {
          const pId = mp.player?.id || mp.playerId;
          if (!pId) continue;
          const existing = playerMap.get(pId) || {
            id: pId,
            name: mp.player?.name || "Player",
            avatarUrl: mp.player?.avatarUrl || "",
            totalKills: 0,
          };
          existing.totalKills += mp.kills || 0;
          playerMap.set(pId, existing);
        }
      }
    } else if (match.playerId && match.player) {
      const pId = match.playerId;
      const existing = playerMap.get(pId) || {
        id: pId,
        name: match.player.name,
        avatarUrl: match.player.avatarUrl,
        totalKills: 0,
      };
      existing.totalKills += match.kills || 0;
      playerMap.set(pId, existing);
    }
  }

  const candidates = Array.from(playerMap.values()).sort(
    (a, b) => b.totalKills - a.totalKills || a.name.localeCompare(b.name)
  );

  // 3. Inspect explicit GoldenGunAward record in DB
  const manualAward = session.goldenGunAward;

  if (manualAward && manualAward.player) {
    const candidateKills = playerMap.get(manualAward.playerId)?.totalKills || 0;
    const winner: GoldenGunCandidate = {
      id: manualAward.player.id,
      name: manualAward.player.name,
      avatarUrl: manualAward.player.avatarUrl || "",
      totalKills: candidateKills,
    };

    return {
      sessionId: session.id,
      sessionDate: formatSessionDate(session.date),
      sessionStatus: session.status,
      winner,
      isManual: true,
      isTie: false,
      tiedPlayers: [],
      candidates,
      totalKills: winner.totalKills,
    };
  }

  // 4. If no explicit award assigned, calculate from session matches
  if (candidates.length === 0) {
    return {
      sessionId: session.id,
      sessionDate: formatSessionDate(session.date),
      sessionStatus: session.status,
      winner: null,
      isManual: false,
      isTie: false,
      tiedPlayers: [],
      candidates: [],
      totalKills: 0,
    };
  }

  const maxKills = candidates[0].totalKills;
  if (maxKills === 0) {
    return {
      sessionId: session.id,
      sessionDate: formatSessionDate(session.date),
      sessionStatus: session.status,
      winner: null,
      isManual: false,
      isTie: false,
      tiedPlayers: [],
      candidates,
      totalKills: 0,
    };
  }

  const topFraggers = candidates.filter((c) => c.totalKills === maxKills);

  if (topFraggers.length > 1) {
    // Tie detected: admin selection required
    return {
      sessionId: session.id,
      sessionDate: formatSessionDate(session.date),
      sessionStatus: session.status,
      winner: null,
      isManual: false,
      isTie: true,
      tiedPlayers: topFraggers,
      candidates,
      totalKills: maxKills,
    };
  }

  // Single clear top fragger
  return {
    sessionId: session.id,
    sessionDate: formatSessionDate(session.date),
    sessionStatus: session.status,
    winner: topFraggers[0],
    isManual: false,
    isTie: false,
    tiedPlayers: [],
    candidates,
    totalKills: topFraggers[0].totalKills,
  };
}

/**
 * Assigns or replaces the Golden Gun award for a session.
 */
export async function assignGoldenGunAward(sessionId: string, playerId: string) {
  // Validate session and player existence
  const [session, player] = await Promise.all([
    (prisma.gamingSession as any).findUnique({
      where: { id: sessionId },
      select: { id: true, date: true },
    }),
    (prisma.player as any).findUnique({
      where: { id: playerId },
      select: { id: true, name: true },
    }),
  ]);

  if (!session) {
    throw new Error("Gaming session not found");
  }
  if (!player) {
    throw new Error("Player not found");
  }

  // Upsert GoldenGunAward for this session (enforces 1 per session)
  const award = await (prisma as any).goldenGunAward.upsert({
    where: { sessionId },
    update: { playerId },
    create: { sessionId, playerId },
    include: {
      player: {
        select: { id: true, name: true, avatarUrl: true },
      },
    },
  });

  return award;
}

/**
 * Removes Golden Gun award for a session.
 */
export async function removeGoldenGunAward(sessionId: string) {
  const existing = await (prisma as any).goldenGunAward.findUnique({
    where: { sessionId },
    select: { id: true },
  });

  if (existing) {
    await (prisma as any).goldenGunAward.delete({
      where: { sessionId },
    });
  }

  return { success: true };
}

/**
 * Returns all sessions for admin Golden Gun management.
 */
export async function getAdminGoldenGunSessions() {
  const sessions = await (prisma.gamingSession as any).findMany({
    orderBy: { date: "desc" },
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
    },
  });

  return sessions.map((s: any) => ({
    id: s.id,
    dateStr: formatSessionDate(s.date),
    status: s.status,
    hasAward: !!s.goldenGunAward,
    winnerName: s.goldenGunAward?.player?.name || null,
  }));
}
