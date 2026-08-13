import { NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/services/admin";
import { createMatch } from "@/lib/services/matches";
import { z } from "zod";

const createMatchSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
  matchNumber: z.number().int().min(1, "Match number must be at least 1"),
  playerId: z.string().min(1, "Player selection is required"),
  kills: z.number().int().min(0, "Kills must be 0 or greater"),
  placement: z.number().int().min(1, "Placement must be 1 or greater"),
  screenshotUrl: z
    .string()
    .min(1, "Screenshot URL is required")
    .max(2048, "URL exceeds maximum length of 2048 characters")
    .url("Must be a valid URL")
    .refine((url) => url.startsWith("https://"), {
      message: "Screenshot URL must use HTTPS (https://)",
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

    const match = await createMatch(parsed);
    return NextResponse.json({ match }, { status: 201 });
  } catch (error: any) {
    console.error("Create match error:", error);
    return NextResponse.json(
      { error: error?.message || error?.errors?.[0]?.message || "Failed to create match" },
      { status: 400 }
    );
  }
}
