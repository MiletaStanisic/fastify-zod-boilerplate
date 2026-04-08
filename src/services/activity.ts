import { z } from "zod";
import type { Store } from "../store/index.js";

export const listActivityQuerySchema = z.object({
  projectId: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type ListActivityQuery = z.infer<typeof listActivityQuerySchema>;

export function createActivityService(store: Store) {
  function list(query: ListActivityQuery) {
    let items = [...store.activityFeed];

    if (query.projectId) {
      items = items.filter((a) => a.projectId === query.projectId);
    }

    items.sort((a, b) =>
      a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0,
    );

    return {
      items: items.slice(0, query.limit),
      total: items.length,
      limit: query.limit,
    };
  }

  return { list };
}

export type ActivityService = ReturnType<typeof createActivityService>;
