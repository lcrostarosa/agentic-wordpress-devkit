---
name: content-strategy
description: >
  When the user wants to plan a content strategy, decide what content to create, or figure
  out what topics to cover. Also use when the user mentions "content strategy", "what should I
  write about", "content ideas", "blog strategy", "blog positioning", "topic clusters",
  "content planning", "editorial calendar", "content marketing", "content roadmap", "what
  content should I create", "blog topics", "content pillars", "I don't know what to write",
  "AI citation strategy", "GEO strategy", "hub and spoke", "cluster architecture".
  For writing individual pieces, see content-blog-write or marketing-copywriting.
  For SEO audits, see market-seo-audit.
metadata:
  version: 2.0.0
---

# Content Strategy

Orchestrates a multi-agent content strategy. Research agents gather competitive landscape, customer language, and SERP data in parallel. Strategic synthesis produces your content pillars, cluster architecture, and 90-day roadmap.

## Context Gathering

**Check for product marketing context first:**
If `.agents/product-marketing-context.md` exists, read it. Use that context and ask only for what's missing.

Gather minimally:
1. **Business**: What do you sell? Who is your customer?
2. **Goal**: Traffic, leads, brand authority, AI citations, or all?
3. **Format**: Blog-focused strategy, or broader content (video, social, email)?
4. **Competitors**: 2-5 competitor URLs or names
5. **Differentiator**: What unique expertise, data, or point of view do you have?
6. **Site URL** (optional): Your existing site URL — used to inventory published content before building the roadmap

---

## Phase 1 — Research (parallel)

Invoke all three agents in parallel — do not wait for one before starting the next.

**Agent 1:** `market-competitor-profiler`
- `competitors`: the provided competitor URLs
- `industry`: inferred from business description

**Agent 2:** `market-serp-researcher`
- `queries`: generate 8-12 queries covering the business's core topic areas
  - 3-4 core topic queries (primary services/products)
  - 2-3 problem-aware queries ("how to [solve X]", "why does [problem] happen")
  - 2-3 comparison queries ("best [category]", "[category] comparison")
  - 1-2 AI citation proxy queries (run query and note if AI Overview appears)
- `target_domain`: the user's domain if provided

**Agent 3:** `market-review-miner` (if B2C or review-heavy industry)
- `target`: the user's business
- `platforms`: ["google", "g2", "capterra", "reddit"] (adjust by industry)
- `focus_themes`: ["pain_points", "switching_reasons", "language_patterns"]

**Agent 4: `content-inventory`** (only if a site URL was provided)
- `url`: the site URL from Context Gathering
- `max_posts`: 50
- `fetch_posts`: false

**Agent 5: `market-trend-researcher`** (run in all cases)
- `industry`: inferred from business description
- `seed_topics`: 3-5 core topic areas derived from the business description and goals
- `time_horizon`: "short"

Run all applicable agents in parallel. Wait for all to complete before Phase 2.

---

## Phase 2 — Branch

After Phase 1 completes, evaluate whether to invoke `market-strategic-synthesis`:

**Invoke if:**
- User requested "deep dive" or "full strategy"
- Competitor profiler returned strong competitor profiles (3+ detailed profiles)
- The business has a specific competitive positioning challenge

**Skip if:**
- User wants a quick content plan
- Competitor data is sparse
- User just needs topic ideas, not market positioning

If invoking `market-strategic-synthesis`:
- `context.research_goal`: "content strategy and market positioning"
- `context.depth`: "deep_dive"
- `competitor_profiles`: Phase 1 market-competitor-profiler output
- `seo_comparison` (if available): Phase 1 market-serp-researcher output

---

## Phase 3 — Synthesize

**Before generating topics:** If `content-inventory` ran, scan its output. Cross-reference any cluster or spoke topics against existing published post titles and categories. Skip topics the site already covers well. Note gaps — high-value topics missing from the current content library — explicitly in the roadmap.

**Incorporate trend signals:** Use `market-trend-researcher` output to identify emerging topics with momentum. Flag any trend signals that map to a content gap as high-priority roadmap items.

Produce the strategy document. Adapt based on the `format` input (blog-focused adds cluster architecture; general content adds channel strategy).

### Audience Segments (2-3)

Based on competitor profiles and customer language from market-review-miner:

```
### Segment: [Name]
- **Role**: [Who they are]
- **Pain points**: [What problems they have — use their language from reviews]
- **Search behavior**: [What they search for — from SERP data]
- **AI behavior**: [What they ask ChatGPT/Perplexity — inferred from question queries]
- **Buying stage**: Awareness / Consideration / Decision
```

### Content Pillars (3-5)

Build around the intersection of: customer pain points + competitor gaps + SERP opportunities.

