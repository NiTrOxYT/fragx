import { NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/services/admin";
import { createMatch } from "@/lib/services/matches";
import { getOrCreateSessionForDate, getOrCreateActiveDraftSession } from "@/lib/services/sessions";
import { z } from "zod";

const createMatchSchema = z.object({
  sessionId: z.string().optional(),
  sessionDate: z.string().optional(),
  matchNumber: z.number().int().min(1, "Match number must be at least 1"),
  playerId: z.string().min(1, "Player selection is required"),
  kills: z.number().int().min(0, "Kills must be 0 or greater"),
  placement: z.number().int().min(1, "Placement must be 1 or greater"),
  screenshotUrl: z
    .string()
    .min(1, "Screenshot URL is required")
    .refine((url) => url.startsWith("https://") || url.startsWith("data:image/"), {
      message: "Screenshot URL must use HTTPS (https://) or an uploaded image.",
    }),
  duration: z.string().optional(),
});

export async function POST(request: Request) {
  const isAuth = await verifyAdminAuth();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createMatchSchema.parse(body);

    let targetSessionId = parsed.sessionId;
    if (!targetSessionId && parsed.sessionDate) {
      const session = await getOrCreateSessionForDate(parsed.sessionDate);
      targetSessionId = session.id;
    } else if (!targetSessionId) {
      const session = await getOrCreateActiveDraftSession();
      targetSessionId = session.id;
    }

    const match = await createMatch({
      sessionId: targetSessionId,
      matchNumber: parsed.matchNumber,
      playerId: parsed.playerId,
      kills: parsed.kills,
      placement: parsed.placement,
      screenshotUrl: parsed.screenshotUrl,
      duration: parsed.duration,
    });
    return NextResponse.json({ match }, { status: 201 });
  } catch (error: any) {
    console.error("Create match error:", error);
    return NextResponse.json(
      { error: error?.message || error?.errors?.[0]?.message || "Failed to create match" },
      { status: 400 }
    );
  }
}

