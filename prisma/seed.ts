import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Public HTTPS avatar & match screenshot URLs for seeding
const AVATARS = {
  rohan: "https://api.dicebear.com/7.x/bottts/svg?seed=Rohan&backgroundColor=171717",
  arjun: "https://api.dicebear.com/7.x/bottts/svg?seed=Arjun&backgroundColor=171717",
  sourik: "https://api.dicebear.com/7.x/bottts/svg?seed=Sourik&backgroundColor=171717",
  kunal: "https://api.dicebear.com/7.x/bottts/svg?seed=Kunal&backgroundColor=171717",
  knox: "https://api.dicebear.com/7.x/bottts/svg?seed=Knox&backgroundColor=171717",
};

const SCREENSHOTS = [
  "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
];

async function main() {
  console.log("Seeding PostgreSQL database...");

  // Clean existing data
  await prisma.match.deleteMany({});
  await prisma.gamingSession.deleteMany({});
  await prisma.player.deleteMany({});

  // 1. Create Players
  const rohan = await prisma.player.create({
    data: {
      name: "Rohan",
      avatarUrl: AVATARS.rohan,
    },
  });

  const arjun = await prisma.player.create({
    data: {
      name: "Arjun",
      avatarUrl: AVATARS.arjun,
    },
  });

  const sourik = await prisma.player.create({
    data: {
      name: "Sourik",
      avatarUrl: AVATARS.sourik,
    },
  });

  const kunal = await prisma.player.create({
    data: {
      name: "Kunal",
      avatarUrl: AVATARS.kunal,
    },
  });

  const knox = await prisma.player.create({
    data: {
      name: "Knox",
      avatarUrl: AVATARS.knox,
    },
  });

  console.log("Created 5 players: Rohan, Arjun, Sourik, Kunal, Knox");

  // 2. Create Published Session 1 (AUG 13, 2026) - Rohan is MVP with 18 peak kills
  const aug13 = new Date("2026-08-13T22:00:00Z");
  const sessionAug13 = await prisma.gamingSession.create({
    data: {
      date: aug13,
      status: "PUBLISHED",
      publishedAt: new Date("2026-08-13T23:30:00Z"),
    },
  });

  await prisma.match.createMany({
    data: [
      {
        sessionId: sessionAug13.id,
        matchNumber: 1,
        playerId: rohan.id,
        kills: 12,
        placement: 1,
        screenshotUrl: SCREENSHOTS[0],
        duration: "21:45 MIN",
      },
      {
        sessionId: sessionAug13.id,
        matchNumber: 2,
        playerId: kunal.id,
        kills: 9,
        placement: 3,
        screenshotUrl: SCREENSHOTS[1],
        duration: "18:20 MIN",
      },
      {
        sessionId: sessionAug13.id,
        matchNumber: 3,
        playerId: rohan.id,
        kills: 18,
        placement: 1,
        screenshotUrl: SCREENSHOTS[2],
        duration: "24:10 MIN",
      },
      {
        sessionId: sessionAug13.id,
        matchNumber: 4,
        playerId: arjun.id,
        kills: 7,
        placement: 2,
        screenshotUrl: SCREENSHOTS[3],
        duration: "19:05 MIN",
      },
      {
        sessionId: sessionAug13.id,
        matchNumber: 5,
        playerId: sourik.id,
        kills: 14,
        placement: 1,
        screenshotUrl: SCREENSHOTS[4],
        duration: "22:30 MIN",
      },
      {
        sessionId: sessionAug13.id,
        matchNumber: 6,
        playerId: knox.id,
        kills: 0,
        placement: 15,
        screenshotUrl: SCREENSHOTS[0],
        duration: "04:12 MIN",
      },
    ],
  });

  // 3. Create Published Session 2 (AUG 12, 2026) - Kunal & Arjun tied MVP scenario
  const aug12 = new Date("2026-08-12T22:00:00Z");
  const sessionAug12 = await prisma.gamingSession.create({
    data: {
      date: aug12,
      status: "PUBLISHED",
      publishedAt: new Date("2026-08-12T23:30:00Z"),
    },
  });

  await prisma.match.createMany({
    data: [
      {
        sessionId: sessionAug12.id,
        matchNumber: 1,
        playerId: kunal.id,
        kills: 15,
        placement: 1,
        screenshotUrl: SCREENSHOTS[1],
        duration: "20:00 MIN",
      },
      {
        sessionId: sessionAug12.id,
        matchNumber: 2,
        playerId: arjun.id,
        kills: 15,
        placement: 1,
        screenshotUrl: SCREENSHOTS[2],
        duration: "22:15 MIN",
      },
      {
        sessionId: sessionAug12.id,
        matchNumber: 3,
        playerId: sourik.id,
        kills: 6,
        placement: 4,
        screenshotUrl: SCREENSHOTS[3],
        duration: "14:40 MIN",
      },
      {
        sessionId: sessionAug12.id,
        matchNumber: 4,
        playerId: knox.id,
        kills: 2,
        placement: 8,
        screenshotUrl: SCREENSHOTS[4],
        duration: "09:50 MIN",
      },
    ],
  });

  // 4. Create Draft Session (Tonight's active session in progress)
  const today = new Date();
  const draftSession = await prisma.gamingSession.create({
    data: {
      date: today,
      status: "DRAFT",
    },
  });

  await prisma.match.createMany({
    data: [
      {
        sessionId: draftSession.id,
        matchNumber: 1,
        playerId: sourik.id,
        kills: 11,
        placement: 1,
        screenshotUrl: SCREENSHOTS[0],
        duration: "21:00 MIN",
      },
      {
        sessionId: draftSession.id,
        matchNumber: 2,
        playerId: rohan.id,
        kills: 13,
        placement: 2,
        screenshotUrl: SCREENSHOTS[1],
        duration: "19:45 MIN",
      },
    ],
  });

  console.log("PostgreSQL seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
