"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/services/db/prisma";
import { updateProfileSchema, type UpdateProfileInput } from "./schema";

type ActionResult = { success: true } | { success: false; error: string };

export async function updateProfile(
  input: UpdateProfileInput
): Promise<ActionResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { success: false, error: "Not authenticated" };

  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: parsed.data.name,
      age: parsed.data.age ?? null,
      gender: parsed.data.gender ?? null,
    },
  });

  revalidatePath("/profile");
  return { success: true };
}