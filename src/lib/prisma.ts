import { PrismaClient } from '@prisma/client';

declare global {
  // Evita múltiplas instâncias do Prisma Client durante hot reload no desenvolvimento.
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
