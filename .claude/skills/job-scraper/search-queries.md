# Search Queries for Job Scraper

<!-- SETUP: Customize these queries based on your skills, target roles, and location -->

## Installed portal CLIs (primary for `/scrape`)

`/scrape` discovers every portal skill under `.agents/skills/*/SKILL.md` and runs its CLI first. Shipped country-agnostic CLIs include `linkedin-search` and `freehire-search`; Danish demos and any skill you add with `/add-portal` are included the same way. You do **not** need a matching `site:` line below for those CLIs to run.

The `site:` query templates in this file are the **WebSearch fallback** — for portals without a CLI, company career pages, or when a CLI fails.

**Language scope:** write every query category in every language listed in your CLAUDE.md Languages table (typically 1-2, sometimes more). A posting requiring a language you have *not* declared, as a job condition, is excluded before scoring; a posting requiring a *higher level* than you declared in a language you *do* work in is flagged for your own judgment, not excluded — see `04-job-evaluation.md`'s Language Gate, the single source of truth for this rule. Translate each category's keywords rather than machine-translating word-for-word (e.g. "Frontend Developer" -> "Desarrollador Frontend", not a literal word-for-word translation) if you work in more than one language.

## Search Sites

Primary (your market's job boards - scaffold one with `/add-portal`):
- **linkedin.com/jobs** - LinkedIn job listings (remote / Italy / EU-wide); also covered by `linkedin-search` CLI
- **freehire.com** - also covered by `freehire-search` CLI
- **elixirjobs.net** - niche Elixir job board; also covered by the `elixirjobs-search` CLI (`.agents/skills/elixirjobs-search/`)
- **rustjobs.dev** - niche Rust job board (not yet wired as a CLI skill - run `/add-portal` to scaffold it; until then, used via WebSearch `site:` queries below)
- **jobs.sequoiacap.com** - jobs aggregated across Sequoia Capital's portfolio companies, global, any sector; also covered by the `sequoia-search` CLI (`.agents/skills/sequoia-search/`). Personal use only (Consider's ToS) - keep volume low.

Secondary (company career pages via Google):
- No specific target companies identified yet - rely on title/skill-based queries below

## Query Categories

Queries are grouped by priority. Write **each category in every language from your Languages table** (see Language scope above). Combine each query with your location terms (e.g. your city, region, or metro area) where the site supports it.

**Organize by function, not job title.** The same underlying work carries different titles across companies and markets (a "Data Scientist" role at one employer may be posted as "Insights Analyst" or "Data Consultant" at another). Name each priority category after the function it covers, and list several plausible job titles as query variants within that category rather than betting an entire priority tier on one exact title string.

### Priority 1: Backend / Distributed Systems Engineering (Rust, Elixir & TypeScript)

These match your strongest and most desired career direction. TypeScript/Node.js queries were added alongside Rust and Elixir because the niche Rust/Elixir job volume is low - TypeScript/Node.js is also a declared Primary skill, so this widens the net without diluting fit.

English:
```
site:linkedin.com/jobs "Senior Backend Engineer" Rust Remote
site:linkedin.com/jobs "Senior Software Engineer" Elixir Remote
site:linkedin.com/jobs "Rust Engineer" Remote
site:linkedin.com/jobs "Elixir Engineer" Remote
site:linkedin.com/jobs "Senior Backend Engineer" TypeScript Remote
site:linkedin.com/jobs "Node.js Engineer" Remote
"Rust developer" Tokio remote job
"Elixir developer" OTP remote job
"TypeScript developer" Node.js remote job
"JavaScript developer" Node.js remote job
```

Spanish:
```
"Ingeniero de Backend Senior" Rust remoto
"Desarrollador Rust" remoto
"Desarrollador Elixir" remoto
"Desarrollador TypeScript" Node.js remoto
"Desarrollador JavaScript" Node.js remoto
```

Catalan:
```
"Enginyer de Backend Senior" Rust remot
"Desenvolupador Rust" remot
"Desenvolupador TypeScript" Node.js remot
```

Italian:
```
"Ingegnere Backend Senior" Rust remoto
"Sviluppatore Rust" remoto
"Sviluppatore Elixir" remoto
"Sviluppatore TypeScript" Node.js remoto
"Sviluppatore JavaScript" Node.js remoto
```

### Priority 2: Full-Stack / Product Engineering

These match your secondary career direction.

English:
```
site:linkedin.com/jobs "Full Stack Engineer" Remote
site:linkedin.com/jobs "Full Stack Developer" TypeScript Remote
```

Spanish:
```
"Desarrollador Full Stack" remoto
```

Catalan:
```
"Desenvolupador Full Stack" remot
```

Italian:
```
"Sviluppatore Full Stack" remoto
```

### Priority 3: Broader Experience Levels & Adjacent Roles

Given current market conditions, also search junior-level and staff/platform-level roles, not just senior.

English:
```
site:linkedin.com/jobs "Junior Software Engineer" Rust OR Elixir Remote
site:linkedin.com/jobs "Staff Software Engineer" Rust OR Elixir Remote
site:linkedin.com/jobs "Platform Engineer" Remote
```

Spanish:
```
"Ingeniero de Software Junior" remoto
```

Catalan:
```
"Enginyer de Software Junior" remot
```

Italian:
```
"Ingegnere Software Junior" remoto
```

### Priority 4: Broader Technical / Consulting

Wider net for general technical roles.

English:
```
site:linkedin.com/jobs "Backend Developer" Remote
"microservices" "distributed systems" developer remote job
```

Spanish:
```
"Desarrollador Backend" remoto
```

Catalan:
```
"Desenvolupador Backend" remot
```

Italian:
```
"Sviluppatore Backend" remoto
```

## Location Filter

Remote-only - not open to relocation (see Deal-breakers in CLAUDE.md). When evaluating results:
- Fully remote (any country) - PASS
- Hybrid with occasional travel to Palermo, Italy - borderline, discuss with user
- On-site only, or requires relocation - FAIL (deal-breaker)

## Language Filter

Your working languages and levels are in CLAUDE.md's Languages table. When filtering scraped results, apply `04-job-evaluation.md`'s Language Gate: a posting requiring a language you haven't declared at all is excluded; a posting requiring a higher level than you declared in a language you do work in is not excluded, flag it clearly instead (see `job-scraper/SKILL.md`'s Step 3 "Quick Fit Assessment" for how the flag surfaces in `/scrape` output). Postings simply *written* in a language you don't work in, that don't require it on the job, are fine.

## Date Filter

Posting age is never a reason to exclude a job. An old posting that's still open at the source represents a real, currently-live opening - a listing from months ago with no applicant yet found is at least as actionable as a fresh one. Do not scope searches to a recency window and do not drop a result for being old; the only thing that excludes a posting is being shown closed/expired/inactive at the source (see `job-scraper/SKILL.md` Step 2's Closed-at-source detection) or past a stated deadline. `posted_date` is recorded purely as an informational freshness signal for the reader and for `/rank`, never as a filter. If a posting date cannot be determined, include it and record it as unknown - don't guess one.

## Adapting Queries

If the user specifies a focus area, select queries from the matching category and also generate 2-3 custom queries for that focus. For example:
- "/scrape [focus_area]" -> relevant category queries + custom focus-specific queries
