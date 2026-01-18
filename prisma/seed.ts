import { PrismaClient } from "@prisma/client";

// For Prisma 7 with SQLite, we need to pass empty options
const prisma = new PrismaClient({
  // Empty options object is required
} as any);

async function main() {
  console.log("Seeding database...");

  // Create test events
  const event1 = await prisma.event.create({
    data: {
      name: "Summer Camp 2026",
      description:
        "Join us for an amazing summer camping experience! Enjoy hiking, swimming, campfire stories, and making new friends. Perfect for families and nature enthusiasts.",
      startDate: new Date("2026-07-15"),
      endDate: new Date("2026-07-20"),
      location: "Yosemite National Park, California",
      applicationDeadline: new Date("2026-06-01"),
      maxParticipants: 50,
      isActive: true,
    },
  });

  const event2 = await prisma.event.create({
    data: {
      name: "Fall Wilderness Retreat",
      description:
        "Experience the beautiful fall colors in the mountains. This retreat includes guided nature walks, outdoor cooking workshops, and wildlife observation.",
      startDate: new Date("2026-10-10"),
      endDate: new Date("2026-10-13"),
      location: "Great Smoky Mountains, Tennessee",
      applicationDeadline: new Date("2026-09-15"),
      maxParticipants: 30,
      isActive: true,
    },
  });

  const event3 = await prisma.event.create({
    data: {
      name: "Winter Camping Adventure",
      description:
        "For experienced campers who want to challenge themselves! Learn winter survival skills, snowshoeing, and cold-weather camping techniques.",
      startDate: new Date("2027-01-20"),
      endDate: new Date("2027-01-23"),
      location: "Rocky Mountain National Park, Colorado",
      applicationDeadline: new Date("2026-12-20"),
      maxParticipants: 20,
      isActive: true,
    },
  });

  const event4 = await prisma.event.create({
    data: {
      name: "Spring Break Beach Camp",
      description:
        "Enjoy the sun, sand, and surf at our beach camping event. Activities include kayaking, beach volleyball, tide pool exploration, and bonfire nights.",
      startDate: new Date("2026-03-25"),
      endDate: new Date("2026-03-29"),
      location: "Big Sur, California",
      applicationDeadline: new Date("2026-03-01"),
      maxParticipants: 40,
      isActive: true,
    },
  });

  console.log("Created events:");
  console.log("- " + event1.name);
  console.log("- " + event2.name);
  console.log("- " + event3.name);
  console.log("- " + event4.name);

  console.log("\nSeeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
