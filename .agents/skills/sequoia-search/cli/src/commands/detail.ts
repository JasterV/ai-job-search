import { getSession, postSearchJobs, parseCompositeId, stripInvisible, writeError } from "../helpers.js"

export interface DetailOpts {
  id: string
  format: "json" | "plain"
}

interface LabelValue {
  label: string
}

function joinLabels(items: LabelValue[] | undefined | null): string | null {
  if (!items || items.length === 0) return null
  return items.map((i) => i.label).join(", ")
}

export interface JobDetail {
  id: string
  title: string
  company: string | null
  location: string | null
  date: string | null
  url: string
  seniority: string | null
  jobFunction: string | null
  department: string | null
  skills: string | null
  markets: string | null
  remote: boolean
  hybrid: boolean
  employmentType: string | null
  salary: string | null
  applicationStatus: string | null
  description: null
  descriptionNote: string
}

function formatSalary(salary: any): string | null {
  if (!salary || (salary.minValue == null && salary.maxValue == null)) return null
  const range =
    salary.minValue === salary.maxValue
      ? String(salary.minValue)
      : `${salary.minValue}–${salary.maxValue}`
  const currency = salary.currency?.value ?? ""
  const period = salary.period?.value ?? ""
  return [range, currency, period ? `/${period}` : ""].filter(Boolean).join(" ").trim()
}

function toDetail(job: any, id: string): JobDetail {
  return {
    id,
    title: job.title,
    company: job.companyName ?? null,
    location: job.locations && job.locations.length > 0 ? job.locations.filter(Boolean).join(", ") || null : null,
    date: job.timeStamp ?? null,
    url: job.url || job.applyUrl || "",
    seniority: joinLabels(job.jobSeniorities),
    jobFunction: joinLabels(job.jobFunctions),
    department: Array.isArray(job.departments) && job.departments.length > 0 ? job.departments.join(", ") : null,
    skills: joinLabels(job.requiredSkills?.length ? job.requiredSkills : job.skills),
    markets: joinLabels(job.markets),
    remote: !!job.remote,
    hybrid: !!job.hybrid,
    employmentType: job.contractor ? "Contract" : job.consultant ? "Consultant" : "Full-time (assumed)",
    salary: formatSalary(job.salary),
    applicationStatus: job.applicationWindow?.status ?? null,
    description: null,
    descriptionNote:
      "This portal's search index does not carry the full job description - it lives on the hiring company's own ATS page. Read it at `url`.",
  }
}

export async function runDetail(opts: DetailOpts): Promise<number> {
  const parsed = parseCompositeId(opts.id)
  if (!parsed) {
    writeError(
      `Could not parse "${opts.id}" as a job id. Pass the "id" field from a search result (format "<jobId>@<companySlug>") - this portal has no per-job URL of its own to parse a URL from.`,
      "BAD_ID",
    )
    return 1
  }
  try {
    const session = await getSession()
    const json = await postSearchJobs(session, {
      meta: { size: 200 },
      board: { id: parsed.companySlug, isParent: false },
      query: {},
      grouped: false,
    })
    const raw: any[] = Array.isArray(json.jobs) ? json.jobs : []
    const match = raw.find((j) => j.jobId === parsed.jobId)
    if (!match) {
      writeError("Job not found (it may have been filled or removed)", "NOT_FOUND")
      return 1
    }
    const detail = stripInvisible(toDetail(match, opts.id))

    if (opts.format === "plain") {
      const lines = [
        detail.title,
        `${detail.company || "—"} · ${detail.location || "—"}`,
        "",
        detail.seniority ? `Seniority: ${detail.seniority}` : "",
        detail.employmentType ? `Employment: ${detail.employmentType}` : "",
        detail.jobFunction ? `Function: ${detail.jobFunction}` : "",
        detail.department ? `Department: ${detail.department}` : "",
        detail.markets ? `Industry: ${detail.markets}` : "",
        detail.skills ? `Skills: ${detail.skills}` : "",
        detail.salary ? `Salary: ${detail.salary}` : "",
        `Remote: ${detail.remote} · Hybrid: ${detail.hybrid}`,
        detail.applicationStatus ? `Status: ${detail.applicationStatus}` : "",
        "",
        detail.descriptionNote,
        "",
        `URL: ${detail.url}`,
      ].filter((l) => l !== "")
      process.stdout.write(lines.join("\n") + "\n")
    } else {
      process.stdout.write(JSON.stringify(detail, null, 2) + "\n")
    }
    return 0
  } catch (e) {
    writeError(e instanceof Error ? e.message : String(e), "DETAIL_FAILED")
    return 1
  }
}
