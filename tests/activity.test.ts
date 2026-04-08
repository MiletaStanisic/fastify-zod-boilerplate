import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import type { ActivityEvent } from "../src/types/index.js";
import { parseBody } from "./helpers.js";

type ActivityFeedResponse = {
  items: ActivityEvent[];
  total: number;
  limit: number;
};

const app = buildApp();

beforeAll(async () => {
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

describe("GET /activity-feed", () => {
  it("returns activity items with default limit", async () => {
    const res = await app.inject({ method: "GET", url: "/activity-feed" });

    expect(res.statusCode).toBe(200);
    const body = parseBody<ActivityFeedResponse>(res);
    expect(body).toHaveProperty("items");
    expect(body).toHaveProperty("total");
    expect(body).toHaveProperty("limit");
    expect(Array.isArray(body.items)).toBe(true);
    expect(body.items.length).toBeLessThanOrEqual(20);
  });

  it("returns items sorted newest first", async () => {
    const res = await app.inject({ method: "GET", url: "/activity-feed" });

    const items = parseBody<ActivityFeedResponse>(res).items;
    for (let i = 1; i < items.length; i++) {
      expect(items[i - 1].createdAt >= items[i].createdAt).toBe(true);
    }
  });

  it("filters by projectId", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/activity-feed?projectId=proj-1",
    });

    expect(res.statusCode).toBe(200);
    const body = parseBody<ActivityFeedResponse>(res);
    expect(body.items.every((a) => a.projectId === "proj-1")).toBe(true);
    expect(body.items.length).toBeGreaterThanOrEqual(3);
  });

  it("respects limit parameter", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/activity-feed?limit=3",
    });

    expect(res.statusCode).toBe(200);
    const body = parseBody<ActivityFeedResponse>(res);
    expect(body.items).toHaveLength(3);
    expect(body.limit).toBe(3);
  });

  it("rejects limit above 50", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/activity-feed?limit=100",
    });

    expect(res.statusCode).toBe(400);
    expect(parseBody<{ error: string }>(res)).toMatchObject({ error: "INVALID_QUERY" });
  });

  it("returns empty items for unknown projectId", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/activity-feed?projectId=no-such-project",
    });

    expect(res.statusCode).toBe(200);
    expect(parseBody<ActivityFeedResponse>(res).items).toHaveLength(0);
  });
});
