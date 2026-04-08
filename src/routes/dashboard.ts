import type { FastifyInstance } from "fastify";
import type { DashboardService } from "../services/dashboard.js";

export function registerDashboardRoutes(
  app: FastifyInstance,
  dashboard: DashboardService,
): void {
  app.get("/dashboard/summary", async () => {
    return dashboard.getSummary();
  });
}
