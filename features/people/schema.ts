import { z } from "zod";

export const personIdSchema = z.coerce.number().int().positive();