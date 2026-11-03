import "server-only";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/services/db/prisma";
import { toProfile, type Profile } from "./types";

export async function getCurrentUserProfile(): Promise<Profile | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const user = await prisma.user.findUnique({ where: { id: userId } });

  return user ? toProfile(user) : null;
}