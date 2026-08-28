import "server-only";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/services/db/prisma";
import { toProfile, type Profile } from "./types";

export async function getCurrentUserProfile(): Promise<Profile | null> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  return user ? toProfile(user) : null;
}