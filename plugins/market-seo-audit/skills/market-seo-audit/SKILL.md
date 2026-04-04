---
name: market-seo-audit
description: >
  When the user wants to audit, review, or diagnose SEO issues on their site.
  Also use when the user mentions "SEO audit", "technical SEO", "why am I not ranking",
  "SEO issues", "on-page SEO", "meta tags review", "SEO health check", "my traffic dropped",
  "lost rankings", "not showing up in Google", "site isn't ranking", "Google update hit me",
  "page speed", "core web vitals", "crawl errors", "indexing issues", or "help with SEO".
  For adding structured data, see market-seo-schema-markup. For AI search optimization, see content-blog-optimize.
metadata:
  version: 2.0.0
---

# SEO Audit

Orchestrates a multi-agent SEO diagnostic. Phase 1 collects baseline data. Phase 2 branches based on what's found — a local business triggers different agents than a SaaS blog. Phase 3 synthesizes findings into a prioritized action plan.

## Context Gathering

**Check for product marketing context first:**
If `.agents/product-marketing-context.md` exists, read it before asking questions.

Gather minimally:
1. **Site URL** — the homepage or target page to audit
2. **Site type** — if not obvious from the URL (SaaS, e-commerce, blog, local business)
3. **Depth** — quick scan (baseline only) or deep dive (full analysis with recommendations)?
4. **Competitor URLs** (optional) — provide 2-3 for SEO comparison

If the user provides a URL and says "audit my site" — start. Don't ask for all five things before beginning.

---

## Phase 1 — Baseline Collection (always)

Invoke `market-site-analyzer` agent with:
- `url`: the provided URL
- `scope`: `site` (fetch robots.txt, sitemap, and key pages)

Run as a background agent. Wait for completion before Phase 2.

---

## Phase 2 — Branch (based on Phase 1 output)

After `market-site-analyzer` completes, evaluate the JSON output and decide which additional agents to invoke. Run all applicable branches in parallel.

**Branch A — Local business detected:**
Condition: `schema.types_found` contains "LocalBusiness" OR any H2 heading contains city/location keywords OR business type signals (HVAC, plumber, contractor, dentist, law firm, etc.) are in page content.

→ Invoke `market-local-visibility-researcher` agent with:
- `business_name`: extracted from title tag or H1
- `business_url`: the site URL
- `business_type`: inferred from content
- `service_area`: extracted from page content or title

**Branch B — Blog / content site detected:**
Condition: `schema.types_found` contains "Article" or "BlogPosting" OR `/blog/` in URL patterns OR multiple article-structured pages detected.

→ Invoke `market-on-page-seo-scorer` agent on 2-3 sample posts:
- `content`: sample post URLs
- `mode`: `blog-post`
- `primary_keyword`: extracted from post titles/headings

**Branch C — Competitors provided:**
Condition: user provided competitor URLs.

→ Invoke `market-seo-comparison` agent with:
- `entities`: user site + competitor URLs (each with role: "user" or "competitor")
- `site_analysis_results`: Phase 1 market-site-analyzer output
- `industry`: inferred from content

**Branch D — Deep dive requested:**
Condition: user requested "deep dive" or "full audit" AND at least Phase 1 + one other branch has completed.

→ Invoke `market-strategic-synthesis` agent with all collected data.

If none of Branch A/B/C applies (e.g., a simple single-page site), proceed directly to Phase 3 with Phase 1 data only.

---

## Phase 3 — Synthesize

Compile findings from all agents into an audit report. The report adapts based on which branches ran.

### Schema Detection Note

**Important:** `market-site-analyzer` (and any WebFetch-based tool) cannot detect JavaScript-injected schema markup. Many WordPress plugins (Yoast, RankMath, AIOSEO) inject JSON-LD via JS. Never report "no schema found" as a definitive finding from this audit. Always note: *"Schema detection may be incomplete — verify with Google's Rich Results Test, which renders JavaScript."*

---

### Report Format

```
## SEO Audit: [Site Name / URL]
**Date**: [date]
**Depth**: Quick Scan / Deep Dive
**Agents run**: market-site-analyzer[, market-local-visibility-researcher][, market-on-page-seo-scorer][, market-seo-comparison][, market-strategic-synthesis]

---

## Executive Summary

[2-3 sentences: overall health, #1 issue, highest-impact opportunity]

---

## Technical Foundations

[From market-site-analyzer output]

| Check | Status | Finding | Priority |
|-------|--------|---------|----------|
| HTTPS | ✓/✗ | | |
| Mobile viewport | ✓/✗ | | |
| robots.txt | ✓/✗ | | |
| Sitemap | ✓/✗ | | |
| Performance (mobile) | [score] | LCP: [X]s, CLS: [X] | |
| AI crawler access | ✓/✗ | GPTBot/ClaudeBot/PerplexityBot status | |

Issues found:
[List critical_issues and warnings from market-site-analyzer summary, with impact and fix]

---

## On-Page SEO

[From market-site-analyzer meta/headings data]

| Element | Status | Detail |
|---------|--------|--------|
| Title tag | | "[content]" — [N] chars |
| Meta description | | "[content]" — [N] chars |
| H1 | | "[content]" |
| Canonical | | |
| OG tags | | |

[If market-on-page-seo-scorer ran for blog posts, show per-post scores here]

**Schema markup:** [types found from source HTML] — *Note: JS-injected schema not detectable; verify with Rich Results Test.*

---

## Local Search Visibility [only if Branch A ran]

[From market-local-visibility-researcher output]

- Visibility rate: [N]% of queries ([N]/[N] tested)
- Local pack appearances: [N]
- Google Business Profile: [found/not found], [N] reviews, [rating]
- Key competitor: [name] — [N] reviews, avg position [X]

Gaps: [critical_gaps from agent output]

---

## Competitive SEO [only if Branch C ran]

[From market-seo-comparison output]

[Keyword visibility table and content footprint comparison]

---

## Strategic Recommendations [only if Branch D ran]

[From market-strategic-synthesis output — executive summary + top 3 recommendations]

---

## Prioritized Action Plan

**Critical (fix first — blocking ranking or indexation):**
1. [Issue + specific fix + evidence]

**High impact (significant ranking improvements available):**
2. [Issue + specific fix + evidence]
3. [Issue + specific fix + evidence]

**Quick wins (easy, immediate improvement):**
4. [Issue + specific fix]

**Long-term (build over weeks/months):**
5. [Ongoing investment]
```

---

## References

- [AI Writing Detection](../../../../references/seo/ai-writing-detection.md) — em dash density, AI-tell phrases, filler intensifiers, structural uniformity scoring

---

## Output Rules

- Do not show agent JSON to the user — only the synthesized report
- Every finding must cite evidence from agent output (e.g., "PageSpeed score: 43/100, LCP: 4.2s")
- Don't list issues the agent found no evidence for
- For schema: always use WARN language — never say definitively "no schema found" from WebFetch output
- If an agent fails, note "data unavailable" for that section and continue
