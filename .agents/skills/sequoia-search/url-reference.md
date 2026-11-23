# jobs.sequoiacap.com URL Reference

The portal is a React SPA ("Powered by Consider" — a third-party ATS/talent platform,
`consider.com`). It has no documented public API; this is the internal JSON endpoint its
own frontend calls, found by downloading the page's JS bundle (linked from `<script src="/mendel/.../boards">`
in the page source) and grepping it for API path strings (`"/api-boards/..."`).

> Personal use only — Consider's Terms of Service (consider.com/legal/terms) explicitly
> prohibit "any robot, spider, scraper, or other automated means" of access. `robots.txt`
> on `jobs.sequoiacap.com` does **not** block these paths (only `LinkedInBot` is disallowed;
> `User-agent: *` gets `Allow: /`), but the ToS does. Keep volume low.

## Session (required before every search/detail call)

```
GET https://jobs.sequoiacap.com/jobs
```

Returns the SPA shell HTML plus `Set-Cookie` headers (a `session`/`session.sig` pair, plus
sticky-routing `AWSALBAPP-*` cookies) and an inline script:

```html
<script>window.serverInitialData = {..., "csrfToken":"<token>", ...};</script>
```

Extract the CSRF token with `/"csrfToken":"([^"]+)"/` and forward all `Set-Cookie` values as
a `Cookie` header on the next request. Without both, the search endpoint returns
`412 {"error":"INVALID_CSRF"}`.

## Search

```
POST https://jobs.sequoiacap.com/api-boards/search-jobs
Content-Type: application/json
Accept: application/json
Cookie: <from session>
X-CSRF-Token: <from session>
```

Body:

```json
{
  "meta": { "size": 15 },
  "board": { "id": "sequoia-capital", "isParent": true },
  "query": {
    "titlePrefix": "backend engineer",
    "locations": ["Spain"],
    "postedSince": "P7D"
  },
  "grouped": false
}
```

| `query` field | Meaning | Values |
|---|---|---|
| `titlePrefix` | Free-text title/keyword search | any string |
| `locations` | Free-text location filter (array; the UI only ever sends one value) | any string, e.g. `"Spain"`, `"Remote"`, `"Barcelona"` |
| `postedSince` | Posting-age filter | ISO 8601 duration, one of `P1D`, `P7D`, `P30D`, `P90D`, `P356D`; omit for "anytime" |
| `remoteOnly` / `hybridOnly` | Workplace-type filters (booleans) | not exposed by this CLI — out of the standard portal-skill flag contract, but present in the API if a future maintainer wants them |

`board.id`/`isParent` selects scope:
- `{ "id": "sequoia-capital", "isParent": true }` — search across **all** portfolio companies (used for `search`).
- `{ "id": "<companySlug>", "isParent": false }` — search within **one** company's postings (used for `detail`'s lookup).

`meta.size` is the number of flat job results to return (confirmed working up to at least
100; there is no documented hard cap). `grouped: false` returns a **flat array** of job
objects in `response.jobs`; `grouped: true` instead groups them by company
(`response.jobs[i] = { company, jobs: [...] }`) — not used by this CLI, flat is simpler and
matches the portal-skill contract's result shape directly.

There is **no server-side offset/cursor pagination** — the real frontend's "load more" just
re-issues the same query with a bigger `meta.size` (capped at 50 in the UI, but the API
itself accepts larger values) and relies on consistent relevance ranking. This CLI
implements 1-indexed `--page` client-side: request `size = page * 15`, then slice to that
page's 15-row window.

### Per-job response fields (flat/`grouped:false` shape)

```
jobId, companySlug, companyId, companyName, companyDomain, title, url, applyUrl,
locations (string[]), normalizedLocations, timeStamp (ISO date), considerHosted (bool),
jobTypes, jobFunctions, jobSeniorities, departments (string[]), markets, skills,
requiredSkills, preferredSkills, salary { minValue, maxValue, currency, period },
remote (bool), hybrid (bool), contractor (bool), consultant (bool), manager (bool),
regions, stages, applicationWindow { status }, scores, matchingTalent, atsJobs
```

There is **no `description` field** in this response at all — see Detail below.

## Detail

There is no "fetch one job by id" endpoint on this API. Two paths exist:

1. **External-ATS jobs (the overwhelming majority — 297/297 sampled during
   reconnaissance on 2026-11-09 had `considerHosted: false`)**: `url`/`applyUrl` point
   straight to the hiring company's own ATS (Ashby, Greenhouse, Lever, a direct careers
   page, …). The full free-text description only exists there, on a different host with
   different markup per company — fetching and parsing it is out of scope for this CLI
   (it would mean maintaining a parser per external ATS, which belongs to those ATS's own
   portal skills if they're ever built, not this one).
2. **Consider-hosted jobs** (`considerHosted: true`, none found in testing, but the SPA
   supports them): `GET /api-boards/jobs/<jobId>?companyId=<companyId>` returns a fuller
   job object. **Not implemented in this CLI** — it could not be verified against a real
   response during `/add-portal`'s mandatory live-test step (Step 4), since no such job
   existed in the sampled data. A future maintainer who finds one can add this path; check
   `considerHosted` on the job object and branch there.

This CLI's `detail <id>` therefore works by re-running `search-jobs` scoped to the job's
company board (`{ "id": "<companySlug>", "isParent": false }`, `query: {}`, `meta: { "size": 200 }`,
`grouped: false`) and matching on `jobId` from the flat list, then returning the structured
fields listed above (skills, seniority, salary, markets, remote/hybrid, posted date) plus
the external `url` for the full description. The composite `id` format (`<jobId>@<companySlug>`)
exists because this lookup needs both pieces and there is nothing else to resolve them from.

## Notes

- `robots.txt` allows `*` (only blocks `LinkedInBot`); the ToS prohibition is the real
  access restriction here — see the warning at the top.
- Session cookies are long-lived (multi-month expiry observed); the CSRF token can go
  stale mid-session and the API returns `412 {"error":"INVALID_CSRF"}` — the CLI refreshes
  the session once and retries on that specific error.
- This board aggregates companies across every market and HQ location Sequoia invests in.
  Standard per-posting deal-breaker checks (per the candidate profile) still apply to
  individual results the same as any other source — nothing about this portal pre-filters
  that for you.
