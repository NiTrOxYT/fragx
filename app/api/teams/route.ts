import { NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/services/admin";
import { createTeam, getAllTeams } from "@/lib/services/teams";
import { z } from "zod";

const createTeamSchema = z.object({
  name: z
    .string()
    .min(2, "Team name must be at least 2 characters")
    .max(40, "Team name cannot exceed 40 characters")
    .refine((val) => val.trim().length > 0, "Team name cannot be empty"),
});

export async function GET() {
  const teams = await getAllTeams();
  return NextResponse.json({ teams });
}

export async function POST(request: Request) {
  const isAuth = await verifyAdminAuth();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createTeamSchema.parse(body);

    const team = await createTeam(parsed.name);
    return NextResponse.json({ team }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || error?.errors?.[0]?.message || "Failed to create team" },
      { status: 400 }
    );
  }
}
