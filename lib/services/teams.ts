import { cache } from "react";
import { prisma } from "@/lib/db";

export interface TeamPlayerSummary {
  id: string;
  name: string;
  avatarUrl: string;
  role: "PLAYER" | "MODERATOR" | "ADMIN";
  isActive: boolean;
  teamId?: string | null;
  teamName?: string | null;
}

export interface TeamRecord {
  id: string;
  name: string;
  avatarUrl?: string | null;
  isActive: boolean;
  players?: TeamPlayerSummary[];
  playerCount?: number;
  createdAt: Date;
}

function validateAvatarUrl(url?: string | null): string | null {
  if (!url || !url.trim()) return null;
  const trimmed = url.trim();
  if (!trimmed.startsWith("https://") && !trimmed.startsWith("data:image/")) {
    throw new Error("Team avatar URL must start with https://");
  }
  return trimmed;
}

export const getAllTeams = cache(async (): Promise<TeamRecord[]> => {
  const teams = await (prisma.team as any).findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      isActive: true,
      createdAt: true,
      players: {
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          role: true,
          isActive: true,
          teamId: true,
        },
      },
    },
  });

  return teams.map((t: any) => ({
    id: t.id,
    name: t.name,
    avatarUrl: t.avatarUrl || null,
    isActive: t.isActive,
    players: (t.players || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      avatarUrl: p.avatarUrl,
      role: p.role,
      isActive: p.isActive,
      teamId: p.teamId,
      teamName: t.name,
    })),
    playerCount: t.players?.length || 0,
    createdAt: t.createdAt,
  }));
});

export const getActiveTeams = cache(async (): Promise<TeamRecord[]> => {
  const teams = await (prisma.team as any).findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      isActive: true,
      createdAt: true,
      players: {
        where: { isActive: true },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          role: true,
          isActive: true,
          teamId: true,
        },
      },
    },
  });

  return teams.map((t: any) => ({
    id: t.id,
    name: t.name,
    avatarUrl: t.avatarUrl || null,
    isActive: t.isActive,
    players: (t.players || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      avatarUrl: p.avatarUrl,
      role: p.role,
      isActive: p.isActive,
      teamId: p.teamId,
      teamName: t.name,
    })),
    playerCount: t.players?.length || 0,
    createdAt: t.createdAt,
  }));
});

export async function getTeamWithPlayers(teamId: string) {
  const team = await (prisma.team as any).findUnique({
    where: { id: teamId },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      isActive: true,
      players: {
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          role: true,
          isActive: true,
          teamId: true,
        },
      },
    },
  });

  if (!team) {
    throw new Error("Team not found.");
  }

  // Fetch all registered players to show available players for assignment
  const allPlayers = await (prisma.player as any).findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      role: true,
      isActive: true,
      teamId: true,
      team: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  const currentPlayers = team.players.map((p: any) => ({
    id: p.id,
    name: p.name,
    avatarUrl: p.avatarUrl,
    role: p.role,
    isActive: p.isActive,
    teamId: p.teamId,
    teamName: team.name,
  }));

  const availablePlayers = allPlayers
    .filter((p: any) => p.teamId !== teamId)
    .map((p: any) => ({
      id: p.id,
      name: p.name,
      avatarUrl: p.avatarUrl,
      role: p.role,
      isActive: p.isActive,
      teamId: p.teamId || null,
      teamName: p.team?.name || null,
    }));

  return {
    team: {
      id: team.id,
      name: team.name,
      avatarUrl: team.avatarUrl || null,
      isActive: team.isActive,
    },
    currentPlayers,
    availablePlayers,
  };
}

export async function assignPlayersToTeam(teamId: string, playerIds: string[]) {
  if (!playerIds || playerIds.length === 0) {
    return [];
  }

  const team = await (prisma.team as any).findUnique({
    where: { id: teamId },
    select: { id: true, name: true },
  });

  if (!team) {
    throw new Error("Team not found.");
  }

  // Assign players to this team
  await (prisma.player as any).updateMany({
    where: {
      id: { in: playerIds },
    },
    data: {
      teamId,
    },
  });

  return getTeamWithPlayers(teamId);
}

export async function removePlayerFromTeam(teamId: string, playerId: string) {
  await (prisma.player as any).updateMany({
    where: {
      id: playerId,
      teamId,
    },
    data: {
      teamId: null,
    },
  });

  return getTeamWithPlayers(teamId);
}

export async function createTeam(data: { name: string; avatarUrl?: string | null }): Promise<TeamRecord> {
  const trimmedName = data.name.trim();
  if (!trimmedName || trimmedName.length < 2 || trimmedName.length > 40) {
    throw new Error("Team name must be between 2 and 40 characters.");
  }

  const validatedAvatar = validateAvatarUrl(data.avatarUrl);

  try {
    const team = await (prisma.team as any).create({
      data: {
        name: trimmedName,
        avatarUrl: validatedAvatar,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        isActive: true,
        createdAt: true,
      },
    });

    return {
      ...team,
      players: [],
      playerCount: 0,
    };
  } catch (err: any) {
    if (err?.code === "P2002") {
      throw new Error(`Team name "${trimmedName}" already exists.`);
    }
    throw err;
  }
}

export async function updateTeam(
  id: string,
  data: { name?: string; avatarUrl?: string | null; isActive?: boolean }
): Promise<TeamRecord> {
  const updateData: any = {};
  if (data.name !== undefined) {
    const trimmed = data.name.trim();
    if (!trimmed || trimmed.length < 2 || trimmed.length > 40) {
      throw new Error("Team name must be between 2 and 40 characters.");
    }
    updateData.name = trimmed;
  }
  if (data.avatarUrl !== undefined) {
    updateData.avatarUrl = validateAvatarUrl(data.avatarUrl);
  }
  if (data.isActive !== undefined) {
    updateData.isActive = data.isActive;
  }

  try {
    const team = await (prisma.team as any).update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        isActive: true,
        createdAt: true,
        players: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            role: true,
            isActive: true,
            teamId: true,
          },
        },
      },
    });

    return {
      id: team.id,
      name: team.name,
      avatarUrl: team.avatarUrl || null,
      isActive: team.isActive,
      players: team.players || [],
      playerCount: team.players?.length || 0,
      createdAt: team.createdAt,
    };
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

  // Remove team assignments from players before deleting
  await (prisma.player as any).updateMany({
    where: { teamId: id },
    data: { teamId: null },
  });

  return await (prisma.team as any).delete({
    where: { id },
  });
}
