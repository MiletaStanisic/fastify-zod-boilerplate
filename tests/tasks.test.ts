import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import type { ProjectTask } from "../src/types/index.js";
import type { PaginatedResult } from "../src/types/index.js";
import { parseBody } from "./helpers.js";

const app = buildApp();

beforeAll(async () => {
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

describe("GET /projects/:id/tasks", () => {
  it("returns tasks for an existing project", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/projects/proj-1/tasks",
    });

    expect(res.statusCode).toBe(200);
    const body = parseBody<PaginatedResult<ProjectTask>>(res);
    expect(body.total).toBe(4);
    expect(body.items.every((t) => t.projectId === "proj-1")).toBe(true);
  });

  it("filters tasks by done=true", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/projects/proj-1/tasks?done=true",
    });

    expect(res.statusCode).toBe(200);
    const body = parseBody<PaginatedResult<ProjectTask>>(res);
    expect(body.items.every((t) => t.done === true)).toBe(true);
  });

  it("filters tasks by done=false", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/projects/proj-1/tasks?done=false",
    });

    expect(res.statusCode).toBe(200);
    const body = parseBody<PaginatedResult<ProjectTask>>(res);
    expect(body.items.every((t) => t.done === false)).toBe(true);
  });

  it("returns 404 for non-existent project", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/projects/ghost-project/tasks",
    });

    expect(res.statusCode).toBe(404);
    expect(parseBody<{ error: string }>(res)).toMatchObject({ error: "NOT_FOUND" });
  });

  it("rejects invalid done value", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/projects/proj-1/tasks?done=maybe",
    });

    expect(res.statusCode).toBe(400);
    expect(parseBody<{ error: string }>(res)).toMatchObject({ error: "INVALID_QUERY" });
  });

  it("paginates tasks", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/projects/proj-1/tasks?page=1&limit=2",
    });

    expect(res.statusCode).toBe(200);
    const body = parseBody<PaginatedResult<ProjectTask>>(res);
    expect(body.items).toHaveLength(2);
    expect(body.total).toBe(4);
    expect(body.pages).toBe(2);
  });
});

describe("POST /projects/:id/tasks", () => {
  it("creates a task for an existing project", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/projects/proj-1/tasks",
      payload: { title: "Write release notes" },
    });

    expect(res.statusCode).toBe(201);
    const body = parseBody<ProjectTask>(res);
    expect(body).toMatchObject({
      projectId: "proj-1",
      title: "Write release notes",
      done: false,
    });
    expect(body).toHaveProperty("id");
  });

  it("creates a task with all optional fields", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/projects/proj-2/tasks",
      payload: {
        title: "Full task",
        description: "With all fields",
        assignee: "Jane Dev",
        dueDate: "2026-12-31T00:00:00Z",
      },
    });

    expect(res.statusCode).toBe(201);
    expect(parseBody<ProjectTask>(res)).toMatchObject({
      assignee: "Jane Dev",
      description: "With all fields",
    });
  });

  it("returns 404 for non-existent project", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/projects/ghost/tasks",
      payload: { title: "Orphan task" },
    });

    expect(res.statusCode).toBe(404);
    expect(parseBody<{ error: string }>(res)).toMatchObject({ error: "NOT_FOUND" });
  });

  it("rejects title shorter than 2 chars", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/projects/proj-1/tasks",
      payload: { title: "X" },
    });

    expect(res.statusCode).toBe(400);
    expect(parseBody<{ error: string }>(res)).toMatchObject({ error: "INVALID_BODY" });
  });

  it("rejects missing title", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/projects/proj-1/tasks",
      payload: { description: "No title here" },
    });

    expect(res.statusCode).toBe(400);
    expect(parseBody<{ error: string }>(res)).toMatchObject({ error: "INVALID_BODY" });
  });
});
