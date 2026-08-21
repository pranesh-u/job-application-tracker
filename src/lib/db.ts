import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * Gets or automatically creates a default Demo User
 * so the application works seamlessly without requiring authentication.
 */
export async function getOrCreateDemoUser() {
  const demoEmail = "demo@careerpulse.ai";
  
  let user = await prisma.user.findUnique({
    where: { email: demoEmail },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        id: "demo-user-id",
        name: "Demo Candidate",
        email: demoEmail,
        passwordHash: "no-auth-required",
        theme: "dark",
      },
    });
  }

  return user;
}
