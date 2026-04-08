import type { FastifyInstance } from "fastify";
import { invalidQuery } from "../errors/index.js";
import {
  listActivityQuerySchema,
  type ActivityService,
} from "../services/activity.js";

export function registerActivityRoutes(
  app: FastifyInstance,
  activity: ActivityService,
): void {
  app.get("/activity-feed", async (req, rep) => {
    const parsed = listActivityQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return rep.status(400).send(invalidQuery(parsed.error.flatten()));
    }
    return rep.send(activity.list(parsed.data));
  });
}
