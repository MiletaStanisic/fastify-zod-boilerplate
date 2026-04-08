import cors from "@fastify/cors";
import Fastify from "fastify";
import { env } from "./config/env.js";
import { getOpenApiDocument, getSwaggerHtml } from "./docs/openapi.js";
import { createStore } from "./store/index.js";
import { createActivityService } from "./services/activity.js";
import { createClientsService } from "./services/clients.js";
import { createDashboardService } from "./services/dashboard.js";
import { createProjectsService } from "./services/projects.js";
import { createTasksService } from "./services/tasks.js";
import { registerActivityRoutes } from "./routes/activity.js";
import { registerClientsRoutes } from "./routes/clients.js";
import { registerDashboardRoutes } from "./routes/dashboard.js";
import { registerHealthRoutes } from "./routes/health.js";
import { registerProjectsRoutes } from "./routes/projects.js";

export function buildApp() {
  const app = Fastify({
    logger: process.env.NODE_ENV !== "test",
  });

  const store = createStore();
  const clients = createClientsService(store);
  const projectsService = createProjectsService(store);
  const tasksService = createTasksService(store);
  const activity = createActivityService(store);
  const dashboard = createDashboardService(store);

  void app.register(cors, { origin: true });

  registerHealthRoutes(app);
  registerClientsRoutes(app, clients);
  registerProjectsRoutes(app, projectsService, tasksService, clients);
  registerDashboardRoutes(app, dashboard);
  registerActivityRoutes(app, activity);

  app.get("/openapi.json", async () => getOpenApiDocument(env.PORT));
  app.get("/docs", async (_req, rep) => {
    return rep.type("text/html").send(getSwaggerHtml());
  });

  return app;
}
