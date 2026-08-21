const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create demo user
  const passwordHash = await bcrypt.hash("password123", 12);
  
  let user = await prisma.user.findUnique({
    where: { email: "demo@careerai.com" },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: "Demo User",
        email: "demo@careerai.com",
        passwordHash,
      },
    });
  }

  console.log(`✅ Created user: ${user.email}`);

  // Delete existing applications for clean reseed
  await prisma.application.deleteMany({ where: { userId: user.id } });

  // Create sample applications
  const applications = [
    {
      company: "Google",
      role: "Software Engineer L4",
      location: "Mountain View, CA",
      jobUrl: "https://careers.google.com",
      priority: "Critical",
      stage: "Technical Interview",
      notes: "Referred by Alex. 3rd round upcoming.",
      deadline: new Date("2026-08-15"),
      applicationDate: new Date("2026-07-10"),
    },
    {
      company: "Meta",
      role: "Full Stack Engineer",
      location: "Menlo Park, CA",
      priority: "High",
      stage: "Applied",
      notes: "Applied via careers page",
      applicationDate: new Date("2026-07-25"),
    },
    {
      company: "Stripe",
      role: "Backend Engineer",
      location: "San Francisco, CA",
      priority: "High",
      stage: "Online Assessment",
      notes: "OA received. Deadline in 3 days.",
      deadline: new Date("2026-08-02"),
      applicationDate: new Date("2026-07-20"),
    },
    {
      company: "Netflix",
      role: "Senior Software Engineer",
      location: "Los Gatos, CA",
      priority: "Medium",
      stage: "Wishlist",
      notes: "Great culture. Need to prepare system design.",
    },
    {
      company: "Amazon",
      role: "SDE II",
      location: "Seattle, WA",
      priority: "High",
      stage: "HR Interview",
      notes: "Leadership principles prep needed",
      applicationDate: new Date("2026-07-15"),
    },
    {
      company: "Microsoft",
      role: "Software Engineer",
      location: "Redmond, WA",
      priority: "Medium",
      stage: "Applied",
      notes: "Applied to Azure team",
      applicationDate: new Date("2026-07-28"),
    },
    {
      company: "Apple",
      role: "iOS Engineer",
      location: "Cupertino, CA",
      priority: "Medium",
      stage: "Preparing",
      notes: "Need to work on Swift projects",
    },
    {
      company: "Coinbase",
      role: "Backend Engineer",
      location: "Remote",
      priority: "Low",
      stage: "Rejected",
      notes: "Received rejection email",
      applicationDate: new Date("2026-07-05"),
    },
    {
      company: "Figma",
      role: "Full Stack Engineer",
      location: "San Francisco, CA",
      priority: "High",
      stage: "Offer",
      notes: "Offer received! $185k base + equity",
      applicationDate: new Date("2026-07-01"),
    },
    {
      company: "Vercel",
      role: "Software Engineer",
      location: "Remote",
      priority: "Medium",
      stage: "Wishlist",
      notes: "Next.js team - dream role",
    },
    {
      company: "Datadog",
      role: "Platform Engineer",
      location: "New York, NY",
      priority: "Low",
      stage: "Applied",
      applicationDate: new Date("2026-07-22"),
    },
    {
      company: "Notion",
      role: "Frontend Engineer",
      location: "San Francisco, CA",
      priority: "High",
      stage: "Preparing",
      notes: "Portfolio review stage. Need to polish projects.",
    },
  ];

  for (let i = 0; i < applications.length; i++) {
    const app = applications[i];
    await prisma.application.create({
      data: {
        userId: user.id,
        company: app.company,
        role: app.role,
        location: app.location,
        jobUrl: app.jobUrl || null,
        priority: app.priority,
        stage: app.stage,
        notes: app.notes || null,
        deadline: app.deadline || null,
        applicationDate: app.applicationDate || null,
        kanbanOrder: i,
        timelineEvents: {
          create: {
            eventType: "created",
            title: "Application Created",
            description: `Application for ${app.role} at ${app.company} was created`,
          },
        },
      },
    });
  }

  console.log(`✅ Created ${applications.length} sample applications`);
  console.log("\n🎉 Seed complete!");
  console.log("   Login with: demo@careerai.com / password123\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
