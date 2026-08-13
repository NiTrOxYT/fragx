import { prisma } from "@/lib/db";

export async function getSessionById(id: string) {
  return await prisma.gamingSession.findUnique({
    where: { id },
    include: {
      matches: {
        include: {
          player: true,
        },
        orderBy: { matchNumber: "asc" },
      },
    },
  });
}

export async function getAllSessions() {
  return await prisma.gamingSession.findMany({
    orderBy: { date: "desc" },
    include: {
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
  });
}

export async function getOrCreateActiveDraftSession() {
  const existingDraft = await prisma.gamingSession.findFirst({
    where: { status: "DRAFT" },
    orderBy: { createdAt: "desc" },
    include: {
      matches: {
        include: { player: true },
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
    include: {
      matches: {
        include: { player: true },
        orderBy: { matchNumber: "asc" },
      },
    },
  });
}

export async function publishSession(id: string) {
  return await prisma.$transaction(async (tx) => {
    const session = await tx.gamingSession.findUnique({
      where: { id },
      include: { matches: true },
    });

    if (!session) {
      throw new Error("Session not found");
    }

    if (session.matches.length === 0) {
      throw new Error("Cannot publish an empty session without matches.");
    }

    const updated = await tx.gamingSession.update({
      where: { id },
      data: {
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
      include: {
        matches: {
          include: { player: true },
        },
      },
    });

    return updated;
  });
}
