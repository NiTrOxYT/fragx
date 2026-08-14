import { cache } from "react";
import { prisma } from "@/lib/db";

export interface TeamRecord {
  id: string;
  name: string;
  isActive: boolean;
  playerCount?: number;
  createdAt: Date;
}

export const getAllTeams = cache(async (): Promise<TeamRecord[]> => {
  const teams = await (prisma.team as any).findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      isActive: true,
      createdAt: true,
      _count: {
        select: { teams: true },
      },
    },
  });

  return teams.map((t: any) => ({
    id: t.id,
    name: t.name,
    isActive: t.isActive,
    playerCount: t._count?.teams || 0,
    createdAt: t.createdAt,
  }));
});

export const getActiveTeams = cache(async (): Promise<TeamRecord[]> => {

  return await (prisma.team as any).findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      isActive: true,
      createdAt: true,
    },
  });
});


export async function createTeam(name: string): Promise<TeamRecord> {
  const trimmedName = name.trim();
  if (!trimmedName || trimmedName.length < 2 || trimmedName.length > 40) {
    throw new Error("Team name must be between 2 and 40 characters.");
  }

  try {
    return await (prisma.team as any).create({
      data: {
        name: trimmedName,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        isActive: true,
        createdAt: true,
      },
    });
  } catch (err: any) {
    if (err?.code === "P2002") {
      throw new Error(`Team name "${trimmedName}" already exists.`);
    }
    throw err;
  }
}

export async function updateTeam(
  id: string,
  data: { name?: string; isActive?: boolean }
): Promise<TeamRecord> {
  const updateData: any = {};
  if (data.name !== undefined) {
    const trimmed = data.name.trim();
    if (!trimmed || trimmed.length < 2 || trimmed.length > 40) {
      throw new Error("Team name must be between 2 and 40 characters.");
    }
    updateData.name = trimmed;
  }
  if (data.isActive !== undefined) {
    updateData.isActive = data.isActive;
  }

  try {
    return await (prisma.team as any).update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        isActive: true,
        createdAt: true,
      },
    });
  } catch (err: any) {
    if (err?.code === "P2002") {
      throw new Error(`Team name "${data.name}" already exists.`);
    }
    throw err;
  }
}

export async function deleteTeam(id: string) {
  // Check if team has existing match associations
  const matchCount = await (prisma.matchTeam as any).count({
    where: { teamId: id },
  });

  if (matchCount > 0) {
    throw new Error("Cannot delete team with historical match records. Please deactivate the team instead.");
  }

  return await (prisma.team as any).delete({
    where: { id },
  });
}
