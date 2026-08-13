import { NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/services/admin";
import { updatePlayer, deletePlayer } from "@/lib/services/players";
import { z } from "zod";

const updatePlayerSchema = z.object({
  name: z.string().min(1).optional(),
  avatarUrl: z.string().optional(),
  role: z.enum(["PLAYER", "MODERATOR", "ADMIN"]).optional(),
  isActive: z.boolean().optional(),
  secretKey: z.string().optional(),
});


export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const isAuth = await verifyAdminAuth();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = updatePlayerSchema.parse(body);

    const player = await updatePlayer(params.id, parsed);
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
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to delete player" },
      { status: 400 }
    );
  }
}
