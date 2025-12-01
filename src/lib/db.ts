// Database client for NeuroTune
// Note: Run `npx prisma generate` to generate the Prisma client
// Run `npx prisma db push` to sync the schema with your database

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-require-imports */

declare global {
  // eslint-disable-next-line no-var
  var prisma: any | undefined;
}

let prisma: any = null;

try {
  // Dynamic import to handle cases where Prisma client hasn't been generated yet
  const { PrismaClient } = require('@prisma/client');
  
  prisma = global.prisma || new PrismaClient();
  
  if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma;
  }
} catch {
  // Prisma client not generated yet - this is fine during build
  console.warn('Prisma client not available. Run `npx prisma generate` to generate it.');
}

export { prisma };
export default prisma;
