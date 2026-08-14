import { NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/services/admin";
import { removePlayerFromTeam } from "@/lib/services/teams";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; playerId: string } }
) {
  const isAuth = await verifyAdminAuth();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const result = await removePlayerFromTeam(params.id, params.playerId);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to remove player from team" },
      { status: 400 }
    );
  }
}