```
### Pillar: [Topic Area]
- **Why this pillar**: [Customer demand evidence + competitive gap]
- **Primary keywords**: [3-5 from SERP data]
- **Unique angle**: [What first-hand expertise/data can you bring?]
- **AI citation potential**: High / Medium / Low — [reason]
- **Content types**: [pillar guide, how-tos, comparisons, FAQs]
```

### Cluster Architecture (blog format only)

For each pillar, design the hub-and-spoke structure:

```
### Cluster: [Pillar Topic]

Pillar page (3,000-4,000 words): [Title] → [Primary keyword]

Spokes (1,500-2,500 words each):
| # | Title | Template | Keyword | Linked to |
|---|-------|----------|---------|-----------|
| 1 | [Spoke title] | how-to-guide | [keyword] | Pillar + Spokes 2,3 |
| 2 | [Spoke title] | comparison | [keyword] | Pillar + Spokes 1,3 |
| 3 | [Spoke title] | listicle | [keyword] | Pillar + Spokes 1,2 |
| 4-8 | ... | ... | ... | ... |

Templates: how-to-guide, listicle, case-study, comparison, pillar-page, thought-leadership, data-research, faq-knowledge
```

### AI Citation Surface Strategy (blog format)

Based on SERP data showing AI Overview presence and competitor AI citation signals:

```
### On-Site Optimization
Every post must include:
- Answer-first H2 sections (40-60 word direct answer per section)
- Citation capsules: self-contained passages that answer a question without surrounding context
- Question-form headings (target: 60%+ of H2s as questions)
- FAQ section with JSON-LD FAQ schema
- Consistent entity naming (no synonym variation for key concepts)

### Off-Site Presence (88-92% of AI citations are off-site)
| Channel | AI Citation Impact | Priority Action |
|---------|-------------------|-----------------|
| YouTube | 0.737 correlation (strongest) | Companion videos for pillar posts |
| Reddit | 450% citation surge | Authentic participation in 3-5 subreddits |
| Review platforms | 2.6-3.5x multiplier | Maintain profiles on G2/Capterra (B2B) |
| Industry publications | Tier 2-3 citation source | Guest posts, expert commentary |

Only 12% overlap between platforms — optimize for each separately.
```

### Competitive Positioning

From market-competitor-profiler and market-strategic-synthesis output:

```
### How to Stand Out

**Competitor gaps identified:**
[List top 3 gaps from competitor profiles — topics they cover poorly or don't cover at all]

**Your differentiation:**
[How your unique angle fills those gaps]

**Content to create first:**
[The specific content that would exploit the biggest gap]
```

### 90-Day Content Roadmap

```
## Content Roadmap

### Month 1 — Foundation
- [ ] Publish [Pillar 1] guide
- [ ] Publish [N] supporting spokes for Pillar 1
- [ ] Set up AI citation tracking (monitor 10-20 target queries monthly)
- [ ] Establish YouTube/Reddit presence (whichever fits the business)

### Month 2 — Expansion
- [ ] Publish [Pillar 2] guide + [N] spokes
- [ ] First content update cycle (refresh any Month 1 pieces)
- [ ] Begin off-site distribution (review platform profiles)

### Month 3 — Optimization
- [ ] Audit all published posts (run content-blog-optimize on each, target 75+ score)
- [ ] Publish [Pillar 3] guide
- [ ] Review SERP positions and adjust keyword targets
- [ ] AI citation check: search 10 target queries on ChatGPT, Perplexity, AI Overviews

### Content Velocity
- New posts: [N/week based on stated resources]
- Freshness updates: [N/month]
- Minimum quality bar: 75+ on content-blog-optimize score before publishing
```

### Measurement Framework

```
## What to Track

### Traditional SEO (monthly)
- Organic traffic (Google Analytics)
- Keyword rankings for cluster targets (Search Console)
- Indexed page count growth

### AI Citations (monthly — manual)
- Search 10-20 target queries on ChatGPT, Perplexity, Google AI Overviews
- Note which queries cite your brand
- Track trend: citations growing or flat?

### Business Impact
- Blog-attributed leads/conversions (UTM tracking)
- Email subscribers from blog
```

---

## References

- [Headless CMS Guide](../../../../references/content/headless-cms.md) — CMS architecture patterns, content modeling, and editorial workflows

---

## Output Rules

- Do not show agent JSON to the user — only the synthesized strategy
- Ground all recommendations in evidence from the agents (e.g., "competitors average 2.3 stars on G2 for onboarding — this is your opening")
- If competitor profiles are sparse, note what additional research would sharpen the strategy
- For blog-format requests: always include cluster architecture
- For general content requests: replace cluster architecture with channel strategy table
