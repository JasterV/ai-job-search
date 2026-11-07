import { DETAIL_BASE_URL, htmlFetch, parseJobDetail, stripInvisible, writeError } from "../helpers.js"

export interface DetailOpts {
  id: string
  format: "json" | "plain"
}

const ELIXIRJOBS_HOST = /(^|\.)elixirjobs\.net$/i

/**
 * Accept a raw offer slug (e.g. "driftrock-elixir-software-engineer-289bae36",
 * exactly as `search` returns it in `id`) or a full elixirjobs.net offer URL.
 *
 * A URL on any other host is rejected - a posting's own "apply" link (e.g.
 * apply.workable.com/...) can carry a path segment that looks like a slug, and
 * following it would fetch and print an unrelated page as if it were this
 * portal's listing. Host and path are read through real URL parsing, so
 * look-alike hosts (elixirjobs.net.evil.io) and userinfo tricks
 * (elixirjobs.net@evil.io) fall on the reject side too.
 */
export function normalizeId(input: string): string | null {
  const trimmed = input.trim()

  const hasScheme = /^https?:\/\//i.test(trimmed)
  if (hasScheme || /^[a-z0-9.-]+\.[a-z]{2,}(\/|$)/i.test(trimmed)) {
    let parsed: URL
    try {
      parsed = new URL(hasScheme ? trimmed : `https://${trimmed}`)
    } catch {
      return null
    }
    if (!ELIXIRJOBS_HOST.test(parsed.hostname)) return null
    const path = parsed.pathname.match(/^\/offers\/([^/]+)\/?$/)
    return path ? path[1] : null
  }

  // A bare slug, scheme- and slash-free.
  return /^[a-z0-9-]+$/i.test(trimmed) ? trimmed : null
}

export async function runDetail(opts: DetailOpts): Promise<number> {
  const id = normalizeId(opts.id)
  if (!id) {
    writeError(`Could not parse an offer slug from "${opts.id}"`, "BAD_ID")
    return 1
  }
  try {
    const html = await htmlFetch(`${DETAIL_BASE_URL}/${id}`)
    if (!html) {
      writeError("Job not found", "NOT_FOUND")
      return 1
    }
    const job = parseJobDetail(html, id)
    if (!job) {
      writeError("Job not found", "NOT_FOUND")
      return 1
    }
    const clean = stripInvisible(job)

    if (opts.format === "plain") {
      const lines = [
        clean.title,
        `${clean.company || "—"} · ${clean.location || "—"}`,
        "",
        clean.workplace ? `Workplace: ${clean.workplace}` : "",
        clean.employmentType ? `Employment: ${clean.employmentType}` : "",
        clean.date ? `Posted: ${clean.date}` : "",
        "",
        clean.description || "(no description)",
        "",
        `URL: ${clean.url}`,
      ].filter((l) => l !== "")
      process.stdout.write(lines.join("\n") + "\n")
    } else {
      process.stdout.write(JSON.stringify(clean, null, 2) + "\n")
    }
    return 0
  } catch (e) {
    writeError(e instanceof Error ? e.message : String(e), "DETAIL_FAILED")
    return 1
  }
}
