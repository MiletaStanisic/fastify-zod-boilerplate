import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";

const app = buildApp();

beforeAll(async () => {
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

describe("Health", () => {
  it("returns ok status and service name", async () => {
    const response = await app.inject({ method: "GET", url: "/health" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      status: "ok",
      service: "agency-project-hub",
    });
  });

  it("returns 404 for unknown routes", async () => {
    const response = await app.inject({ method: "GET", url: "/not-a-route" });
    expect(response.statusCode).toBe(404);
  });
});
