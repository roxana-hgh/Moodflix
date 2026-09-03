import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/services/db/prisma";
import { headers } from "next/headers";


export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },

  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await prisma.list.createMany({
           data: [
            { userId: user.id, type: "WATCHLIST", name: "Watch Later", isPublic: false },
            { userId: user.id, type: "FAVORITE", name: "Favorites", isPublic: false },
            { userId: user.id, type: "WATCHED", name: "Watched", isPublic: false },
          ],
          });
        },
      },
    },
  },
});


export async function getCurrentUserId(): Promise<string | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user?.id ?? null;
}