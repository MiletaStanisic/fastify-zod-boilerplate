import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { Store } from "../store/index.js";
import type { ProjectTask } from "../types/index.js";
import { paginate, paginationSchema } from "../utils/paginate.js";

export const createTaskSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(1000).optional(),
  assignee: z.string().max(100).optional(),
  dueDate: z.string().optional(),
});

export const listTasksQuerySchema = paginationSchema.extend({
  done: z.enum(["true", "false"]).optional(),
  sort: z.enum(["title", "createdAt", "dueDate"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("asc"),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;

export function createTasksService(store: Store) {
  function listForProject(projectId: string, query: ListTasksQuery) {
    let filtered = store.tasks.filter((t) => t.projectId === projectId);

    if (query.done !== undefined) {
      const doneFilter = query.done === "true";
      filtered = filtered.filter((t) => t.done === doneFilter);
    }

    const key = query.sort;
    filtered.sort((a, b) => {
      const av = a[key] ?? "";
      const bv = b[key] ?? "";
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return query.order === "asc" ? cmp : -cmp;
    });

    return paginate(filtered, query.page, query.limit);
  }

  function create(projectId: string, input: CreateTaskInput): ProjectTask {
    const now = new Date().toISOString();
    const task: ProjectTask = {
      id: randomUUID(),
      projectId,
      title: input.title,
      description: input.description,
      assignee: input.assignee,
      dueDate: input.dueDate,
      done: false,
      createdAt: now,
      updatedAt: now,
    };
    store.tasks.push(task);

    store.activityFeed.unshift({
      id: randomUUID(),
      type: "task_created",
      description: `Task '${task.title}' was created`,
      entityId: task.id,
      projectId,
      createdAt: now,
    });

    return task;
  }

  return { listForProject, create };
}

export type TasksService = ReturnType<typeof createTasksService>;
