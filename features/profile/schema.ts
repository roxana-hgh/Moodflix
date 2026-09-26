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

bio: z.string().trim().max(160, "Bio must be under 160 characters").optional(),
});

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const imageUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((f) => f.size <= MAX_IMAGE_SIZE, "Image must be under 5MB")
    .refine((f) => ACCEPTED_TYPES.includes(f.type), "Only JPEG, PNG or WebP allowed"),
});



// Shape before parsing (what the form/inputs produce)
export type ProfileFormInput = z.input<typeof updateProfileSchema>;
// Shape after parsing (what actions.ts / Prisma receive)
export type UpdateProfileInput = z.output<typeof updateProfileSchema>;