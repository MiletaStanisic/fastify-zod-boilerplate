import type { FastifyInstance } from "fastify";
import { invalidBody, invalidQuery } from "../errors/index.js";
import {
  createClientSchema,
  listClientsQuerySchema,
  type ClientsService,
} from "../services/clients.js";

export function registerClientsRoutes(
  app: FastifyInstance,
  service: ClientsService,
): void {
  app.get("/clients", async (req, rep) => {
    const parsed = listClientsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return rep.status(400).send(invalidQuery(parsed.error.flatten()));
    }
    return rep.send(service.list(parsed.data));
  });

  app.post("/clients", async (req, rep) => {
    const parsed = createClientSchema.safeParse(req.body);
    if (!parsed.success) {
      return rep.status(400).send(invalidBody(parsed.error.flatten()));
    }
    const client = service.create(parsed.data);
    return rep.status(201).send(client);
  });
}
