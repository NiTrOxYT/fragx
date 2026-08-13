import { NextResponse } from "next/server";
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
    return NextResponse.json({ session });
  } catch (error: any) {
    console.error("Publish session error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to publish session" },
      { status: 400 }
    );
  }
}
