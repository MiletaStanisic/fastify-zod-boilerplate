import { z } from "zod";
import type { PaginatedResult } from "../types/index.js";

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export function paginate<T>(
  items: T[],
  page: number,
  limit: number,
): PaginatedResult<T> {
  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  const end = start + limit;
  return {
    items: items.slice(start, end),
    total,
    page,
    limit,
    pages,
  };
}
