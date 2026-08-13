import { cookies } from "next/headers";
import { cryptoNative } from "@/lib/auth-crypto";

const ACCESS_COOKIE_NAME = "fragx_access_session";

export async function verifyAccessAuth(): Promise<boolean> {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get(ACCESS_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return false;
  }

  const expectedKey = process.env.ACCESS_KEY || "FRAGX2026";
  const expectedToken = cryptoNative(expectedKey);
  return sessionToken === expectedToken;
}

export async function setAccessSession(key: string): Promise<boolean> {
  const expectedKey = process.env.ACCESS_KEY || "FRAGX2026";
  if (key !== expectedKey) {
    return false;
  }

  const token = cryptoNative(expectedKey);
  const cookieStore = cookies();
  cookieStore.set(ACCESS_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return true;
}

export async function clearAccessSession() {
  const cookieStore = cookies();
  cookieStore.delete(ACCESS_COOKIE_NAME);
}
