import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/services/db/prisma";
import { headers } from "next/headers";
import { connection } from "next/server";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },

  user: {
    additionalFields: {
      avatarUrl: {
        type: "string",
        required: false,
        input: false,
      },
    },
  },

  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await prisma.list.createMany({
            data: [
              {
                userId: user.id,
                type: "WATCHLIST",
                name: "Watch Later",
                isPublic: false,
              },
              {
                userId: user.id,
                type: "FAVORITE",
                name: "Favorites",
                isPublic: false,
              },
              {
                userId: user.id,
                type: "WATCHED",
                name: "Watched",
                isPublic: false,
              },
            ],
          });
        },
      },
    },
  },
});

export async function getCurrentUserId(): Promise<string | null> {
  // The session lookup hits the database. connection() keeps it (and everything that
  // depends on the user) out of every prerender, including per-session prefetches.
  await connection();
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user?.id ?? null;
}