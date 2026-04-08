import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { Store } from "../store/index.js";
import type { Project, ProjectStatus } from "../types/index.js";
import { paginate, paginationSchema } from "../utils/paginate.js";

export const projectStatusSchema = z.enum([
  "backlog",
  "in_progress",
  "review",
  "done",
  "blocked",
]);

export const createProjectSchema = z.object({
  clientId: z.string().min(1),
  name: z.string().min(2).max(150),
  description: z.string().max(500).optional(),
  status: projectStatusSchema.default("backlog"),
  dueDate: z.string().optional(),
});

export const updateProjectSchema = z
  .object({
    clientId: z.string().min(1).optional(),
    name: z.string().min(2).max(150).optional(),
    description: z.string().max(500).optional(),
    status: projectStatusSchema.optional(),
    dueDate: z.string().optional(),
  })
  .refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: "At least one field must be provided",
  });

export const listProjectsQuerySchema = paginationSchema.extend({
  status: projectStatusSchema.optional(),
  clientId: z.string().optional(),
  sort: z
    .enum(["name", "createdAt", "updatedAt", "dueDate"])
    .default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ListProjectsQuery = z.infer<typeof listProjectsQuerySchema>;

export function createProjectsService(store: Store) {
  function list(query: ListProjectsQuery) {
    let filtered = [...store.projects];

    if (query.status) {
      filtered = filtered.filter((p) => p.status === query.status);
    }
    if (query.clientId) {
      filtered = filtered.filter((p) => p.clientId === query.clientId);
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

  function getById(id: string): Project | undefined {
    return store.projects.find((p) => p.id === id);
  }

  function getKanban(): Record<ProjectStatus, Project[]> {
    const result: Record<ProjectStatus, Project[]> = {
      backlog: [],
      in_progress: [],
      review: [],
      done: [],
      blocked: [],
    };
    for (const project of store.projects) {
      result[project.status].push(project);
    }
    return result;
  }

  function create(input: CreateProjectInput): Project {
    const now = new Date().toISOString();
    const project: Project = {
      id: randomUUID(),
      clientId: input.clientId,
      name: input.name,
      description: input.description,
      status: input.status,
      dueDate: input.dueDate,
      createdAt: now,
      updatedAt: now,
    };
    store.projects.unshift(project);

    store.activityFeed.unshift({
      id: randomUUID(),
      type: "project_created",
      description: `Project '${project.name}' was created`,
      entityId: project.id,
      projectId: project.id,
      createdAt: now,
    });

    return project;
  }

  function update(id: string, input: UpdateProjectInput): Project | undefined {
    const idx = store.projects.findIndex((p) => p.id === id);
    if (idx === -1) return undefined;

    const existing = store.projects[idx];
    const now = new Date().toISOString();
    const prevStatus = existing.status;

    const patch: Partial<Project> = {};
    if (input.clientId !== undefined) patch.clientId = input.clientId;
    if (input.name !== undefined) patch.name = input.name;
    if (input.description !== undefined) patch.description = input.description;
    if (input.status !== undefined) patch.status = input.status;
    if (input.dueDate !== undefined) patch.dueDate = input.dueDate;

    const updated: Project = { ...existing, ...patch, updatedAt: now };
    store.projects[idx] = updated;

    if (input.status !== undefined && input.status !== prevStatus) {
      store.activityFeed.unshift({
        id: randomUUID(),
        type: "project_status_changed",
        description: `Project '${updated.name}' moved to ${input.status}`,
        entityId: id,
        projectId: id,
        createdAt: now,
      });
    }

    return updated;
  }

  return { list, getById, getKanban, create, update };
}

export type ProjectsService = ReturnType<typeof createProjectsService>;
