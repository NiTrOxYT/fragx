import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyAdminAuth } from "@/lib/services/admin";
import { getAuthenticatedPlayer } from "@/lib/services/access";
import { deleteMatch, updateMultiTeamMatch } from "@/lib/services/matches";
import { z } from "zod";

const updateMultiTeamMatchSchema = z.object({
  sessionDate: z.string().min(1, "Session Date is required"),
  matchNumber: z.number().int().min(1, "Match number must be at least 1"),
  screenshotUrl: z
    .string()
    .min(1, "Screenshot URL is required")
    .refine((url) => url.startsWith("https://") || url.startsWith("data:image/"), {
      message: "Screenshot URL must use HTTPS (https://) or an uploaded image.",
    }),
  duration: z.string().optional(),
  teams: z
    .array(
      z.object({
        teamId: z.string().min(1, "Team ID is required"),
        placement: z.number().int().min(1, "Placement must be 1 or greater"),
        players: z
          .array(
            z.object({
              playerId: z.string().min(1, "Player ID is required"),
              kills: z.number().int().min(0, "Kills must be 0 or greater"),
            })
          )
          .min(1, "Each team must have at least 1 participating player"),
      })
    )
    .min(1, "At least 1 team is required"),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const isMasterAdmin = await verifyAdminAuth();
  const authPlayer = await getAuthenticatedPlayer();

  const isAuthorized =
    isMasterAdmin || authPlayer?.role === "ADMIN" || authPlayer?.role === "MODERATOR";

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = updateMultiTeamMatchSchema.parse(body);

    const updatedMatch = await updateMultiTeamMatch(params.id, parsed);

    const { revalidateTag } = await import("next/cache");
    revalidatePath("/");
    revalidatePath("/matches");
    revalidatePath(`/matches/${params.id}`);
    revalidatePath("/leaderboard");
    revalidatePath("/players");
    revalidatePath("/scoreboard");
    revalidatePath("/admin");
    revalidateTag("matches");
    revalidateTag("stats");
    revalidateTag("sessions");
    revalidateTag("scoreboard");
    revalidateTag("leaderboard");
    revalidateTag(`match-${params.id}`);

    return NextResponse.json({ match: updatedMatch });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || error?.errors?.[0]?.message || "Failed to update match" },
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

  const isAuthorized =
    isMasterAdmin || authPlayer?.role === "ADMIN" || authPlayer?.role === "MODERATOR";

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
  }

  try {
    await deleteMatch(params.id);

    const { revalidateTag } = await import("next/cache");
    revalidatePath("/");
    revalidatePath("/matches");
    revalidatePath("/leaderboard");
    revalidatePath("/scoreboard");
    revalidatePath("/admin");
    revalidatePath("/players");
    revalidateTag("matches");
    revalidateTag("stats");
    revalidateTag("sessions");
    revalidateTag("scoreboard");
    revalidateTag("leaderboard");

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to delete match" },
      { status: 400 }
    );
  }
}

