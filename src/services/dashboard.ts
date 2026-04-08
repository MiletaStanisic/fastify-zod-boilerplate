import type { Store } from "../store/index.js";
import type { ProjectStatus } from "../types/index.js";

export function createDashboardService(store: Store) {
  function getSummary() {
    const now = new Date().toISOString();

    const projectsByStatus: Record<ProjectStatus, number> = {
      backlog: 0,
      in_progress: 0,
      review: 0,
      done: 0,
      blocked: 0,
    };
    for (const p of store.projects) {
      projectsByStatus[p.status]++;
    }

    const activeProjects = store.projects.filter(
      (p) => p.status === "in_progress" || p.status === "review",
    );

    const overdueTasks = store.tasks.filter(
      (t) => !t.done && t.dueDate !== undefined && t.dueDate < now,
    );

    return {
      totalClients: store.clients.length,
      totalProjects: store.projects.length,
      totalTasks: store.tasks.length,
      projectsByStatus,
      activeProjectsCount: activeProjects.length,
      activeProjects,
      overdueTasksCount: overdueTasks.length,
      overdueTasks: overdueTasks.slice(0, 10),
    };
  }

  return { getSummary };
}

export type DashboardService = ReturnType<typeof createDashboardService>;
