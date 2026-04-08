import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import type { Client } from "../src/types/index.js";
import type { PaginatedResult } from "../src/types/index.js";
import { parseBody } from "./helpers.js";

const app = buildApp();

beforeAll(async () => {
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

describe("GET /clients", () => {
  it("returns paginated list with seed data", async () => {
    const res = await app.inject({ method: "GET", url: "/clients" });

    expect(res.statusCode).toBe(200);
    const body = parseBody<PaginatedResult<Client>>(res);
    expect(body).toMatchObject({ total: 2, page: 1, limit: 20, pages: 1 });
    expect(body.items).toHaveLength(2);
  });

  it("filters by search query", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/clients?search=acme",
    });

    expect(res.statusCode).toBe(200);
    const body = parseBody<PaginatedResult<Client>>(res);
    expect(body.total).toBe(1);
    expect(body.items[0]).toMatchObject({ name: "Acme Corp" });
  });

  it("sorts ascending by name", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/clients?sort=name&order=asc",
    });

    expect(res.statusCode).toBe(200);
    const names = parseBody<PaginatedResult<Client>>(res).items.map(
      (c) => c.name,
    );
    expect(names).toEqual([...names].sort());
  });

  it("rejects invalid sort field via invalid_query", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/clients?sort=badfield",
    });

    expect(res.statusCode).toBe(400);
    expect(parseBody<{ error: string }>(res)).toMatchObject({
      error: "INVALID_QUERY",
    });
  });

  it("paginates results", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/clients?page=1&limit=1",
    });

    expect(res.statusCode).toBe(200);
    const body = parseBody<PaginatedResult<Client>>(res);
    expect(body.items).toHaveLength(1);
    expect(body.total).toBe(2);
    expect(body.pages).toBe(2);
  });
});

describe("POST /clients", () => {
  it("creates a new client", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/clients",
      payload: { name: "New Agency", email: "new@agency.example" },
    });

    expect(res.statusCode).toBe(201);
    const body = parseBody<Client>(res);
    expect(body).toMatchObject({
      name: "New Agency",
      email: "new@agency.example",
    });
    expect(body).toHaveProperty("id");
    expect(body).toHaveProperty("createdAt");
  });

  it("creates client with optional phone", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/clients",
      payload: {
        name: "Phone Client",
        email: "phone@example.com",
        phone: "+1-555-9999",
      },
    });

    expect(res.statusCode).toBe(201);
    expect(parseBody<Client>(res)).toMatchObject({ phone: "+1-555-9999" });
  });

  it("rejects missing email", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/clients",
      payload: { name: "No Email" },
    });

    expect(res.statusCode).toBe(400);
    expect(parseBody<{ error: string }>(res)).toMatchObject({
      error: "INVALID_BODY",
    });
  });

  it("rejects invalid email format", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/clients",
      payload: { name: "Bad Email", email: "not-an-email" },
    });

    expect(res.statusCode).toBe(400);
    expect(parseBody<{ error: string }>(res)).toMatchObject({
      error: "INVALID_BODY",
    });
  });

  it("rejects name shorter than 2 chars", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/clients",
      payload: { name: "X", email: "x@example.com" },
    });

    expect(res.statusCode).toBe(400);
    expect(parseBody<{ error: string }>(res)).toMatchObject({
      error: "INVALID_BODY",
    });
  });

  it("rejects non-object body", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/clients",
      payload: "just a string",
    });

    // Fastify rejects non-JSON content type before the handler runs (415)
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
    expect(res.statusCode).toBeLessThan(500);
  });
});
