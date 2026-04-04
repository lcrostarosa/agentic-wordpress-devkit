---
name: content-blog-optimize
description: >
  Post-writing SEO validation and AI citation readiness audit for blog posts.
  Runs on-page SEO scoring (title, meta, headings, links, OG, schema, URL) and
  AI citation readiness (answer-first format, citation capsules, question headings,
  FAQ schema, entity consistency). Generates a pass/fail table and citation capsules.
  Use when user says "seo check", "check seo", "validate seo", "blog seo",
  "optimize post", "on-page seo", "title tag check", "meta description check",
  "heading check", "link audit", "geo", "ai citation", "ai optimization",
  "citation audit", "aeo", "perplexity optimization", "chatgpt citation",
  "citation readiness", "ai-ready".
metadata:
  version: 1.0.0
---

# Blog Optimize

Runs on-page SEO validation and AI citation readiness scoring on a completed blog post. Produces a pass/fail table with specific fixes and optionally generates citation capsules for the post's key sections.

## Context Gathering

Ask for — or detect from the current project:
1. **Content**: File path or URL of the blog post to check
2. **Primary keyword**: The target keyword for this post
3. **Mode**: SEO check only, AI citation only, or both (default: both)

Check for `.agents/product-marketing-context.md` — if present, read it for site context before asking.

## Phase 1 — Score

Invoke the `market-on-page-seo-scorer` agent with:
- `content`: the provided file path or URL
- `mode`: `ai-citation` (covers all blog-post SEO checks + AI citation readiness)
- `primary_keyword`: the provided keyword

Run this as a background agent — do not narrate progress to the user.

## Phase 2 — Synthesize

From the agent's JSON output, produce:

### SEO Validation Table

```
## SEO Validation Report: [Post Title]

**File/URL**: [path or URL]
**Primary Keyword**: [keyword]
**SEO Score**: [X/100] — [EXCELLENT / GOOD / NEEDS WORK / POOR / CRITICAL]

| # | Check | Status | Detail | Fix |
|---|-------|--------|--------|-----|
| 1 | Title tag length | PASS/FAIL | "52 chars" | — |
| 2 | Title keyword placement | PASS/FAIL | "keyword in first 28 chars" | — |
| 3 | Meta description length | PASS/FAIL | "155 chars" | — |
| 4 | Meta description keyword | PASS/FAIL | | — |
| 5 | Single H1 | PASS/FAIL | | — |
| 6 | H1 contains keyword | PASS/FAIL | | — |
| 7 | Heading hierarchy valid | PASS/FAIL | | — |
| 8 | Internal links (3+) | PASS/FAIL | "[N] internal links" | — |
| 9 | Descriptive anchor text | PASS/FAIL | | — |
| 10 | URL keyword present | PASS/FAIL | | — |
| 11 | URL length | PASS/FAIL | | — |
| 12 | OG title | PASS/FAIL | | — |
| 13 | OG description | PASS/FAIL | | — |
| 14 | OG image | PASS/FAIL | | — |
| 15 | Schema present | PASS/WARN | "[types found] — note: WebFetch may miss JS-injected schema" | — |
```

Map agent scores to PASS (≥ full points for that dimension), WARN (partial), or FAIL (0 or low).

### AI Citation Readiness

```
## AI Citation Readiness: [X/100]

| Check | Status | Detail |
|-------|--------|--------|
| Answer-first format | PASS/FAIL | "H2 sections open with direct answer paragraphs" |
| Question headings | PASS/FAIL | "[N]% of H2s are questions (target: 50%+)" |
| Citation capsules | PASS/FAIL | "Self-contained 40-60 word passages per section" |
| FAQ section | PASS/FAIL | |
| Entity consistency | PASS/FAIL | |
| Sourced statistics | PASS/FAIL | |
| Scannable structure | PASS/FAIL | |
```

### Priority Fixes

List the top 3 fixes sorted by points_available from the agent output, as specific numbered items:

```
### Priority Fixes
1. **[Dimension]** — [Specific fix with exact action] (+[N] pts)
2. **[Dimension]** — [Specific fix with exact action] (+[N] pts)
3. **[Dimension]** — [Specific fix with exact action] (+[N] pts)
```

## Phase 3 — Citation Capsules (if ai-citation mode or both)

After the report, generate 3 citation capsules for the post's main sections.

A citation capsule is a 40-60 word self-contained passage that:
- Answers one specific question completely
- Contains a specific data point or claim
- Makes sense extracted from context (no "as mentioned above")
- Ends with a complete thought

Read the blog post content (if not already in memory) and identify the 3 most citable sections. Write a citation capsule for each, starting with the answer to the section's question.

```
## Citation Capsules

These 40-60 word passages are formatted for maximum AI citability. 
Add them as the opening paragraph of their respective H2 sections.

**[Section heading]**
> [Citation capsule — 40-60 words, answer-first, includes a specific data point]

**[Section heading]**
> [Citation capsule]

**[Section heading]**
> [Citation capsule]
```

## Output Rules

- Do not show agent JSON to the user — only the synthesized report
- PASS = meets criteria cleanly, FAIL = misses criteria, WARN = partially meets or can't verify
- For schema: always use WARN (not FAIL) because WebFetch cannot detect JS-injected schema — note the limitation
- If the file/URL can't be fetched, report the error and ask the user to provide the content directly
