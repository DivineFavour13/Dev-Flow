import { neon } from "@neondatabase/serverless";
import { PrismaNeonHTTP } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const sql = neon(process.env.DATABASE_URL!);
  const adapter = new PrismaNeonHTTP(sql);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;