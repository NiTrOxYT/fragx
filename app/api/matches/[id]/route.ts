import { NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/services/admin";
import { deleteMatch } from "@/lib/services/matches";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const isAuth = await verifyAdminAuth();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    await deleteMatch(params.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to delete match" },
      { status: 400 }
    );
  }
}
