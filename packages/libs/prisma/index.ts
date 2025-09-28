import { PrismaClient } from '@prisma/client';

declare global {
  namespace globalThis {
    var prisma: PrismaClient;
  }
}

export const prisma = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
