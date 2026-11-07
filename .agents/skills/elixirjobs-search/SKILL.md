---
name: elixirjobs-search
version: 1.0.0
description: >
  Use this skill whenever the user wants to search for Elixir/Phoenix/OTP job
  openings on elixirjobs.net, a niche global/remote-first Elixir job board, or
  look up a specific listing on it. Every posting on this board is already an
  Elixir role, so it is a precision source for Elixir-specific searches rather
  than a general-purpose board. Trigger phrases: elixir jobs, elixir job board,
  phoenix jobs, elixir developer jobs, find an elixir job, elixirjobs.net,
  look up this elixir job posting.
context: fork
enabled: true  # set to false to keep this portal installed but have /scrape skip it
allowed-tools: Bash(bun run .agents/skills/elixirjobs-search/cli/src/cli.ts *)
---

# ElixirJobs.net Search Skill

Search live job listings from [elixirjobs.net](https://elixirjobs.net), a small,
free, global/remote-first job board dedicated entirely to Elixir/Phoenix/OTP
roles. No authentication, no API key, and **zero runtime dependencies** — it
runs with just `bun`.

Every listing on this board is already Elixir-related, so unlike a
general-purpose board there is no need to filter by language/framework — the
`--query` flag narrows by role, seniority, or a secondary stack keyword
(e.g. "liveview", "phoenix", "remote").

## When to use this skill

- Search for Elixir/Phoenix/OTP job openings, globally or remote
- Narrow by keyword (role, seniority, secondary stack)
- Get the full description of a specific listing

## Commands

### Search job listings

```bash
bun run .agents/skills/elixirjobs-search/cli/src/cli.ts search [flags]
```

Key flags:
- `--query <text>` / `-q <text>` — keyword search (title, skill, role). Optional — omit to list every current offer.
- `--page <n>` — page number (1-indexed).
- `--limit <n>` / `-n <n>` — cap total results emitted (client-side).
- `--format json|table|plain` — default `json`.

No `--location` or `--jobage` flag — see Notes below.

### Fetch full listing detail

```bash
bun run .agents/skills/elixirjobs-search/cli/src/cli.ts detail <id|url> [--format json|plain]
```

`id` is the offer slug from `search` results (e.g.
`driftrock-elixir-software-engineer-289bae36`) — the full slug, not just the
trailing hex code; the bare id alone 404s on this portal. You may also pass a
full `elixirjobs.net/offers/...` URL. Returns the full description, workplace
type, employment type, and posting date.

## Usage examples

```bash
# Every current Elixir offer
bun run .agents/skills/elixirjobs-search/cli/src/cli.ts search --format table

# Narrow by secondary stack
bun run .agents/skills/elixirjobs-search/cli/src/cli.ts search -q "phoenix liveview" --format table

# Remote-only (location lives only inside the keyword query on this portal)
bun run .agents/skills/elixirjobs-search/cli/src/cli.ts search -q "remote" --format table

# Page 2
bun run .agents/skills/elixirjobs-search/cli/src/cli.ts search -q "elixir" --page 2 --format table

# Full detail for a specific offer
bun run .agents/skills/elixirjobs-search/cli/src/cli.ts detail driftrock-elixir-software-engineer-289bae36 --format plain
```

## Output formats

| Format | Best for |
|--------|----------|
| `json` | Default — programmatic use, passing slugs to `detail` |
| `table` | Quick human-readable scanning |
| `plain` | Reading a single listing's full detail (`detail` command) |

All errors are written to **stderr** as `{ "error": "...", "code": "..." }` and the process exits with code `1`.

## Notes

- Data is from elixirjobs.net's public pages — no credentials required. `robots.txt` only disallows `/login` and `/admin` and publishes a sitemap; the site also offers an RSS feed, so it's clearly built to be consumed programmatically. Still a small community board — keep volume low.
- **No location parameter.** The portal's search form has a single free-text field (`filters[text]`); there is no separate location filter that combines with it. If you need a specific location (e.g. remote, a city), include it in `--query`.
- **No posting-age parameter.** The listing page shows a date with no year (e.g. "15 Oct"), so there's nothing reliable to filter on at the search step. `detail`'s output carries a full ISO date (sourced from the page's embedded JobPosting JSON-LD), so freshness is only knowable per-listing.
- Listing IDs are the full offer slug (company + title + an 8-character hex suffix), not just the hex suffix — pass the whole thing to `detail`.
- The CLI retries 429/5xx with exponential backoff.
