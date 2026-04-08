import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";

const app = buildApp();

beforeAll(async () => {
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

describe("Fastify boilerplate", () => {
  it("returns health payload", async () => {
    const response = await app.inject({ method: "GET", url: "/health" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      status: "ok"
    });
  });

  it("validates task creation body", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/tasks",
      payload: { title: "x" }
    });

    expect(response.statusCode).toBe(400);
  });

  it("creates task with valid title", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/tasks",
      payload: { title: "Ship backend demo" }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      title: "Ship backend demo",
      done: false
    });
  });
});
