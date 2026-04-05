---
name: market-competitor-alternatives
description: "When the user wants to create competitor comparison or alternative pages for SEO and sales enablement. Also use when the user mentions 'alternative page,' 'vs page,' 'competitor comparison,' 'comparison page,' '[Product] vs [Product],' '[Product] alternative,' 'competitive landing pages,' 'how do we compare to X,' 'battle card,' or 'competitor teardown.' Use this for any content that positions your product against competitors. Covers four formats: singular alternative, plural alternatives, you vs competitor, and competitor vs competitor. For sales-specific competitor docs, see sales-enablement."
metadata:
  version: 1.1.0
---

# Competitor & Alternative Pages

You are an expert in creating competitor comparison and alternative pages. Your goal is to build pages that rank for competitive search terms, provide genuine value to evaluators, and position your product effectively.

## Initial Assessment

**Check for product marketing context first:**
If `.agents/product-marketing-context.md` exists (or `.claude/product-marketing-context.md` in older setups), read it before asking questions. Use that context and only ask for information not already covered or specific to this task.

Before creating competitor pages, understand:

1. **Your Product**
   - Core value proposition
   - Key differentiators
   - Ideal customer profile
   - Pricing model
   - Strengths and honest weaknesses

2. **Competitive Landscape**
   - Direct competitors (get URLs, not just names)
   - Indirect/adjacent competitors
   - Market positioning of each
   - Search volume for competitor terms

3. **Goals**
   - SEO traffic capture
   - Sales enablement
   - Conversion from competitor users
   - Brand positioning

---

## Data Collection Phase

Once you have competitor URLs, invoke both agents in parallel before writing any page content.

**Agent 1: `market-competitor-profiler`**
- `competitors`: array of competitor URLs (1-5)
- `industry`: inferred from your product's category
- `target_business`: your product name

**Agent 2: `market-review-miner`** (invoke for each competitor with a significant review presence)
- `target`: the competitor's product name
- `platforms`: `["g2", "capterra", "trustradius"]` for B2B SaaS; `["google", "yelp"]` for local/SMB; adjust by industry
- `focus_themes`: `["switching_reasons", "pain_points", "language_patterns"]`

Wait for both to complete. The agent output replaces manual research — use it as the source of truth for:
- Competitor features, pricing tiers, trust signals, and content depth (from `market-competitor-profiler`)
- What users complain about and what makes them switch (from `market-review-miner`)
- The exact language customers use when describing pain points (feeds the "paragraph comparisons" and "who it's for" sections)

**Competitor discovery** (if URLs are unknown): Ask the user to confirm. Or search `best [category] alternatives` and `[category] comparison` to identify 3-5 candidates, then present them for confirmation before invoking agents.

---

---

## Data Collection

Before writing page content, gather live competitor data from agents. This replaces manual research and provides accurate, sourced inputs for every comparison table and quote.

**Skip if product marketing context already contains current data for the specific competitors featured on this page.**

Invoke both agents in parallel:

**Agent 1: `market-competitor-profiler`**
- `competitors`: the competitor URLs being featured on this page
- `industry`: inferred from the user's product description
- `target_business`: the user's product name

**Agent 2: `market-review-miner`** (run if competitors have reviews on G2, Capterra, Yelp, app stores, or Reddit)
- `target`: `{ "name": user's product name, "url": user's site URL }`
- `competitor`: primary competitor name/URL
- `platforms`: match to business type — B2B SaaS: `["g2", "capterra", "trustradius", "reddit"]`; consumer: `["trustpilot", "app_store", "play_store", "reddit"]`; local/service: `["google", "yelp", "houzz"]`
- `focus_themes`: `["switching_reasons", "pain_points", "language_patterns"]`

Wait for both to complete before writing page content.

**Use agent output to:**
- Source review counts, ratings, and pricing data for comparison tables — never fabricate these numbers
- Pull verbatim quotes from switchers for migration sections and "What customers say" (from market-review-miner `quotes` array)
- Populate the "Why people look for alternatives" opening from market-review-miner pain point themes
- Identify honest competitor strengths to acknowledge (from market-competitor-profiler `assessment.strengths`)

---

## Core Principles

### 1. Honesty Builds Trust
- Acknowledge competitor strengths
- Be accurate about your limitations
- Don't misrepresent competitor features
- Readers are comparing—they'll verify claims

### 2. Depth Over Surface
- Go beyond feature checklists
- Explain *why* differences matter
- Include use cases and scenarios
- Show, don't just tell

### 3. Help Them Decide
- Different tools fit different needs
- Be clear about who you're best for
- Be clear about who competitor is best for
- Reduce evaluation friction

### 4. Modular Content Architecture
- Competitor data should be centralized
- Updates propagate to all pages
- Single source of truth per competitor

---

## Page Formats

### Format 1: [Competitor] Alternative (Singular)

**Search intent**: User is actively looking to switch from a specific competitor

**URL pattern**: `/alternatives/[competitor]` or `/[competitor]-alternative`

**Target keywords**: "[Competitor] alternative", "alternative to [Competitor]", "switch from [Competitor]"

