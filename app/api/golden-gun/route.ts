import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { verifyAdminAuth } from "@/lib/services/admin";
import { getAuthenticatedPlayer } from "@/lib/services/access";
import {
  getSessionGoldenGunDetails,
  assignGoldenGunAward,
  getAdminGoldenGunSessions,
} from "@/lib/services/goldengun";
import { z } from "zod";

const assignGoldenGunSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
  playerId: z.string().min(1, "Player ID is required"),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId") || undefined;

  try {
    const [details, sessions] = await Promise.all([
      getSessionGoldenGunDetails(sessionId),
      getAdminGoldenGunSessions(),
    ]);

    return NextResponse.json({ details, sessions });
  } catch (error: any) {
    console.error("Fetch golden gun details error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to load golden gun details" },
      { status: 400 }
    );
  }
}

export async function POST(request: Request) {
  const isMasterAdmin = await verifyAdminAuth();
  const authPlayer = await getAuthenticatedPlayer();

  const isAuthorized =
    isMasterAdmin || authPlayer?.role === "ADMIN" || authPlayer?.role === "MODERATOR";

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = assignGoldenGunSchema.parse(body);

    const award = await assignGoldenGunAward(parsed.sessionId, parsed.playerId);

    // Invalidate caches across the platform
    revalidatePath("/");
    revalidatePath("/leaderboard");
    revalidatePath("/players");
    revalidatePath(`/players/${parsed.playerId}`);
    revalidatePath("/admin");
    revalidatePath("/matches");
    revalidatePath("/scoreboard");

    revalidateTag("stats");
    revalidateTag("matches");
    revalidateTag("sessions");
    revalidateTag("scoreboard");
    revalidateTag("leaderboard");
    revalidateTag("players");
    revalidateTag("golden-gun");
    revalidateTag(`player-${parsed.playerId}`);

    return NextResponse.json({ award }, { status: 200 });
  } catch (error: any) {
    console.error("Assign golden gun error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to assign golden gun award" },
      { status: 400 }
    );
  }
}
