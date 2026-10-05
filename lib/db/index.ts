import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// Reuse one Prisma client across hot reloads in development.
const globalForDb = globalThis as unknown as {
  prisma?: PrismaClient;
};

export function getDb(): PrismaClient {
  if (!globalForDb.prisma) {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error("DATABASE_URL is not set");
    }

    const adapter = new PrismaPg({
      connectionString,
      max: 5,
    });

    globalForDb.prisma = new PrismaClient({ adapter });
  }

  return globalForDb.prisma;
}
