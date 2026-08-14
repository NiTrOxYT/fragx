import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { cryptoNative } from "@/lib/auth-crypto";

const ACCESS_COOKIE_NAME = "fragx_access_session";

/**
 * Verifies whether the current request has a valid access token cookie.
 * Valid tokens can belong to:
 * 1. Master Access Key (ACCESS_KEY environment variable)
 * 2. Any active Player's unique Access Key in database
 */
/**
 * Retrieves the currently authenticated player/user from access session cookie.
 */
export async function getAuthenticatedPlayer(): Promise<{
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  isAdmin: boolean;
} | null> {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get(ACCESS_COOKIE_NAME)?.value;

  if (!sessionToken) return null;

  const masterKey = process.env.ACCESS_KEY || "FRAGX2026";
  const masterToken = cryptoNative(masterKey);

  if (sessionToken === masterToken) {
    const adminPlayer = await (prisma.player as any).findFirst({
      where: { role: "ADMIN", isActive: true },
      select: { id: true, name: true, role: true, avatarUrl: true },
    });
    if (adminPlayer) {
      return { ...adminPlayer, isAdmin: true };
    }
    return { id: "master", name: "ADMIN", role: "ADMIN", avatarUrl: "", isAdmin: true };
  }

  try {
    const player = await (prisma.player as any).findFirst({
      where: {
        accessKeyHash: sessionToken,
        isActive: true,
      },
      select: { id: true, name: true, role: true, avatarUrl: true },
    });
    if (player) {
      return {
        ...player,
        isAdmin: player.role === "ADMIN",
      };
    }
  } catch (err) {
    console.error("Error fetching authenticated player:", err);
  }

  return null;
}

/**
 * Verifies whether the current request has a valid access token cookie.
 */
export async function verifyAccessAuth(): Promise<boolean> {
  const player = await getAuthenticatedPlayer();
  return !!player;
}


/**
 * Validates the provided Access Key against Master Key or Player Access Keys.
 * If valid, sets the HTTP-only access session cookie.
 */
export async function setAccessSession(key: string): Promise<boolean> {
  const trimmedKey = key.trim();
  if (!trimmedKey) return false;

  const masterKey = process.env.ACCESS_KEY || "FRAGX2026";
  const hashedToken = cryptoNative(trimmedKey);

  let isValid = false;

  // Check 1: Master Access Key
  if (trimmedKey === masterKey) {
    isValid = true;
  } else {
    // Check 2: Player Access Key in database
    try {
      const player = await (prisma.player as any).findFirst({
        where: {
          accessKeyHash: hashedToken,
          isActive: true,
        },
        select: { id: true, name: true, role: true },
      });
      if (player) {
        isValid = true;
      }
    } catch (err) {
      console.error("Error checking player access key in DB:", err);
    }
  }

  if (!isValid) {
    return false;
  }

  // Set HTTP-only session cookie with the hashed token
  const cookieStore = cookies();
  cookieStore.set(ACCESS_COOKIE_NAME, hashedToken, {
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
