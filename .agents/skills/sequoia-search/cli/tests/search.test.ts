import { describe, expect, test } from "bun:test"
import { runCLI, parseJSON } from "./helpers.js"

interface SearchResult {
  id: string
  title: string
  company: string | null
  location: string | null
  date: string | null
  url: string
}

interface SearchResponse {
  meta: { count: number; page: number }
  results: SearchResult[]
}

describe("search (live)", () => {
  test("returns real results for a backend-engineer query", async () => {
    const result = await runCLI(["search", "-q", "Backend Engineer", "--limit", "5"])
    const json = parseJSON<SearchResponse>(result)
    expect(json.results.length).toBeGreaterThan(0)
    for (const r of json.results) {
      expect(r.id).toBeTruthy()
      expect(r.title).toBeTruthy()
      expect(r.url).toBeTruthy()
      expect(r.url.startsWith("http")).toBe(true)
    }
  }, 30000)
})

describe("flag validation", () => {
  test("rejects an unknown flag with exit 1 and a JSON stderr error", async () => {
    const result = await runCLI(["search", "--bogus", "x"])
    expect(result.exitCode).toBe(1)
    const err = JSON.parse(result.stderr)
    expect(err.code).toBe("UNKNOWN_FLAG")
  })

  test("rejects a missing detail id with exit 1", async () => {
    const result = await runCLI(["detail"])
    expect(result.exitCode).toBe(1)
    const err = JSON.parse(result.stderr)
    expect(err.code).toBe("NO_ID")
  })

  test("rejects an empty --query value", async () => {
    const result = await runCLI(["search", "--query", ""])
    expect(result.exitCode).toBe(1)
    const err = JSON.parse(result.stderr)
    expect(err.code).toBe("BAD_ARG")
  })

  test("rejects a malformed detail id", async () => {
    const result = await runCLI(["detail", "not-a-valid-id"])
    expect(result.exitCode).toBe(1)
    const err = JSON.parse(result.stderr)
    expect(err.code).toBe("BAD_ID")
  })
})
