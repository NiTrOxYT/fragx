import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { verifyAdminAuth } from "@/lib/services/admin";
import { getAuthenticatedPlayer } from "@/lib/services/access";
import { removeGoldenGunAward } from "@/lib/services/goldengun";

export async function DELETE(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  const isMasterAdmin = await verifyAdminAuth();
  const authPlayer = await getAuthenticatedPlayer();

  const isAuthorized =
    isMasterAdmin || authPlayer?.role === "ADMIN" || authPlayer?.role === "MODERATOR";

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
  }

  try {
    await removeGoldenGunAward(params.sessionId);

    // Invalidate caches across the platform
    revalidatePath("/");
    revalidatePath("/leaderboard");
    revalidatePath("/players");
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

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Remove golden gun error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to remove golden gun award" },
      { status: 400 }
    );
  }
}