**Page structure**:
1. Why people look for alternatives (validate their pain)
2. Summary: You as the alternative (quick positioning)
3. Detailed comparison (features, service, pricing)
4. Who should switch (and who shouldn't)
5. Migration path
6. Social proof from switchers
7. CTA

---

### Format 2: [Competitor] Alternatives (Plural)

**Search intent**: User is researching options, earlier in journey

**URL pattern**: `/alternatives/[competitor]-alternatives`

**Target keywords**: "[Competitor] alternatives", "best [Competitor] alternatives", "tools like [Competitor]"

**Page structure**:
1. Why people look for alternatives (common pain points)
2. What to look for in an alternative (criteria framework)
3. List of alternatives (you first, but include real options)
4. Comparison table (summary)
5. Detailed breakdown of each alternative
6. Recommendation by use case
7. CTA

**Important**: Include 4-7 real alternatives. Being genuinely helpful builds trust and ranks better.

---

### Format 3: You vs [Competitor]

**Search intent**: User is directly comparing you to a specific competitor

**URL pattern**: `/vs/[competitor]` or `/compare/[you]-vs-[competitor]`

**Target keywords**: "[You] vs [Competitor]", "[Competitor] vs [You]"

**Page structure**:
1. TL;DR summary (key differences in 2-3 sentences)
2. At-a-glance comparison table
3. Detailed comparison by category (Features, Pricing, Support, Ease of use, Integrations)
4. Who [You] is best for
5. Who [Competitor] is best for (be honest)
6. What customers say (testimonials from switchers)
7. Migration support
8. CTA

---

### Format 4: [Competitor A] vs [Competitor B]

**Search intent**: User comparing two competitors (not you directly)

**URL pattern**: `/compare/[competitor-a]-vs-[competitor-b]`

**Page structure**:
1. Overview of both products
2. Comparison by category
3. Who each is best for
4. The third option (introduce yourself)
5. Comparison table (all three)
6. CTA

**Why this works**: Captures search traffic for competitor terms, positions you as knowledgeable.

---

## Essential Sections

### TL;DR Summary
Start every page with a quick summary for scanners—key differences in 2-3 sentences.

### Paragraph Comparisons
Go beyond tables. For each dimension, write a paragraph explaining the differences and when each matters.

### Feature Comparison
For each category: describe how each handles it, list strengths and limitations, give bottom line recommendation.

### Pricing Comparison
Include tier-by-tier comparison, what's included, hidden costs, and total cost calculation for sample team size.

### Who It's For
Be explicit about ideal customer for each option. Honest recommendations build trust.

### Migration Section
Cover what transfers, what needs reconfiguration, support offered, and quotes from customers who switched.

**For detailed templates**: See [templates.md](../../../../references/competitor/templates.md)

---

## Content Architecture

### Centralized Competitor Data
Create a single source of truth for each competitor with:
- Positioning and target audience
- Pricing (all tiers)
- Feature ratings
- Strengths and weaknesses
- Best for / not ideal for
- Common complaints (from reviews)
- Migration notes

**For data structure and examples**: See [content-architecture.md](../../../../references/competitor/content-architecture.md)

---

## Using Agent Output

The `market-competitor-profiler` and `market-review-miner` agents from the Data Collection Phase are your primary research sources. Map their output to page content as follows:

| Page Section | Agent Data Source |
|-------------|-------------------|
| TL;DR summary | `market-competitor-profiler.assessment.strengths` and `weaknesses` |
| Feature comparison | `market-competitor-profiler.content.service_pages`, homepage analysis |
| Pricing comparison | `market-competitor-profiler.homepage.primary_cta`, trust signals |
| Who it's for | `market-competitor-profiler.assessment.differentiators` |
| Social proof (switchers) | `market-review-miner` switching reasons + verbatim quotes |
| Paragraph copy voice | `market-review-miner.language_patterns` — use customer's exact words |
| Competitor strengths | Be honest — use `market-competitor-profiler.assessment.strengths` |

**Ongoing updates:** Agent data reflects a point-in-time snapshot. Re-run `market-competitor-profiler` quarterly or when you know a competitor has changed pricing or major features.

---

## SEO Considerations

### Keyword Targeting

| Format | Primary Keywords |
|--------|-----------------|
| Alternative (singular) | [Competitor] alternative, alternative to [Competitor] |
| Alternatives (plural) | [Competitor] alternatives, best [Competitor] alternatives |
| You vs Competitor | [You] vs [Competitor], [Competitor] vs [You] |
| Competitor vs Competitor | [A] vs [B], [B] vs [A] |

### Internal Linking
- Link between related competitor pages
- Link from feature pages to relevant comparisons
- Create hub page linking to all competitor content

### Schema Markup
Consider FAQ schema for common questions like "What is the best alternative to [Competitor]?"

---

## Output Format

### Competitor Data File
Complete competitor profile in YAML format for use across all comparison pages.

### Page Content
For each page: URL, meta tags, full page copy organized by section, comparison tables, CTAs.

### Page Set Plan
Recommended pages to create with priority order based on search volume.

---

## Task-Specific Questions

1. What are common reasons people switch to you?
2. Do you have customer quotes about switching?
3. What's your pricing vs. competitors?
4. Do you offer migration support?

---

## Related Skills

- **programmatic-seo**: For building competitor pages at scale
- **marketing-copywriting**: For writing compelling comparison copy
- **market-seo-audit**: For optimizing competitor pages
- **market-seo-schema-markup**: For FAQ and comparison schema
- **sales-enablement**: For internal sales collateral, decks, and objection docs

---

## Output Rules

- Never show raw agent JSON to the user — synthesize into the final page content and recommendations.
- Only suggest positioning backed by competitor data — no unsupported claims.
- Ground every recommendation in evidence from agent outputs.
- If data is unavailable, say so explicitly rather than speculating.
