import { NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/services/admin";
import { getTeamWithPlayers, assignPlayersToTeam } from "@/lib/services/teams";
import { z } from "zod";

const assignPlayersSchema = z.object({
  playerIds: z.array(z.string().min(1)).min(1, "Select at least one player to assign"),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await getTeamWithPlayers(params.id);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch team players" },
      { status: error?.message === "Team not found." ? 404 : 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const isAuth = await verifyAdminAuth();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = assignPlayersSchema.parse(body);

    const result = await assignPlayersToTeam(params.id, parsed.playerIds);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || error?.errors?.[0]?.message || "Failed to assign players" },
      { status: 400 }
    );
  }
}
