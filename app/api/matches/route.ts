import { NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/services/admin";
import { createMatch, createMultiTeamMatch } from "@/lib/services/matches";
import { getOrCreateSessionForDate, getOrCreateActiveDraftSession } from "@/lib/services/sessions";
import { z } from "zod";

const createMultiTeamMatchSchema = z.object({
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

const legacyMatchSchema = z.object({
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

    // Check if multi-team match format
    if (body.teams && Array.isArray(body.teams)) {
      const parsed = createMultiTeamMatchSchema.parse(body);
      const match = await createMultiTeamMatch(parsed);
      return NextResponse.json({ match }, { status: 201 });
    }

    // Legacy single-player match format
    const parsed = legacyMatchSchema.parse(body);
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
