import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

// Helper to create localized SVG placeholder images if needed
function ensureLocalPlaceholderImages() {
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const avatars = [
    { name: "rohan.svg", color: "#FFB59E", text: "R" },
    { name: "arjun.svg", color: "#E9C349", text: "A" },
    { name: "sourik.svg", color: "#2492FF", text: "S" },
    { name: "kunal.svg", color: "#FF571A", text: "K" },
    { name: "knox.svg", color: "#A5C8FF", text: "X" },
  ];

  for (const av of avatars) {
    const filePath = path.join(uploadsDir, av.name);
    if (!fs.existsSync(filePath)) {
      const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <rect width="200" height="200" rx="100" fill="#171717"/>
        <circle cx="100" cy="100" r="90" fill="none" stroke="${av.color}" stroke-width="4"/>
        <text x="100" y="125" font-family="Sora, sans-serif" font-size="72" font-weight="bold" fill="${av.color}" text-anchor="middle">${av.text}</text>
      </svg>`;
      fs.writeFileSync(filePath, svgContent);
    }
  }

  const matchScreenshots = ["match1.svg", "match2.svg", "match3.svg", "match4.svg", "match5.svg"];
  for (let i = 0; i < matchScreenshots.length; i++) {
    const filename = matchScreenshots[i];
    const filePath = path.join(uploadsDir, filename);
    if (!fs.existsSync(filePath)) {
      const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
        <rect width="1280" height="720" fill="#0A0A0A"/>
        <rect x="20" y="20" width="1240" height="680" rx="16" fill="#131313" stroke="#262626" stroke-width="2"/>
        <text x="640" y="320" font-family="Sora, sans-serif" font-size="48" font-weight="bold" fill="#FFB59E" text-anchor="middle">BGMI MATCH #${i + 1} PROOF</text>
        <text x="640" y="400" font-family="JetBrains Mono, monospace" font-size="24" fill="#AD897E" text-anchor="middle">VICTORY HUMAN SQUAD - SECTOR 7G</text>
        <circle cx="640" cy="500" r="40" fill="#FF4D00" opacity="0.3"/>
        <text x="640" y="510" font-family="Sora, sans-serif" font-size="32" font-weight="bold" fill="#E5E2E1" text-anchor="middle">FRAGX</text>
      </svg>`;
      fs.writeFileSync(filePath, svgContent);
    }
  }
}

async function main() {
  ensureLocalPlaceholderImages();

  console.log("Seeding database...");

  // Clean existing data
  await prisma.match.deleteMany({});
  await prisma.gamingSession.deleteMany({});
  await prisma.player.deleteMany({});

  // 1. Create Players
  const rohan = await prisma.player.create({
    data: {
      name: "Rohan",
      avatarUrl: "/uploads/rohan.svg",
    },
  });

  const arjun = await prisma.player.create({
    data: {
      name: "Arjun",
      avatarUrl: "/uploads/arjun.svg",
    },
  });

  const sourik = await prisma.player.create({
    data: {
      name: "Sourik",
      avatarUrl: "/uploads/sourik.svg",
    },
  });

  const kunal = await prisma.player.create({
    data: {
      name: "Kunal",
      avatarUrl: "/uploads/kunal.svg",
    },
  });

  const knox = await prisma.player.create({
    data: {
      name: "Knox",
      avatarUrl: "/uploads/knox.svg",
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
        screenshotUrl: "/uploads/match1.svg",
        duration: "21:45 MIN",
      },
      {
        sessionId: sessionAug13.id,
        matchNumber: 2,
        playerId: kunal.id,
        kills: 9,
        placement: 3,
        screenshotUrl: "/uploads/match2.svg",
        duration: "18:20 MIN",
      },
      {
        sessionId: sessionAug13.id,
        matchNumber: 3,
        playerId: rohan.id,
        kills: 18,
        placement: 1,
        screenshotUrl: "/uploads/match3.svg",
        duration: "24:10 MIN",
      },
      {
        sessionId: sessionAug13.id,
        matchNumber: 4,
        playerId: arjun.id,
        kills: 7,
        placement: 2,
        screenshotUrl: "/uploads/match4.svg",
        duration: "19:05 MIN",
      },
      {
        sessionId: sessionAug13.id,
        matchNumber: 5,
        playerId: sourik.id,
        kills: 14,
        placement: 1,
        screenshotUrl: "/uploads/match5.svg",
        duration: "22:30 MIN",
      },
      {
        sessionId: sessionAug13.id,
        matchNumber: 6,
        playerId: knox.id,
        kills: 0,
        placement: 15,
        screenshotUrl: "/uploads/match1.svg",
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
        screenshotUrl: "/uploads/match2.svg",
        duration: "20:00 MIN",
      },
      {
        sessionId: sessionAug12.id,
        matchNumber: 2,
        playerId: arjun.id,
        kills: 15,
        placement: 1,
        screenshotUrl: "/uploads/match3.svg",
        duration: "22:15 MIN",
      },
      {
        sessionId: sessionAug12.id,
        matchNumber: 3,
        playerId: sourik.id,
        kills: 6,
        placement: 4,
        screenshotUrl: "/uploads/match4.svg",
        duration: "14:40 MIN",
      },
      {
        sessionId: sessionAug12.id,
        matchNumber: 4,
        playerId: knox.id,
        kills: 2,
        placement: 8,
        screenshotUrl: "/uploads/match5.svg",
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
        screenshotUrl: "/uploads/match1.svg",
        duration: "21:00 MIN",
      },
      {
        sessionId: draftSession.id,
        matchNumber: 2,
        playerId: rohan.id,
        kills: 13,
        placement: 2,
        screenshotUrl: "/uploads/match2.svg",
        duration: "19:45 MIN",
      },
    ],
  });

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
