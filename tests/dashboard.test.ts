import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import type { Project, ProjectStatus, ProjectTask } from "../src/types/index.js";
import { parseBody } from "./helpers.js";

type DashboardSummary = {
  totalClients: number;
  totalProjects: number;
  totalTasks: number;
  projectsByStatus: Record<ProjectStatus, number>;
  activeProjectsCount: number;
  activeProjects: Project[];
  overdueTasksCount: number;
  overdueTasks: ProjectTask[];
};

const app = buildApp();

beforeAll(async () => {
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

describe("GET /dashboard/summary", () => {
  it("returns expected summary shape", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/dashboard/summary",
    });

    expect(res.statusCode).toBe(200);
    const body = parseBody<DashboardSummary>(res);

    expect(body).toHaveProperty("totalClients");
    expect(body).toHaveProperty("totalProjects");
    expect(body).toHaveProperty("totalTasks");
    expect(body).toHaveProperty("projectsByStatus");
    expect(body).toHaveProperty("activeProjectsCount");
    expect(body).toHaveProperty("activeProjects");
    expect(body).toHaveProperty("overdueTasksCount");
    expect(body).toHaveProperty("overdueTasks");
  });

  it("reflects correct seed counts", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/dashboard/summary",
    });

    const body = parseBody<DashboardSummary>(res);
    expect(body.totalClients).toBe(2);
    expect(body.totalProjects).toBe(5);
    expect(body.totalTasks).toBe(8);
  });

  it("projectsByStatus has all status keys with correct counts", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/dashboard/summary",
    });

    const { projectsByStatus } = parseBody<DashboardSummary>(res);
    expect(projectsByStatus).toMatchObject({
      backlog: 1,
      in_progress: 1,
      review: 1,
      done: 1,
      blocked: 1,
    });
  });

  it("activeProjects contains only in_progress and review projects", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/dashboard/summary",
    });

    const { activeProjects } = parseBody<DashboardSummary>(res);
    expect(
      activeProjects.every((p) =>
        (["in_progress", "review"] as ProjectStatus[]).includes(p.status),
      ),
    ).toBe(true);
    expect(activeProjects.length).toBe(2);
  });

  it("overdueTasks contains only incomplete past-due tasks", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/dashboard/summary",
    });

    const { overdueTasks } = parseBody<DashboardSummary>(res);
    expect(overdueTasks.every((t) => t.done === false)).toBe(true);
    // Seed has task-4 (proj-1) and task-8 (proj-5) as overdue
    expect(overdueTasks.length).toBeGreaterThanOrEqual(2);
  });
});
