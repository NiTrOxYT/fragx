import crypto from "crypto";

export function cryptoNative(input: string): string {
  const secret = process.env.SESSION_SECRET || "fragx-super-secret-key-2026-bgmi";
  return crypto.createHmac("sha256", secret).update(input).digest("hex");
}
