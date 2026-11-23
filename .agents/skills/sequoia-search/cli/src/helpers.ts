// Data source: jobs.sequoiacap.com, a job board aggregating open roles across
// Sequoia Capital's portfolio companies. The site is a React SPA powered by a
// third-party ATS platform ("Consider"); there is no documented public API, so
// this CLI talks to the same internal JSON endpoint the site's own frontend
// calls (POST /api-boards/search-jobs), reverse-engineered from the page's JS
// bundle. See ../url-reference.md for how it was found.
//
// Personal use only. Consider's Terms of Service (consider.com/legal/terms)
// prohibit automated access ("robot, spider, scraper, or other automated
// means"); robots.txt itself does not block these paths, but the ToS does.
// Keep volume low, do not use this commercially or for bulk data collection,
// and run it on your own responsibility.

const UA = "Mozilla/5.0 (compatible; sequoia-search-cli/1.0)"
const BOARD_ID = "sequoia-capital"
export const JOBS_PAGE_URL = "https://jobs.sequoiacap.com/jobs"
export const SEARCH_JOBS_URL = "https://jobs.sequoiacap.com/api-boards/search-jobs"

export function writeError(error: string, code: string): void {
  process.stderr.write(JSON.stringify({ error, code }) + "\n")
}

export interface Session {
  cookie: string
  csrfToken: string
}

/**
 * The search API requires a session cookie and a matching CSRF token, both
 * minted by loading the HTML page first - exactly what a browser does before
 * the SPA's own fetch calls. There is no API-key or token-only path.
 */
export async function getSession(): Promise<Session> {
  const res = await fetch(JOBS_PAGE_URL, {
    headers: { "User-Agent": UA, Accept: "text/html" },
    signal: AbortSignal.timeout(15000),
  })
  if (!res.ok) {
    throw new Error(`Failed to load session page: ${res.status} ${res.statusText}`)
  }
  const cookies = res.headers.getSetCookie().map((c) => c.split(";")[0])
  const html = await res.text()
  const csrfMatch = html.match(/"csrfToken":"([^"]+)"/)
  if (cookies.length === 0 || !csrfMatch) {
    throw new Error("Could not establish a session (missing cookie or CSRF token)")
  }
  return { cookie: cookies.join("; "), csrfToken: csrfMatch[1] }
}

export interface SearchBoard {
  id: string
  isParent: boolean
}

export interface SearchQuery {
  titlePrefix?: string
  locations?: string[]
  postedSince?: string
}

export interface SearchRequestBody {
  meta: { size: number }
  board: SearchBoard
  query: SearchQuery
  grouped: boolean
}

export const PARENT_BOARD: SearchBoard = { id: BOARD_ID, isParent: true }

/**
 * POST to the search API with exponential backoff on 429/5xx. On a 412 with
 * code INVALID_CSRF (the token expired between fetching the session and
 * using it) the session is refreshed once and the request retried - this is
 * the one error the portal itself raises for a stale-but-plausible request,
 * distinct from a malformed one.
 */
export async function postSearchJobs(session: Session, body: SearchRequestBody): Promise<any> {
  const maxRetries = 6
  let delay = 500
  let s = session
  let refreshedOnce = false

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const res = await fetch(SEARCH_JOBS_URL, {
      method: "POST",
      headers: {
        "User-Agent": UA,
        "Content-Type": "application/json",
        Accept: "application/json",
        Cookie: s.cookie,
        "X-CSRF-Token": s.csrfToken,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    })

    if (res.status === 412 && !refreshedOnce) {
      refreshedOnce = true
      s = await getSession()
      continue
    }
    if (res.status === 429 || res.status >= 500) {
      if (attempt === maxRetries) {
        throw new Error(`Request failed: ${res.status} ${res.statusText}`)
      }
      const jitter = Math.floor(Math.random() * 500)
      await new Promise((r) => setTimeout(r, delay + jitter))
      delay = Math.min(delay * 2, 8000)
      continue
    }
    if (!res.ok) {
      throw new Error(`Request failed: ${res.status} ${res.statusText}`)
    }
    const json = await res.json()
    if (Array.isArray(json.errors) && json.errors.length > 0) {
      throw new Error(json.errors[0].message || json.errors[0].code || "Unknown API error")
    }
    return json
  }
  throw new Error("Request failed after max retries")
}

export interface JobResult {
  id: string
  title: string
  company: string | null
  location: string | null
  date: string | null
  url: string
}

/**
 * The portal's fixed-size results page (matches the SPA's own PAGE_SIZE), used
 * to turn the API's relevance-ranked "give me the top N" shape into 1-indexed
 * pages: request size = page * PAGE_SIZE, then slice to that page's window.
 */
export const PAGE_SIZE = 15

/** Raw job record shape from a `grouped:false` search-jobs response. */
interface RawJob {
  jobId: string
  companySlug: string
  title: string
  companyName: string | null
  locations: string[] | null
  timeStamp: string | null
  url: string | null
  applyUrl: string | null
}

/** Composite id: the API has no single "fetch job by id" endpoint, only
 * per-company lookups, so `detail` needs both the job id and company slug. */
export function makeId(job: RawJob): string {
  return `${job.jobId}@${job.companySlug}`
}

export function parseCompositeId(input: string): { jobId: string; companySlug: string } | null {
  const m = input.trim().match(/^([^@]+)@([^@]+)$/)
  if (!m) return null
  return { jobId: m[1], companySlug: m[2] }
}

export function mapJobResult(job: RawJob): JobResult {
  return {
    id: makeId(job),
    title: job.title,
    company: job.companyName ?? null,
    location: job.locations && job.locations.length > 0 ? job.locations.filter(Boolean).join(", ") || null : null,
    date: job.timeStamp ?? null,
    url: job.url || job.applyUrl || "",
  }
}

/** Map a day count to the portal's fixed posted-since buckets (ISO 8601
 * durations). The API only supports these five windows, not arbitrary day
 * counts; a value past the largest bucket falls back to "anytime" (no filter),
 * same as 0/undefined. */
export function jobageToPostedSince(days: number | undefined): string | undefined {
  if (days === undefined || days >= 9999) return undefined
  if (days <= 1) return "P1D"
  if (days <= 7) return "P7D"
  if (days <= 30) return "P30D"
  if (days <= 90) return "P90D"
  if (days <= 356) return "P356D"
  return undefined
}

/**
 * Characters a reader of the posting never sees but a model reading this
 * output does: C0/C1 controls other than tab, newline and carriage return, the
 * soft hyphen, bidi marks/embeddings/overrides/isolates, zero-width characters
 * and invisible operators, the BOM, variation selectors, and Unicode tag
 * characters (U+E0000-E007F), which can spell out a whole hidden instruction.
 * Listing text is third-party data, and these arrive raw in a portal's JSON or
 * markup as easily as through a numeric entity.
 */
const INVISIBLE_CHARS =
  /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F­؜᠎​-‏‪-‮⁠-⁯︀-️﻿\u{E0000}-\u{E007F}\u{E0100}-\u{E01EF}]/gu

/** Strip INVISIBLE_CHARS from every string in a result, recursively: the CLI's output boundary. */
export function stripInvisible<T>(value: T): T {
  if (typeof value === "string") return value.replace(INVISIBLE_CHARS, "") as T
  if (Array.isArray(value)) return value.map(stripInvisible) as T
  if (value !== null && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype) {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, stripInvisible(v)])) as T
  }
  return value
}
