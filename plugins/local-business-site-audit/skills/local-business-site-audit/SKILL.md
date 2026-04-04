---
name: local-business-site-audit
description: >
  Run a comprehensive website and online presence audit for local service businesses
  (smart home installers, AV integrators, contractors, home services). Use when auditing
  a local business website for visibility problems, diagnosing why a business with strong
  close rates is not getting enough leads, or generating a client-ready audit report.
  Also trigger when someone says "audit this site", "why am I not getting leads",
  "nobody can find me online", "my marketing isn't working", or any variation of assessing
  a local service company's digital presence.
metadata:
  version: 2.0.0
---

# Local Business Site Audit

A multi-agent workflow for diagnosing why a local service business with a strong close rate is not generating enough inbound leads. Not a generic SEO checklist — a top-of-funnel visibility diagnostic that produces a business-value-focused deliverable a non-technical business owner can act on.

## Context

The target client profile is a skilled tradesperson or installer (smart home, AV, electrical, HVAC, plumber, etc.) who:
- Closes 60-80% of the deals they get in front of
- Relies on passive referrals and organic website traffic
- Has no active marketing strategy or ad spend
- Needs more qualified prospects, not better sales skills

The audit answers one question: **Where are you losing people who would hire you if they could find you?**

## Required Inputs

- Business URL
- Business type (e.g., "Control4 smart home installer")
- Service area (city/region)
- 2-3 competitor URLs (or the skill will identify them from search results)

---

## Agent Architecture

```
Phase 1 — Parallel (haiku):
  market-site-analyzer (business site — scope: site)
  market-local-visibility-researcher (search visibility + directories)
  market-competitor-profiler (2-3 competitors)

Phase 2 — Synthesis:
  market-strategic-synthesis (local-specific: content gaps, conversion issues, visibility gaps)
```

---

## Phase 1 — Data Collection (all in parallel)

**Agent 1: market-site-analyzer**
- `url`: business homepage
- `scope`: `site` (includes robots.txt, sitemap, about/services/contact pages)

From market-site-analyzer output, also note these local-business-specific conversion signals (beyond what the agent returns natively):
- Phone number visible above the fold? (check h1/h2/links for `tel:`)
- Service area explicitly stated on the page?
- Manufacturer/brand certifications mentioned? (Control4, Lutron, Sonos, etc.)
- Project photos or gallery present? (check for img-heavy sections)
- Testimonials or reviews displayed on-site?
- How many clicks from homepage to contact form?

**Agent 2: market-local-visibility-researcher**
- `business_name`: from URL/context
- `business_url`: the business URL
- `business_type`: the provided business type
- `service_area`: the provided service area
- `brand_affiliations`: any manufacturer brands mentioned on the site

**Agent 3: market-competitor-profiler**
- `competitors`: the provided competitor URLs (or identify via market-local-visibility-researcher's `top_competitors` in queries_tested)
- `industry`: business type
- `service_area`: service area
- `target_business`: business name

Wait for all three to complete.

---

## Phase 2 — Strategic Synthesis

After Phase 1, check if a gap analysis + recommendations are needed (always yes for a full audit).

Invoke `market-strategic-synthesis` with:
- `context.subject_name`: business name
- `context.subject_url`: business URL
- `context.industry`: business type
- `context.research_goal`: "top-of-funnel lead generation for local service business"
- `context.depth`: "deep_dive"
- `site_analysis`: Agent 1 output
- `local_visibility`: Agent 2 output
- `competitor_profiles`: Agent 3 output
- `custom_findings`: the conversion signals noted from market-site-analyzer (phone, service area, certifications, etc.)

---

## Phase 3 — Report Generation

Compile a client-ready audit report. This report is written for a non-technical business owner, not a developer.

```markdown
# [Business Name] — Digital Presence Audit
**Prepared**: [date]
**Business type**: [type] serving [service area]

---

## The Bottom Line

[1-2 sentence plain-English summary of the #1 problem. E.g., "You're not showing up when [city] homeowners search for smart home installation — your top competitor appears 6x more often in search results."]

---

## Why Leads Aren't Finding You

### Search Visibility
[From market-local-visibility-researcher: visibility_rate, local_pack_appearances, top competitor comparison]

**You appear in [N]% of local search queries** ([N]/[N] tested).

| Query | Your Position | Top Competitor |
|-------|--------------|----------------|
[For each query tested]

**Directory presence:**
| Platform | Status | Notes |
|----------|--------|-------|
| Google Business Profile | [found/missing] | [reviews/rating] |
| Yelp | [found/missing] | |
| Houzz | [found/missing] | |
| HomeAdvisor/Angi | [found/missing] | |
[etc.]

**NAP Consistency**: [any issues from nap_consistency]

---

### Website Conversion

[From market-site-analyzer + custom conversion signals]

| Check | Status | Impact |
|-------|--------|--------|
| Phone number above fold | ✓/✗ | High |
| Service area stated on page | ✓/✗ | High |
| Clear value proposition | ✓/✗ | High |
| Service pages per offering | ✓/✗ | Medium |
| Project photos / portfolio | ✓/✗ | Medium |
| Testimonials on-site | ✓/✗ | Medium |
| Mobile performance | [score] | [impact] |

---

### How You Compare to Top Competitors

[From market-competitor-profiler: comparison_matrix]

| | You | [Competitor A] | [Competitor B] |
|-|-----|---------------|----------------|
| Google reviews | [N] | [N] | [N] |
| Houzz presence | | | |
| Blog / content | | | |
| Service pages | | | |
| AI citation readiness | | | |

---

## Priority Recommendations

[From market-strategic-synthesis: top recommendations, adapted for local business language]

For each recommendation:
**[N]. [Short title]**
- **What to do**: [Specific action in plain language]
- **Why it matters**: [Business impact, not SEO jargon]
- **Effort**: [Low: do this week / Medium: takes a few days / High: needs an agency]

---

## Quick Wins (Do This Week)

[3 items from recommendations with effort: low]

---

## 90-Day Roadmap

[From market-strategic-synthesis ninety_day_plan, adapted for local business]

**Month 1 — Get Found**
[Actions focused on Google Business Profile, key directories, NAP consistency]

**Month 2 — Convert Better**
[Actions focused on site conversion: phone placement, service pages, testimonials]

**Month 3 — Build Authority**
[Actions focused on reviews, content, and off-site presence]
```

---

## References

- [Industry Keywords](../../../../references/seo/industry-keywords.md) — local search queries by service vertical (smart home, AV, contractors, home services)
- [Local SEO Checklist](../../../../references/seo/local-seo-checklist.md) — Google Business Profile, local signals, schema markup, citation consistency

---

## Output Rules

- Write the report for the business owner, not a developer or SEO specialist
- Translate technical findings into business language ("Your page loads in 5.2 seconds — visitors typically leave after 3")
- Every finding must have a severity and a specific fix
- Lead with the #1 problem, not a list of everything wrong
- The report should be scannable — a business owner should understand the situation in under 5 minutes
- Do not show agent JSON in the report
