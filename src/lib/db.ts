// Database client for NeuroTune
// Note: Run `npx prisma generate` to generate the Prisma client
// Run `npx prisma db push` to sync the schema with your database

// This is a stub implementation that works without Prisma being generated
// Once you run `npx prisma generate`, you can switch to the real implementation

export interface DatabaseClient {
  user: {
    findUnique: (args: { where: { id?: string; email?: string }; include?: Record<string, unknown> }) => Promise<unknown>;
    upsert: (args: { where: { email: string }; create: unknown; update: unknown; include?: Record<string, unknown> }) => Promise<unknown>;
  };
  userPreferences: {
    upsert: (args: { where: { userId: string }; create: unknown; update: unknown }) => Promise<unknown>;
  };
  generatedPlaylist: {
    findMany: (args: { where: { userId: string }; orderBy: Record<string, string> }) => Promise<unknown[]>;
    create: (args: { data: unknown }) => Promise<unknown>;
  };
  userContextHistory: {
    create: (args: { data: unknown }) => Promise<unknown>;
  };
}

// Stub client that returns null for all operations
// Replace with real Prisma client once generated
const stubClient: DatabaseClient = {
  user: {
    findUnique: async () => null,
    upsert: async () => null,
  },
  userPreferences: {
    upsert: async () => null,
  },
  generatedPlaylist: {
    findMany: async () => [],
    create: async () => null,
  },
  userContextHistory: {
    create: async () => null,
  },
};

let prisma: DatabaseClient | null = null;

export async function getPrismaClient(): Promise<DatabaseClient | null> {
  if (prisma) return prisma;
  
  // Check if we have a DATABASE_URL configured
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not set. Using stub database client.');
    prisma = stubClient;
    return prisma;
  }
  
  try {
    // Try to use the real Prisma client if generated
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const PrismaModule = require('@prisma/client');
    if (PrismaModule.PrismaClient) {
      prisma = new PrismaModule.PrismaClient();
      return prisma;
    }
  } catch {
    console.warn('Prisma client not available. Using stub client. Run `npx prisma generate` to generate it.');
  }
  
  prisma = stubClient;
  return prisma;
}

export { prisma };
export default prisma;
