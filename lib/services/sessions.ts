import { prisma } from "@/lib/db";

export async function getSessionById(id: string) {
  return await prisma.gamingSession.findUnique({
    where: { id },
    select: {
      id: true,
      date: true,
      status: true,
      publishedAt: true,
      matches: {
        select: {
          id: true,
          matchNumber: true,
          kills: true,
          placement: true,
          screenshotUrl: true,
          duration: true,
          player: {
            select: { id: true, name: true, avatarUrl: true },
          },
        },
        orderBy: { matchNumber: "asc" },
      },
    },
  });
}

export async function getAllSessions() {
  return await prisma.gamingSession.findMany({
    orderBy: { date: "desc" },
    select: {
      id: true,
      date: true,
      status: true,
      publishedAt: true,
      _count: {
        select: { matches: true },
      },
    },
  });
}

export async function createSession(date?: Date) {
  return await prisma.gamingSession.create({
    data: {
      date: date || new Date(),
      status: "DRAFT",
    },
    select: {
      id: true,
      date: true,
      status: true,
    },
  });
}

export async function getOrCreateActiveDraftSession() {
  const existingDraft = await prisma.gamingSession.findFirst({
    where: { status: "DRAFT" },
    orderBy: { createdAt: "desc" },
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
          player: {
            select: { id: true, name: true, avatarUrl: true },
          },
        },
        orderBy: { matchNumber: "asc" },
      },
    },
  });

  if (existingDraft) {
    return existingDraft;
  }

  return await prisma.gamingSession.create({
    data: {
      date: new Date(),
      status: "DRAFT",
    },
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
          player: {
            select: { id: true, name: true, avatarUrl: true },
          },
        },
        orderBy: { matchNumber: "asc" },
      },
    },
  });
}

export async function publishSession(id: string) {
  const session = await prisma.gamingSession.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      _count: {
        select: { matches: true },
      },
    },
  });

  if (!session) {
    throw new Error("Session not found");
  }

  if (session._count.matches === 0) {
    throw new Error("Cannot publish an empty session without matches.");
  }

  return await prisma.gamingSession.update({
    where: { id },
    data: {
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
    select: {
      id: true,
      date: true,
      status: true,
      publishedAt: true,
    },
  });
}

