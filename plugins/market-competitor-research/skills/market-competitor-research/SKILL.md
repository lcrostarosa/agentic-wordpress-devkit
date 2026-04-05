---
name: market-competitor-research
description: >
  When the user wants to research competitors, understand their competitive landscape,
  or get strategic recommendations based on competitor analysis. Also use when the user
  mentions "competitor research", "competitive analysis", "competitive landscape",
  "who are my competitors", "what are competitors doing", "competitive intelligence",
  "how do I compare to competitors", "competitor SEO", "competitor strategy",
  "benchmark against competitors", "market positioning", "market research",
  "competitor audit", or "competitive scan".
  For competitor comparison pages (vs pages, alternatives), see market-competitor-alternatives.
  For customer-focused research (personas, VOC), see market-customer-research.
metadata:
  version: 2.0.0
---

# Competitor Research — Multi-Agent Competitive Intelligence

A multi-agent workflow that collects structured data about 1-5 competitors, classifies their market positioning, analyzes their SEO posture, and synthesizes strategic recommendations. Tier 1 agents (haiku) handle data collection. Tier 3 (opus) handles strategic synthesis.

## Context Gathering

**Check for `.agents/product-marketing-context.md` first.** If present, read it before asking questions.

Gather what isn't already known:
1. **Your site URL**
2. **Competitor URLs** (1-5) — if unknown, run competitor discovery below
3. **Industry / niche**
4. **Research goal** — content strategy, product positioning, SEO planning, market entry?
5. **Depth** — quick scan (executive summary + top 3 recommendations) or deep dive (full report with 90-day plan)?

**Competitor Discovery** (if URLs not provided):
Search `best [product/service category]`, `[category] alternatives`, `top [category] [year]`. Present 3-5 results to the user for confirmation before proceeding.

---

## Agent Architecture

```
Phase 1 — Parallel (haiku):
  market-site-analyzer (user site + each competitor)
  market-competitor-profiler (all competitors)
  market-segment-classifier (all entities)

Phase 2 — Sequential (sonnet):
  market-seo-comparison (consumes Phase 1 output)

Phase 3 — Sequential (opus):
  market-strategic-synthesis (consumes all prior output)
```

---

## Phase 1 — Data Collection (run all in parallel)

**Agent 1: market-site-analyzer** (invoke once per entity)
- User's site: `scope: "site"` (includes robots.txt, sitemap, key pages)
- Each competitor: `scope: "page"` (homepage only)

**Agent 2: market-competitor-profiler**
- `competitors`: all competitor URLs as an array
- `industry`: inferred from user's business
- `target_business`: user's business name

**Agent 3: market-segment-classifier**
- `entities`: user site + all competitor URLs (each with name + url)
- `existing_data`: pass Agent 1 results once available (avoids re-fetching)

Wait for all three to complete before Phase 2.

---

## Phase 2 — SEO Comparison (after Phase 1)

**Agent 4: market-seo-comparison**
- `entities`: all entities with roles ("user" or "competitor")
- `site_analysis_results`: Agent 1 output
- `competitor_profiles`: Agent 2 output
- `market_classifications`: Agent 3 output
- `industry`: inferred
- `primary_keywords` (optional): user-provided

---

## Phase 3 — Strategic Synthesis (after Phase 2)

**Agent 5: market-strategic-synthesis**
- `context.subject_name`: user's business name
- `context.subject_url`: user's URL
- `context.industry`: inferred
- `context.research_goal`: from intake
- `context.depth`: "quick_scan" or "deep_dive"
- `competitor_profiles`: Agent 2 output
- `market_classifications`: Agent 3 output
- `seo_comparison`: Agent 4 output
- `site_analysis`: Agent 1 output (user's site)

---

## Report

Compile all agent outputs into a structured report. The report adapts based on depth.

### Quick Scan Format
```
## Competitive Intelligence: [Business Name]
**Date**: [date] | **Depth**: Quick Scan | **Competitors analyzed**: [N]

### Executive Summary
[From market-strategic-synthesis: 3-5 sentences, specific numbers, top finding]

### Threat Assessment
| Competitor | Threat Level | Why Dangerous | Vulnerability |
|------------|-------------|---------------|---------------|
[From market-strategic-synthesis threat_assessment]

### Top 3 Recommendations
[From market-strategic-synthesis recommendations, ranked by impact]
```

### Deep Dive Format
Full report with all sections from market-strategic-synthesis plus:
- Competitive positioning map (axis descriptions + quadrant placement)
- SEO keyword visibility table (from market-seo-comparison)
- Content footprint comparison
- Gap analysis: table stakes, differentiation opportunities, emerging trends
- 90-day action plan

---

## References

- [Market Segment Taxonomy](../../../../references/competitor/market-segment-taxonomy.md) — industry verticals, business models, and market segment classifications
- [SEO Comparison Framework](../../../../references/competitor/seo-comparison-framework.md) — keyword visibility scoring, content footprint analysis, authority signals
- [Strategic Analysis Frameworks](../../../../references/competitor/strategic-analysis-frameworks.md) — positioning maps, threat assessment matrices, gap analysis templates

---

## Core Principles

- Every claim must cite specific data from agent outputs — no opinion without evidence
- Acknowledge where competitors are genuinely strong — honest analysis is more useful than flattery
- Every recommendation: what to do, why (with evidence), expected impact, effort, timeline
- Do not show agent JSON to the user — only the synthesized report

---

## Output Rules

- Never show raw agent JSON to the user — synthesize into the structured report.
- Only list competitors with evidence — no speculation on internal metrics.
- Ground every recommendation in data from agent outputs.
- If data is unavailable, say so explicitly rather than guessing.
