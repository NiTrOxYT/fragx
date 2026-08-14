import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyAdminAuth } from "@/lib/services/admin";
import { getAuthenticatedPlayer } from "@/lib/services/access";
import { updatePlayer, deletePlayer } from "@/lib/services/players";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updatePlayerSchema = z.object({
  name: z.string().min(1).optional(),
  avatarUrl: z.string().url("Must be a valid URL (https://...)").optional(),
  role: z.enum(["PLAYER", "MODERATOR", "ADMIN"]).optional(),
  isActive: z.boolean().optional(),
  secretKey: z.string().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const isMasterAdmin = await verifyAdminAuth();
  const authPlayer = await getAuthenticatedPlayer();

  const isAdmin = isMasterAdmin || authPlayer?.role === "ADMIN" || authPlayer?.isAdmin === true;
  const isModerator = authPlayer?.role === "MODERATOR";
  const isOwner = authPlayer?.id === params.id;

  if (!isAdmin && !isModerator && !isOwner) {
    return NextResponse.json(
      { error: "Unauthorized access to edit player" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const parsed = updatePlayerSchema.parse(body);

    const targetPlayer = await (prisma.player as any).findUnique({
      where: { id: params.id },
      select: { id: true, role: true, name: true },
    });

    if (!targetPlayer) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    // Role-based field restrictions:
    // 1. Regular Player editing own profile -> Avatar URL ONLY
    if (!isAdmin && !isModerator && isOwner) {
      if (parsed.name || parsed.role || parsed.isActive || parsed.secretKey) {
        return NextResponse.json(
          { error: "Players can only update their own profile picture" },
          { status: 403 }
        );
      }
    }

    // 2. Moderator editing a player -> Cannot promote to ADMIN or alter ADMIN roles
    if (!isAdmin && isModerator) {
      if (parsed.role === "ADMIN") {
        return NextResponse.json(
          { error: "Moderators are not allowed to promote users to ADMIN" },
          { status: 403 }
        );
      }
      if ((targetPlayer.role as string) === "ADMIN" && parsed.role && (parsed.role as string) !== "ADMIN") {

        return NextResponse.json(
          { error: "Moderators are not allowed to demote Administrators" },
          { status: 403 }
        );
      }
    }


    // 3. Admin demoting an ADMIN -> Prevent removing the last administrator
    if (isAdmin && targetPlayer.role === "ADMIN" && parsed.role && parsed.role !== "ADMIN") {
      const adminCount = await (prisma.player as any).count({
        where: { role: "ADMIN", isActive: true },
      });
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: "Cannot demote the last remaining active Administrator" },
          { status: 400 }
        );
      }
    }

    const updated = await updatePlayer(params.id, parsed);

    revalidatePath(`/players/${params.id}`);
    revalidatePath("/players");
    revalidatePath("/leaderboard");
    revalidatePath("/admin");
    revalidatePath("/");

    return NextResponse.json({ player: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to update player" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const isMasterAdmin = await verifyAdminAuth();
  const authPlayer = await getAuthenticatedPlayer();

  const isAdmin = isMasterAdmin || authPlayer?.role === "ADMIN" || authPlayer?.isAdmin === true;
  const isModerator = authPlayer?.role === "MODERATOR";

  if (!isAdmin && !isModerator) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const targetPlayer = await (prisma.player as any).findUnique({
      where: { id: params.id },
      select: { id: true, role: true },
    });

    if (!targetPlayer) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    if (!isAdmin && isModerator && (targetPlayer.role as string) === "ADMIN") {

      return NextResponse.json(
        { error: "Moderators cannot delete Administrators" },
        { status: 403 }
      );
    }

    if (targetPlayer.role === "ADMIN") {
      const adminCount = await (prisma.player as any).count({
        where: { role: "ADMIN", isActive: true },
      });
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: "Cannot delete the last remaining active Administrator" },
          { status: 400 }
        );
      }
    }

    await deletePlayer(params.id);

    revalidatePath(`/players/${params.id}`);
    revalidatePath("/players");
    revalidatePath("/leaderboard");
    revalidatePath("/admin");
    revalidatePath("/");

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to delete player" },
      { status: 400 }
    );
  }
}
