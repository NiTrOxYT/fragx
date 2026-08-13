import { cookies } from "next/headers";
import { cryptoNative } from "@/lib/auth-crypto";

const ADMIN_COOKIE_NAME = "fragx_admin_session";

export async function verifyAdminAuth(): Promise<boolean> {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return false;
  }

  const expectedToken = cryptoNative(process.env.ADMIN_PIN || "1337");
  return sessionToken === expectedToken;
}

export async function setAdminSession(pin: string): Promise<boolean> {
  const expectedPin = process.env.ADMIN_PIN || "1337";
  if (pin !== expectedPin) {
    return false;
  }

  const token = cryptoNative(expectedPin);
  const cookieStore = cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return true;
}

export async function clearAdminSession() {
  const cookieStore = cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}
