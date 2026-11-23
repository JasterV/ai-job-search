# sequoia-cli

CLI for searching **jobs.sequoiacap.com**, the job board aggregating open roles across
Sequoia Capital's portfolio companies, worldwide.

**Data source**: the internal JSON endpoint the site's own React frontend calls
(`POST /api-boards/search-jobs`), reverse-engineered from the page's JS bundle — there is
no documented public API.
**Authentication**: None — a session cookie and CSRF token are minted per-call by loading
the jobs page first, exactly like a real browser visit.
**Dependencies**: None (plain `bun` + `fetch`). `bun install` is optional and only pulls dev type defs.

> **Personal use only.** Consider's Terms of Service (consider.com/legal/terms) prohibit
> automated access ("robot, spider, scraper, or other automated means"). `robots.txt`
> itself does not block these paths, but the ToS does. Keep volume low, don't use this
> commercially or for bulk data collection, and run it on your own responsibility.

## Installation

```bash
cd .agents/skills/sequoia-search/cli
bun install   # optional — only installs TypeScript dev types
```

The CLI runs without any install because it has zero runtime dependencies.

## Commands

| Command | Description |
|---------|-------------|
| `search` | Search for job listings across all Sequoia portfolio companies |
| `detail` | Fetch structured detail for a single job listing |

`search` accepts `--format json|table|plain` (default `json`); `detail` accepts `--format json|plain`.
All errors are written to **stderr** as `{ "error": "...", "code": "..." }` with exit code `1`.

## Quick examples

```bash
# Backend engineer roles, anywhere
bun run src/cli.ts search -q "backend engineer" --format table

# Rust roles, remote, posted in the last 7 days
bun run src/cli.ts search -q "rust" -l "Remote" --jobage 7 --format table

# Elixir roles with a location filter
bun run src/cli.ts search -q "elixir" -l "Spain" --format table

# Full detail for one job (id comes from a search result)
bun run src/cli.ts detail "566df6b6-5ddc-4ced-9a9f-2b9cceb365ef@dust" --format plain
```

See `../SKILL.md` for the full flag reference and the Terms-of-Service note.

## Search flags

| Flag | Alias | Description |
|------|-------|-------------|
| `--query` | `-q` | Keywords (title / skill / role). |
| `--location` | `-l` | Free-text location filter, e.g. `"Spain"`, `"Remote"`, `"Barcelona"`. |
| `--jobage` | | Posted within N days — mapped to the portal's fixed buckets (1/7/30/90/356). |
| `--page` | | 1-indexed page (15 results/page). |
| `--limit` | `-n` | Cap results emitted. |
| `--format` | | `json` \| `table` \| `plain`. |

## Why `detail` takes an `id`, not a URL

Nearly every listing on this board links straight out to the hiring company's own ATS
(Ashby, Greenhouse, Lever, Workable, a direct careers page, …) rather than to a page on
`jobs.sequoiacap.com` itself. There is no per-job URL on the portal's own domain to parse,
and the portal's API has no single "fetch job by id" endpoint — only per-company lookups.
So `search` returns a composite `id` (`<jobId>@<companySlug>`), and `detail` re-queries that
one company's job list to find the match. `detail` returns rich structured metadata (skills,
seniority, salary, markets, remote/hybrid, posted date) but not the full free-text job
description — that only exists on the external ATS page at the result's `url`.
