import cors from "@fastify/cors";
import Fastify from "fastify";
import { randomUUID } from "node:crypto";
import { z } from "zod";

const createTaskSchema = z.object({
  title: z.string().min(3)
});

export type Task = {
  id: string;
  title: string;
  done: boolean;
};

export function buildApp() {
  const app = Fastify({
    logger: process.env.NODE_ENV !== "test"
  });

  const tasks: Task[] = [
    {
      id: "seed-1",
      title: "Define API contracts",
      done: false
    }
  ];

  void app.register(cors, { origin: true });

  app.get("/health", async () => {
    return {
      status: "ok",
      service: "fastify-zod-boilerplate"
    };
  });

  app.get("/tasks", async () => {
    return { items: tasks };
  });

  app.post("/tasks", async (request, reply) => {
    const parsed = createTaskSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: "INVALID_BODY",
        issues: parsed.error.flatten()
      });
    }

    const task: Task = {
      id: randomUUID(),
      title: parsed.data.title,
      done: false
    };
    tasks.unshift(task);

    return reply.status(201).send(task);
  });

  return app;
}
