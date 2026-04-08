import type { FastifyInstance } from "fastify";
import {
  invalidBody,
  invalidQuery,
  invalidReference,
  notFound,
} from "../errors/index.js";
import type { ClientsService } from "../services/clients.js";
import {
  createProjectSchema,
  listProjectsQuerySchema,
  updateProjectSchema,
  type ProjectsService,
} from "../services/projects.js";
import {
  createTaskSchema,
  listTasksQuerySchema,
  type TasksService,
} from "../services/tasks.js";

export function registerProjectsRoutes(
  app: FastifyInstance,
  projects: ProjectsService,
  tasks: TasksService,
  clients: ClientsService,
): void {
  // Static route must be declared before parametric /:id
  // Fastify gives priority to static segments anyway, but declaring first is explicit.
  app.get("/projects/kanban", async () => {
    return projects.getKanban();
  });

  app.get("/projects", async (req, rep) => {
    const parsed = listProjectsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return rep.status(400).send(invalidQuery(parsed.error.flatten()));
    }
    return rep.send(projects.list(parsed.data));
  });

  app.post("/projects", async (req, rep) => {
    const parsed = createProjectSchema.safeParse(req.body);
    if (!parsed.success) {
      return rep.status(400).send(invalidBody(parsed.error.flatten()));
    }
    if (!clients.getById(parsed.data.clientId)) {
      return rep.status(422).send(invalidReference("clientId"));
    }
    const project = projects.create(parsed.data);
    return rep.status(201).send(project);
  });

  app.patch("/projects/:id", async (req, rep) => {
    const { id } = req.params as { id: string };

    const parsed = updateProjectSchema.safeParse(req.body);
    if (!parsed.success) {
      return rep.status(400).send(invalidBody(parsed.error.flatten()));
    }
    if (parsed.data.clientId && !clients.getById(parsed.data.clientId)) {
      return rep.status(422).send(invalidReference("clientId"));
    }

    const updated = projects.update(id, parsed.data);
    if (!updated) {
      return rep.status(404).send(notFound("Project"));
    }
    return rep.send(updated);
  });

  app.get("/projects/:id/tasks", async (req, rep) => {
    const { id } = req.params as { id: string };

    if (!projects.getById(id)) {
      return rep.status(404).send(notFound("Project"));
    }

    const parsed = listTasksQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return rep.status(400).send(invalidQuery(parsed.error.flatten()));
    }
    return rep.send(tasks.listForProject(id, parsed.data));
  });

  app.post("/projects/:id/tasks", async (req, rep) => {
    const { id } = req.params as { id: string };

    if (!projects.getById(id)) {
      return rep.status(404).send(notFound("Project"));
    }

    const parsed = createTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      return rep.status(400).send(invalidBody(parsed.error.flatten()));
    }
    const task = tasks.create(id, parsed.data);
    return rep.status(201).send(task);
  });
}
