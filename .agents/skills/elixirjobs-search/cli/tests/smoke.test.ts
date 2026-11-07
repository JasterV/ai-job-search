import { describe, expect, test } from "bun:test";
import { runCLI, parseJSON } from "./helpers.js";
import type { JobCard, JobDetail } from "../src/helpers.js";

// Live smoke tests against the real portal. Keep volume low: one search,
// one detail lookup, plus a couple of fast local validation checks.

describe("search (live)", () => {
  test("returns real results for a live query", async () => {
    const result = await runCLI(["search", "-q", "elixir", "--limit", "5"]);
    const body = parseJSON<{ meta: { count: number }; results: JobCard[] }>(result);
    expect(body.results.length).toBeGreaterThan(0);
    for (const job of body.results) {
      expect(job.id).toBeTruthy();
      expect(job.title).toBeTruthy();
      expect(job.url).toContain("elixirjobs.net/offers/");
    }
  }, 30000);

  test("detail returns a readable description for a result from search", async () => {
    const searchResult = await runCLI(["search", "-q", "elixir", "--limit", "1"]);
    const body = parseJSON<{ results: JobCard[] }>(searchResult);
    expect(body.results.length).toBeGreaterThan(0);
    const id = body.results[0].id;

    const detailResult = await runCLI(["detail", id]);
    const job = parseJSON<JobDetail>(detailResult);
    expect(job.title).toBeTruthy();
    expect(job.description).toBeTruthy();
    expect(job.description).not.toContain("<p>");
    expect(job.description).not.toContain("&#39;");
  }, 30000);
});

describe("error handling", () => {
  test("unknown flag exits 1 with a JSON error on stderr", async () => {
    const result = await runCLI(["search", "--bogus-flag", "x"]);
    expect(result.exitCode).toBe(1);
    expect(result.stdout).toBe("");
    const err = JSON.parse(result.stderr);
    expect(err.code).toBe("UNKNOWN_FLAG");
  });

  test("detail without an id exits 1 with a JSON error on stderr", async () => {
    const result = await runCLI(["detail"]);
    expect(result.exitCode).toBe(1);
    expect(result.stdout).toBe("");
    const err = JSON.parse(result.stderr);
    expect(err.code).toBe("NO_ID");
  });

  test("detail with an unrelated host is rejected", async () => {
    const result = await runCLI(["detail", "https://apply.workable.com/driftrock/j/5EA6AAA0FB"]);
    expect(result.exitCode).toBe(1);
    const err = JSON.parse(result.stderr);
    expect(err.code).toBe("BAD_ID");
  });
});
