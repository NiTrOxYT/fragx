import { NextResponse } from "next/server";
import { setAccessSession, verifyAccessAuth } from "@/lib/services/access";
import { z } from "zod";

const accessSchema = z.object({
  accessKey: z.string().min(1, "Access Key is required"),
});

export async function GET() {
  const isAuthorized = await verifyAccessAuth();
  return NextResponse.json({ authorized: isAuthorized });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = accessSchema.parse(body);

    const success = await setAccessSession(parsed.accessKey);
    if (!success) {
      return NextResponse.json({ error: "Invalid Access Key" }, { status: 401 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.errors?.[0]?.message || "Authentication failed" },
      { status: 400 }
    );
  }
}
