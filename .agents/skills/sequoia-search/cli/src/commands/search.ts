import {
  PARENT_BOARD,
  PAGE_SIZE,
  getSession,
  postSearchJobs,
  mapJobResult,
  jobageToPostedSince,
  stripInvisible,
  writeError,
  type JobResult,
} from "../helpers.js"

export interface SearchOpts {
  query?: string
  location?: string
  jobage?: number
  page: number
  limit?: number
  format: "json" | "table" | "plain"
}

function renderTable(results: JobResult[]): string {
  if (results.length === 0) return "No results."
  const rows = results.map((r) => {
    const title = (r.title || "").slice(0, 42).padEnd(42)
    const company = (r.company || "—").slice(0, 24).padEnd(24)
    const loc = (r.location || "—").slice(0, 24).padEnd(24)
    const date = (r.date || "—").slice(0, 10)
    return `${title} ${company} ${loc} ${date}`
  })
  const header =
    "TITLE".padEnd(42) + " " + "COMPANY".padEnd(24) + " " + "LOCATION".padEnd(24) + " DATE"
  return [header, "-".repeat(header.length), ...rows].join("\n")
}

export async function runSearch(opts: SearchOpts): Promise<number> {
  try {
    const session = await getSession()
    const size = opts.page * PAGE_SIZE
    const json = await postSearchJobs(session, {
      meta: { size },
      board: PARENT_BOARD,
      query: {
        ...(opts.query ? { titlePrefix: opts.query } : {}),
        ...(opts.location ? { locations: [opts.location] } : {}),
        ...((() => {
          const postedSince = jobageToPostedSince(opts.jobage)
          return postedSince ? { postedSince } : {}
        })()),
      },
      grouped: false,
    })

    const raw: any[] = Array.isArray(json.jobs) ? json.jobs : []
    const pageStart = (opts.page - 1) * PAGE_SIZE
    const pageSlice = raw.slice(pageStart, pageStart + PAGE_SIZE)
    let results = stripInvisible(pageSlice.map(mapJobResult))
    if (opts.limit !== undefined && opts.limit >= 0) results = results.slice(0, opts.limit)

    if (opts.format === "table") {
      process.stdout.write(renderTable(results) + "\n")
    } else if (opts.format === "plain") {
      process.stdout.write(
        results
          .map(
            (r) =>
              `${r.title}\n  ${r.company || "—"} · ${r.location || "—"} · ${r.date || "—"}\n  id: ${r.id}\n  ${r.url}`,
          )
          .join("\n\n") + "\n",
      )
    } else {
      process.stdout.write(
        JSON.stringify({ meta: { count: results.length, page: opts.page }, results }, null, 2) + "\n",
      )
    }
    return 0
  } catch (e) {
    writeError(e instanceof Error ? e.message : String(e), "SEARCH_FAILED")
    return 1
  }
}
