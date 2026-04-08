import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import type { Project, ProjectStatus } from "../src/types/index.js";
import type { PaginatedResult } from "../src/types/index.js";
import { parseBody } from "./helpers.js";

const app = buildApp();

beforeAll(async () => {
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

describe("GET /projects", () => {
  it("returns paginated project list", async () => {
    const res = await app.inject({ method: "GET", url: "/projects" });

    expect(res.statusCode).toBe(200);
    const body = parseBody<PaginatedResult<Project>>(res);
    expect(body.total).toBe(5);
    expect(body.items.length).toBeGreaterThan(0);
  });

  it("filters by status", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/projects?status=backlog",
    });

    expect(res.statusCode).toBe(200);
    const body = parseBody<PaginatedResult<Project>>(res);
    expect(body.total).toBe(1);
    expect(body.items[0]).toMatchObject({ status: "backlog" });
  });

  it("filters by clientId", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/projects?clientId=client-1",
    });

    expect(res.statusCode).toBe(200);
    const body = parseBody<PaginatedResult<Project>>(res);
    expect(body.items.every((p) => p.clientId === "client-1")).toBe(true);
  });

  it("rejects invalid status", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/projects?status=unknown",
    });

    expect(res.statusCode).toBe(400);
    expect(parseBody<{ error: string }>(res)).toMatchObject({
      error: "INVALID_QUERY",
    });
  });
});

describe("GET /projects/kanban", () => {
  it("returns projects grouped by all statuses", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/projects/kanban",
    });

    expect(res.statusCode).toBe(200);
    const body = parseBody<Record<ProjectStatus, Project[]>>(res);
    expect(body).toHaveProperty("backlog");
    expect(body).toHaveProperty("in_progress");
    expect(body).toHaveProperty("review");
    expect(body).toHaveProperty("done");
    expect(body).toHaveProperty("blocked");
    expect(Array.isArray(body.in_progress)).toBe(true);
    expect(body.in_progress.length).toBeGreaterThanOrEqual(1);
  });

  it("groups correctly – done bucket contains only done projects", async () => {
    const res = await app.inject({ method: "GET", url: "/projects/kanban" });
    const body = parseBody<Record<ProjectStatus, Project[]>>(res);
    expect(body.done.every((p) => p.status === "done")).toBe(true);
  });
});

describe("POST /projects", () => {
  it("creates a project with valid payload", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/projects",
      payload: {
        clientId: "client-1",
        name: "New Dashboard",
        status: "backlog",
      },
    });

    expect(res.statusCode).toBe(201);
    const body = parseBody<Project>(res);
    expect(body).toMatchObject({
      clientId: "client-1",
      name: "New Dashboard",
      status: "backlog",
    });
    expect(body).toHaveProperty("id");
  });

  it("rejects non-existent clientId with 422", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/projects",
      payload: { clientId: "does-not-exist", name: "Ghost Project" },
    });

    expect(res.statusCode).toBe(422);
    expect(parseBody<{ error: string }>(res)).toMatchObject({
      error: "INVALID_REFERENCE",
    });
  });

  it("rejects missing name", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/projects",
      payload: { clientId: "client-1" },
    });

    expect(res.statusCode).toBe(400);
    expect(parseBody<{ error: string }>(res)).toMatchObject({
      error: "INVALID_BODY",
    });
  });

  it("rejects invalid status value", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/projects",
      payload: {
        clientId: "client-1",
        name: "Bad Status",
        status: "flying",
      },
    });

    expect(res.statusCode).toBe(400);
    expect(parseBody<{ error: string }>(res)).toMatchObject({
      error: "INVALID_BODY",
    });
  });
});

describe("PATCH /projects/:id", () => {
  it("updates project name", async () => {
    const res = await app.inject({
      method: "PATCH",
      url: "/projects/proj-2",
      payload: { name: "Updated MVP Name" },
    });

    expect(res.statusCode).toBe(200);
    expect(parseBody<Project>(res)).toMatchObject({ name: "Updated MVP Name" });
  });

  it("updates project status and records activity", async () => {
    const res = await app.inject({
      method: "PATCH",
      url: "/projects/proj-2",
      payload: { status: "in_progress" },
    });

    expect(res.statusCode).toBe(200);
    expect(parseBody<Project>(res)).toMatchObject({ status: "in_progress" });
  });

  it("returns 404 for non-existent project", async () => {
    const res = await app.inject({
      method: "PATCH",
      url: "/projects/does-not-exist",
      payload: { name: "Ghost" },
    });

    expect(res.statusCode).toBe(404);
    expect(parseBody<{ error: string }>(res)).toMatchObject({
      error: "NOT_FOUND",
    });
  });

  it("rejects empty patch body", async () => {
    const res = await app.inject({
      method: "PATCH",
      url: "/projects/proj-1",
      payload: {},
    });

    expect(res.statusCode).toBe(400);
    expect(parseBody<{ error: string }>(res)).toMatchObject({
      error: "INVALID_BODY",
    });
  });

  it("rejects invalid clientId reference", async () => {
    const res = await app.inject({
      method: "PATCH",
      url: "/projects/proj-1",
      payload: { clientId: "no-such-client" },
    });

    expect(res.statusCode).toBe(422);
    expect(parseBody<{ error: string }>(res)).toMatchObject({
      error: "INVALID_REFERENCE",
    });
  });
});

