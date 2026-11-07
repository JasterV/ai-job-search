# elixirjobs.net URL Reference

Public, unauthenticated pages used by this skill. Server-rendered HTML (Phoenix
LiveView app) — no JSON API found.

> `robots.txt` (https://elixirjobs.net/robots.txt) only disallows `/login` and
> `/admin`, and publishes a sitemap. The site also has an RSS feed. No terms
> restricting automated access found on `/terms-and-conditions`. Keep volume
> low anyway — it's a small, free community board.

## Search / listing

```
GET https://elixirjobs.net/search
```

Query params:

| Param | Meaning | Example |
|-------|---------|---------|
| `filters[text]` | Free-text query (URL-encode the brackets: `filters%5Btext%5D`) | `Phoenix` |
| `page` | 1-indexed page | `2` |

Omitting `filters[text]` entirely returns every current offer (confirmed:
"Showing page 1 of 114" unfiltered vs. "Showing page 1 of 28" for
`filters[text]=Phoenix`, 2026-11-06). The homepage (`/`) is this same listing
with no filters applied.

No location or posting-age parameter was found. The footer has static
category pages (`/offers/place/remote`, `/offers/place/onsite`,
`/offers/filter/full_time`, etc.) but these did not appear to compose with
`filters[text]` as query params — not pursued further since the keyword field
covers the same ground (e.g. `filters[text]=remote`).

Returns an HTML page with one `<article class="group relative rounded-xl
border border-slate-300 cursor-pointer">` per listing. The CLI splits on that
opening tag and parses each chunk independently. Per card:

| Field | Anchor |
|-------|--------|
| id + url | `<a href="/offers/<slug>" class="absolute -inset-px rounded-xl z-10">` — `<slug>` is the full `company-title-id` string, required as-is for `detail` (the bare trailing id 404s) |
| title | `<h2 class="text-2xl font-bold text-violet-800">` |
| company / location | `<h3 class="text-gray-500">Company - Location</h3>` (split on first `" - "`; location sometimes absent) |
| date | `<span class="text-xs text-gray-600">15 Oct</span>` — **day + month only, no year** |
| workplace | `<span class="sr-only">Workplace</span>` sibling text (On-site / Remote / On-site / Remote) |
| type | `<span class="sr-only">Type</span>` sibling text (Full time / Part time / Freelance) |

Page count: `Showing page \d+ of (\d+)` appears twice per page (top and bottom of the list).

## Detail

```
GET https://elixirjobs.net/offers/<slug>
```

`<slug>` is the full id from `search` (e.g.
`driftrock-elixir-software-engineer-289bae36`). The bare trailing hex
alone (`289bae36`) 404s — confirmed 2026-11-06.

The page embeds three `<script type="application/ld+json">` blocks
(`WebSite`, `Organization`, `JobPosting`, in that order on the one page
checked — the CLI does not rely on order, it parses each block and keeps the
one whose `@type` is `JobPosting`). That block is the preferred data source
over the prose HTML:

```json
{
  "@type": "JobPosting",
  "datePosted": "2026-09-17",
  "description": "<p>...</p>",
  "employmentType": "Full time",
  "hiringOrganization": { "name": "Driftrock" },
  "jobLocation": { "address": "Remote " },
  "jobLocationType": "TELECOMMUTE",
  "title": "Elixir Software Engineer ",
  "url": "https://elixirjobs.net/offers/driftrock-elixir-software-engineer-289bae36"
}
```

`description` is HTML (paragraphs, `<br>`, bold); the CLI converts it to
plain text with paragraph breaks preserved, the same way `linkedin-search`
does. String fields carry literal HTML entities (e.g. `world&#39;s`) even
inside the JSON value — the site's templating escapes interpolated text
uniformly, including into `<script type="application/ld+json">`. Decode
entities after `JSON.parse`, not before.

The apply link (`<a ... target="_blank">Go to the offer!</a>`) points to a
third-party ATS (Workable, Greenhouse, etc.) with UTM params — not parsed;
`detail`'s `url` field is the elixirjobs.net listing page, not the apply link.

## Notes

- No authentication required.
- No JSON API found — plain server-rendered HTML throughout.
- Respect rate limits — the CLI backs off on 429/5xx.
- Reconnaissance performed 2026-11-06. If the portal's markup changes, re-verify the class names above against a live fetch before updating the parsers.
