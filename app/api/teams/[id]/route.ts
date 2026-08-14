import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyAdminAuth } from "@/lib/services/admin";
import { updateTeam, deleteTeam } from "@/lib/services/teams";
import { z } from "zod";

const updateTeamSchema = z.object({
  name: z
    .string()
    .min(2, "Team name must be at least 2 characters")
    .max(40, "Team name cannot exceed 40 characters")
    .optional(),
  avatarUrl: z
    .string()
    .nullable()
    .optional()
    .refine(
      (url) => !url || url.trim() === "" || url.startsWith("https://") || url.startsWith("data:image/"),
      { message: "Team avatar URL must start with https://" }
    ),
  isActive: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const isAuth = await verifyAdminAuth();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = updateTeamSchema.parse(body);

    const team = await updateTeam(params.id, {
      name: parsed.name,
      avatarUrl: parsed.avatarUrl !== undefined ? parsed.avatarUrl : undefined,
      isActive: parsed.isActive,
    });

    revalidatePath("/admin");
    revalidatePath("/scoreboard");
    revalidatePath("/matches");
    revalidatePath("/");

    return NextResponse.json({ team });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || error?.errors?.[0]?.message || "Failed to update team" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const isAuth = await verifyAdminAuth();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    await deleteTeam(params.id);

    revalidatePath("/admin");
    revalidatePath("/scoreboard");
    revalidatePath("/matches");
    revalidatePath("/");

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to delete team" },
      { status: 400 }
    );
  }
}
