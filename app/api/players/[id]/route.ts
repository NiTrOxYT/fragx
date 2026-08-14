import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyAdminAuth } from "@/lib/services/admin";
import { getAuthenticatedPlayer } from "@/lib/services/access";
import { updatePlayer, deletePlayer } from "@/lib/services/players";
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
  const authPlayer = await getAuthenticatedPlayer();
  const isAdmin = await verifyAdminAuth();

  const isOwner = authPlayer?.id === params.id;
  const canEdit = isAdmin || (authPlayer && (isOwner || authPlayer.isAdmin));

  if (!canEdit) {
    return NextResponse.json(
      { error: "Unauthorized: You can only edit your own profile" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const parsed = updatePlayerSchema.parse(body);

    // Non-admin players can only update avatarUrl
    if (!isAdmin && !authPlayer?.isAdmin) {
      if (parsed.name || parsed.role || parsed.isActive || parsed.secretKey) {
        return NextResponse.json(
          { error: "Unauthorized to change roles, gamertags, or keys" },
          { status: 403 }
        );
      }
    }

    const player = await updatePlayer(params.id, parsed);

    revalidatePath(`/players/${params.id}`);
    revalidatePath("/players");
    revalidatePath("/leaderboard");
    revalidatePath("/");

    return NextResponse.json({ player });
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
  const isAuth = await verifyAdminAuth();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    await deletePlayer(params.id);

    revalidatePath(`/players/${params.id}`);
    revalidatePath("/players");
    revalidatePath("/leaderboard");
    revalidatePath("/");

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to delete player" },
      { status: 400 }
    );
  }
}
