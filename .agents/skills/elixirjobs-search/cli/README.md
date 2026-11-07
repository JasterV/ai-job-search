# elixirjobs-cli

CLI for searching jobs on [elixirjobs.net](https://elixirjobs.net), a niche
Elixir job board (global/remote-first).

**Data source**: elixirjobs.net's public pages (`/search` and `/offers/<slug>`).
**Authentication**: None required.
**Dependencies**: None (plain `bun` + `fetch`). `bun install` is optional and only pulls dev type defs.

## Installation

```bash
cd .agents/skills/elixirjobs-search/cli
bun install   # optional — only installs TypeScript dev types
```

The CLI runs without any install because it has zero runtime dependencies.

## Commands

| Command | Description |
|---------|-------------|
| `search` | Search/list offers (`--query` optional — omit it to list everything) |
| `detail` | Fetch full detail for a single offer |

`search` accepts `--format json|table|plain` (default `json`); `detail` accepts `--format json|plain`.
All errors are written to **stderr** as `{ "error": "...", "code": "..." }` with exit code `1`.

## Quick examples

```bash
# All current Elixir offers
bun run src/cli.ts search --format table

# Narrow by keyword
bun run src/cli.ts search -q "phoenix liveview" --format table

# Page 2
bun run src/cli.ts search -q "elixir" --page 2 --format table

# Full detail for one offer
bun run src/cli.ts detail driftrock-elixir-software-engineer-289bae36 --format plain
```

See `../SKILL.md` for the full flag reference and portal notes.

## Search flags

| Flag | Alias | Description |
|------|-------|-------------|
| `--query` | `-q` | Keywords (title / skill / role). Optional — omitting it lists all offers. |
| `--page` | | 1-indexed page. |
| `--limit` | `-n` | Cap results emitted (client-side). |
| `--format` | | `json` \| `table` \| `plain`. |

No `--location` or `--jobage` flag: the portal has no location query parameter
(every listing is already an Elixir role; include a location term in
`--query` if you need one) and the listing page doesn't expose a posting
date with a year to filter on. `detail`'s output does carry a full ISO date,
sourced from the page's embedded JobPosting JSON-LD.
