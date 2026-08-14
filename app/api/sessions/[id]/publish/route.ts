import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { verifyAdminAuth } from "@/lib/services/admin";
import { publishSession } from "@/lib/services/sessions";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const isAuth = await verifyAdminAuth();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const session = await publishSession(params.id);

    // Invalidate public page caches and tags so changes appear instantly
    revalidatePath("/");
    revalidatePath("/matches");
    revalidatePath("/leaderboard");
    revalidatePath("/players");
    revalidatePath("/scoreboard");
    revalidateTag("stats");
    revalidateTag("matches");
    revalidateTag("sessions");
    revalidateTag("scoreboard");
    revalidateTag("leaderboard");

    return NextResponse.json({ session });

  } catch (error: any) {
    console.error("Publish session error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to publish session" },
      { status: 400 }
    );
  }
}

