import { NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/services/admin";
import { getOrCreateSessionForDate } from "@/lib/services/sessions";
import { z } from "zod";

const byDateSchema = z.object({
  dateStr: z.string().min(1, "Date string is required"),
});

export async function POST(request: Request) {
  const isAuth = await verifyAdminAuth();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = byDateSchema.parse(body);

    const session = await getOrCreateSessionForDate(parsed.dateStr);
    return NextResponse.json({ session });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to process session for date" },
      { status: 400 }
    );
  }
}
