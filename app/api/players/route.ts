import { NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/services/admin";
import { createPlayer, getAllPlayers } from "@/lib/services/players";
import { z } from "zod";

const createPlayerSchema = z.object({
  name: z.string().min(1, "Player name is required"),
  avatarUrl: z.string().optional(),
});

export async function GET() {
  const players = await getAllPlayers();
  return NextResponse.json({ players });
}

export async function POST(request: Request) {
  const isAuth = await verifyAdminAuth();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createPlayerSchema.parse(body);

    const player = await createPlayer(parsed.name, parsed.avatarUrl);
    return NextResponse.json({ player }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to create player" },
      { status: 400 }
    );
  }
}
