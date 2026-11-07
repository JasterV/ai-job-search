// Data source: elixirjobs.net public pages. No authentication required.
// Search returns a server-rendered HTML page with one <article> per job card.
// Detail returns a single job's HTML page, which embeds a schema.org
// JobPosting block as JSON-LD - we parse that instead of the prose markup,
// since it carries a full ISO datePosted (the listing page only shows "DD Mon",
// no year) and a clean structured description.

export const BASE_URL = "https://elixirjobs.net"
export const SEARCH_URL = `${BASE_URL}/search`
export const DETAIL_BASE_URL = `${BASE_URL}/offers`

export function writeError(error: string, code: string): void {
  process.stderr.write(JSON.stringify({ error, code }) + "\n")
}

const UA = "Mozilla/5.0 (compatible; elixirjobs-search-cli/1.0)"

/** Fetch HTML with exponential backoff on 429/5xx. Returns "" on a 404. */
export async function htmlFetch(url: string): Promise<string> {
  const maxRetries = 6
  let delay = 500
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(url, {
      headers: {
        "User-Agent": UA,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
    })
    if (response.status === 429 || response.status >= 500) {
      if (attempt === maxRetries) {
        throw new Error(`Request failed: ${response.status} ${response.statusText}`)
      }
      const jitter = Math.floor(Math.random() * 500)
      await new Promise((r) => setTimeout(r, delay + jitter))
      delay = Math.min(delay * 2, 8000)
      continue
    }
    if (response.status === 404) return ""
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status} ${response.statusText}`)
    }
    return response.text()
  }
  throw new Error("Request failed after max retries")
}

export interface JobCard {
  id: string
  title: string
  company: string | null
  location: string | null
  date: string | null
  url: string
}

export interface JobDetail extends JobCard {
  description: string | null
  employmentType: string | null
  workplace: string | null
}

/**
 * Convert a Unicode code point to a string. Uses `fromCodePoint` (not
 * `fromCharCode`) so supplementary-plane code points (e.g. emoji, U+1F600)
 * decode correctly, and drops out-of-range values instead of throwing.
 */
function numericEntity(cp: number): string {
  return cp >= 0 && cp <= 0x10ffff ? String.fromCodePoint(cp) : ""
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    // Numeric character references: decimal (&#233;) and hexadecimal (&#xE9;).
    .replace(/&#(\d+);/g, (_, dec) => numericEntity(parseInt(dec, 10)))
    .replace(/&#[xX]([0-9a-fA-F]+);/g, (_, hex) => numericEntity(parseInt(hex, 16)))
    .replace(/&nbsp;/g, " ")
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

const VOID_TAGS = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"])

/** Whether an opening tag's attributes keep it from rendering: `hidden`, or an inline style that hides it. */
function isHiddenTag(attrs: string): boolean {
  for (const m of attrs.matchAll(/([^\s"'=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g)) {
    const name = m[1].toLowerCase()
    const value = m[2] ?? m[3] ?? m[4] ?? ""
    if (name === "hidden") return true
    if (name === "style" && /(?:^|;)\s*(?:display\s*:\s*none|visibility\s*:\s*hidden|mso-hide\s*:\s*all)\b/i.test(value)) {
      return true
    }
  }
  return false
}

/**
 * Drop markup a browser never renders - comments, <script>/<style>/<template>
 * blocks, and elements marked hidden - before tags are stripped. A plain tag
 * strip keeps their text, which hands the model words the posting's reader
 * never saw. CSS-only tricks (off-screen, zero font size) need a renderer and
 * are not caught here.
 */
export function visibleHtml(html: string): string {
  const src = html
    .replace(/<!--[\s\S]*?(?:-->|$)/g, "")
    .replace(/<(script|style|template)\b[^>]*>[\s\S]*?(?:<\/\1\s*>|$)/gi, "")
  // One pass, collecting what is kept: slicing the string per hidden element
  // would make a page full of them quadratic.
  const open = /<([a-zA-Z][a-zA-Z0-9-]*)(\s[^>]*)?>/g
  const kept: string[] = []
  let from = 0
  let m: RegExpExecArray | null
  while ((m = open.exec(src)) !== null) {
    if (!m[2] || !isHiddenTag(m[2])) continue
    const tag = m[1].toLowerCase()
    let end = open.lastIndex
    if (!VOID_TAGS.has(tag) && !m[0].endsWith("/>")) {
      const same = new RegExp(`<(/?)${tag}\\b[^>]*>`, "gi")
      same.lastIndex = end
      end = src.length
      let depth = 1
      let s: RegExpExecArray | null
      while ((s = same.exec(src)) !== null) {
        if (s[1]) depth--
        else if (!s[0].endsWith("/>")) depth++
        if (depth === 0) {
          end = same.lastIndex
          break
        }
      }
    }
    kept.push(src.slice(from, m.index))
    from = end
    open.lastIndex = end
  }
  kept.push(src.slice(from))
  return kept.join("")
}

function stripTags(html: string): string {
  return visibleHtml(html).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
}

function clean(html: string): string {
  return decodeHtmlEntities(stripTags(html))
}

/**
 * Parse the search/listing page: one <article> per job card. We split on the
 * card's opening tag and parse each chunk independently so one malformed
 * card cannot break the rest.
 */
export function parseJobCards(html: string): JobCard[] {
  const results: JobCard[] = []
  const chunks = html.split(/<article class="group relative rounded-xl border border-slate-300 cursor-pointer">/).slice(1)

  for (const chunk of chunks) {
    // The card's only href is "/offers/<slug>-<id>" - that full slug is what
    // the detail page's URL requires (the bare trailing id alone 404s), so we
    // keep it whole as our `id`.
    const linkMatch = chunk.match(/<a href="\/offers\/([^"]+)"[^>]*class="absolute -inset-px rounded-xl z-10"/)
    if (!linkMatch) continue
    const id = linkMatch[1]
    const url = `${DETAIL_BASE_URL}/${id}`

    const titleMatch = chunk.match(/<h2 class="text-2xl font-bold text-violet-800">([\s\S]*?)<\/h2>/)
    const title = titleMatch ? clean(titleMatch[1]) : null
    if (!title) continue

    // Subtitle is "Company - Location"; location is sometimes absent.
    let company: string | null = null
    let location: string | null = null
    const subMatch = chunk.match(/<h3 class="text-gray-500">([\s\S]*?)<\/h3>/)
    if (subMatch) {
      const sub = clean(subMatch[1])
      const dash = sub.indexOf(" - ")
      if (dash === -1) {
        company = sub || null
      } else {
        company = sub.slice(0, dash).trim() || null
        location = sub.slice(dash + 3).trim() || null
      }
    }

    // "15 Oct" - no year. The portal's listing simply doesn't carry one;
    // `detail` returns a full ISO date from the JobPosting JSON-LD instead.
    const dateMatch = chunk.match(/<span class="text-xs text-gray-600">([\s\S]*?)<\/span>/)
    const date = dateMatch ? clean(dateMatch[1]) || null : null

    results.push({ id, title, company, location, date, url })
  }

  return results
}

/** Extract the total page count from "Showing page X of Y". */
export function parsePageCount(html: string): number | null {
  const m = html.match(/Showing page \d+ of (\d+)/)
  return m ? parseInt(m[1], 10) : null
}

/**
 * Parse the detail page via its embedded schema.org JobPosting JSON-LD block
 * (the page carries three ld+json blocks - WebSite, Organization, and this
 * one - so we find the one whose @type is JobPosting rather than assuming
 * position). Returns null if the block is missing or unparseable, which the
 * caller treats the same as a 404.
 */
export function parseJobDetail(html: string, id: string): JobDetail | null {
  let posting: Record<string, unknown> | null = null
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)) {
    try {
      const parsed = JSON.parse(m[1].trim())
      if (parsed && parsed["@type"] === "JobPosting") {
        posting = parsed
        break
      }
    } catch {
      continue
    }
  }
  if (!posting) return null

  const rawDescription = typeof posting.description === "string" ? posting.description : null
  const description = rawDescription
    ? visibleHtml(rawDescription)
        .replace(/\s+/g, " ")
        .replace(/<\s*br\s*\/?>/gi, "\n")
        .replace(/<\/(p|li|ul|ol|div|h\d)>/gi, "\n")
        .split("\n")
        .map(clean)
        .join("\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim() || null
    : null

  const hiringOrg = posting.hiringOrganization as { name?: unknown } | undefined
  const jobLocation = posting.jobLocation as { address?: unknown } | undefined

  return {
    id,
    title: typeof posting.title === "string" ? clean(posting.title) : "(untitled)",
    company: typeof hiringOrg?.name === "string" ? clean(hiringOrg.name) || null : null,
    location: typeof jobLocation?.address === "string" ? clean(jobLocation.address) || null : null,
    date: typeof posting.datePosted === "string" ? posting.datePosted : null,
    url: `${DETAIL_BASE_URL}/${id}`,
    description,
    employmentType: typeof posting.employmentType === "string" ? clean(posting.employmentType) || null : null,
    workplace: typeof posting.jobLocationType === "string" ? clean(posting.jobLocationType) || null : null,
  }
}
