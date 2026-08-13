import { NextResponse } from "next/server";
import { setAdminSession, clearAdminSession, verifyAdminAuth } from "@/lib/services/admin";
import { z } from "zod";

const loginSchema = z.object({
  pin: z.string().min(1, "PIN is required"),
});

export async function GET() {
  const isAuth = await verifyAdminAuth();
  return NextResponse.json({ authenticated: isAuth });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.parse(body);

    const success = await setAdminSession(parsed.pin);
    if (!success) {
      return NextResponse.json({ error: "Invalid Admin PIN" }, { status: 401 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.errors?.[0]?.message || "Authentication failed" },
      { status: 400 }
    );
  }
}

export async function DELETE() {
  await clearAdminSession();
  return NextResponse.json({ success: true });
}
