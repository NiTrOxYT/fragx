import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? [
            { emit: "event", level: "query" },
            { emit: "stdout", level: "error" },
            { emit: "stdout", level: "warn" },
          ]
        : [{ emit: "stdout", level: "error" }],
  });

if (process.env.NODE_ENV === "development") {
  (prisma as any).$on?.("query", (e: any) => {
    if (e.duration >= 100) {
      console.log(`[DB SLOW QUERY] ${e.duration}ms`);
    }
  });
}

globalForPrisma.prisma = prisma;


