import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { Store } from "../store/index.js";
import type { Client } from "../types/index.js";
import { paginate, paginationSchema } from "../utils/paginate.js";

export const createClientSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(5).max(30).optional(),
});

export const listClientsQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
  sort: z.enum(["name", "createdAt"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type ListClientsQuery = z.infer<typeof listClientsQuerySchema>;

export function createClientsService(store: Store) {
  function list(query: ListClientsQuery) {
    let filtered = [...store.clients];

    if (query.search) {
      const q = query.search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q),
      );
    }

    const key = query.sort;
    filtered.sort((a, b) => {
      const av = a[key];
      const bv = b[key];
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return query.order === "asc" ? cmp : -cmp;
    });

    return paginate(filtered, query.page, query.limit);
  }

  function getById(id: string): Client | undefined {
    return store.clients.find((c) => c.id === id);
  }

  function create(input: CreateClientInput): Client {
    const now = new Date().toISOString();
    const client: Client = {
      id: randomUUID(),
      ...input,
      createdAt: now,
    };
    store.clients.unshift(client);

    store.activityFeed.unshift({
      id: randomUUID(),
      type: "client_created",
      description: `Client '${client.name}' was added`,
      entityId: client.id,
      createdAt: now,
    });

    return client;
  }

  return { list, getById, create };
}

export type ClientsService = ReturnType<typeof createClientsService>;
