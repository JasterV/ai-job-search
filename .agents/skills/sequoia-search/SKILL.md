---
name: sequoia-search
version: 1.0.0
description: >
  Use this skill whenever the user wants to search for jobs across Sequoia Capital's
  portfolio companies — a global, English-language job board aggregating open roles at
  every company Sequoia has invested in. Invoke for open positions, vacancies, and hiring
  across any sector or role (software, data, design, marketing, finance, legal,
  operations, etc.) at a Sequoia-backed startup. Trigger phrases: Sequoia jobs, Sequoia
  portfolio jobs, jobs at Sequoia companies, Sequoia Capital careers, jobs.sequoiacap.com.
context: fork
enabled: true  # set to false to keep this portal installed but have /scrape skip it
allowed-tools: Bash(bun run .agents/skills/sequoia-search/cli/src/cli.ts *)
---

# Sequoia Capital Portfolio Jobs Search Skill

Search live job listings aggregated across **every Sequoia Capital portfolio company**,
worldwide. No authentication, no API key, and **zero runtime dependencies** — it runs with
just `bun`. A session cookie and CSRF token are minted automatically per call, exactly like
loading the page in a browser.

## ⚠️ Personal use only

Consider's Terms of Service (consider.com/legal/terms), the platform that powers this job
board, explicitly prohibit "any robot, spider, scraper, or other automated means" of
access — `robots.txt` itself does not block the paths this CLI uses, but the ToS does.
**Keep volume low and don't use it commercially or for bulk data collection.** Run it on
your own responsibility.

## When to use this skill

- Search for job openings at any Sequoia-backed company, in any location or remotely
- Filter by keyword, location, or posting recency
- Get structured detail (skills, seniority, salary, remote/hybrid, posted date) for a
  specific listing found via `search`

This board spans every market and HQ location Sequoia invests in — nothing about it
pre-filters results against your deal-breakers. Run the usual per-posting vetting (company
research, Israel-relationship check, etc.) on anything you plan to apply to, same as any
other source.

## Commands

### Search job listings

```bash
bun run .agents/skills/sequoia-search/cli/src/cli.ts search [flags]
```

Key flags:
- `--query <text>` / `-q <text>` — keyword search (title, skill, or role). Recommended.
- `--location <text>` / `-l <text>` — free-text location filter, e.g. `"Spain"`, `"Remote"`, `"Barcelona"`.
- `--jobage <days>` — posted within N days; mapped to the portal's fixed buckets (1, 7, 30, 90, 356 — the nearest bucket at or above your value is used). Omit for all time.
- `--page <n>` — page number (1-indexed, 15 results per page).
- `--limit <n>` / `-n <n>` — cap total results emitted (client-side).
- `--format json|table|plain` — default `json`.

### Fetch job detail

```bash
bun run .agents/skills/sequoia-search/cli/src/cli.ts detail <id> [--format json|plain]
```

`id` is the composite id from a `search` result, formatted `<jobId>@<companySlug>` (e.g.
`566df6b6-5ddc-4ced-9a9f-2b9cceb365ef@dust`) — **not** a URL. Nearly every listing on this
board links out to the hiring company's own ATS rather than to a page on
`jobs.sequoiacap.com`, so there is no portal-hosted job URL to pass instead. `detail`
returns structured metadata (skills, seniority, department, markets/industry, salary,
remote/hybrid, posted date, application status) and the external `url` to read the full
free-text description, which this portal's own index does not carry.

## Usage examples

```bash
# Backend engineer roles, anywhere Sequoia has invested
bun run .agents/skills/sequoia-search/cli/src/cli.ts search -q "backend engineer" --format table

# Rust roles, remote, posted in the last week
bun run .agents/skills/sequoia-search/cli/src/cli.ts search -q "rust" -l "Remote" --jobage 7 --format table

# Elixir roles, filtered to Spain
bun run .agents/skills/sequoia-search/cli/src/cli.ts search -q "elixir" -l "Spain" --format table

# Fullstack roles, last 30 days, second page
bun run .agents/skills/sequoia-search/cli/src/cli.ts search -q "fullstack engineer" --jobage 30 --page 2 --format table

# Full structured detail for a specific listing
bun run .agents/skills/sequoia-search/cli/src/cli.ts detail "566df6b6-5ddc-4ced-9a9f-2b9cceb365ef@dust" --format plain
```

## Output formats

| Format | Best for |
|--------|----------|
| `json` | Default — programmatic use, passing `id`s to `detail` |
| `table` | Quick human-readable scanning |
| `plain` | Reading a single job's full detail (`detail` command) |

All errors are written to **stderr** as `{ "error": "...", "code": "..." }` and the process exits with code `1`.

## Notes

- Data source: the internal JSON endpoint (`/api-boards/search-jobs`) that the portal's
  own React frontend calls — reverse-engineered from its JS bundle, since there is no
  documented public API. Full detail in `url-reference.md`.
- The portal has no server-side offset pagination; `--page` is implemented client-side by
  requesting a larger result set and slicing to the requested 15-row page.
- `--jobage` snaps to the portal's five fixed buckets (1/7/30/90/356 days), not an
  arbitrary day count.
- `detail` cannot return the full job description — only the hiring company's own ATS page
  (linked via `url`) has it. This is a structural limit of the portal's search index, not a
  parsing gap.
- A CSRF token can go stale mid-session; the CLI detects the portal's `412 INVALID_CSRF`
  response, refreshes the session once, and retries automatically.
