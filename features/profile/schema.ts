import { z } from "zod";

export const genderEnum = z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]);

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be under 50 characters"),
  age: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => {
      if (val === undefined || val === "") return undefined;
      return typeof val === "string" ? Number(val) : val;
    })
    .refine((val) => val === undefined || (val >= 13 && val <= 120), {
      message: "Enter a valid age (13-120)",
    }),
  gender: genderEnum.optional(),
});

// Shape before parsing (what the form/inputs produce)
export type ProfileFormInput = z.input<typeof updateProfileSchema>;
// Shape after parsing (what actions.ts / Prisma receive)
export type UpdateProfileInput = z.output<typeof updateProfileSchema>;