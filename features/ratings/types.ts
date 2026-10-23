export type RatingStats = { average: number | null; count: number };
export type UserRating = { score: number; comment: string | null };
export type ActionResult = { ok: true } | { ok: false; error: string };