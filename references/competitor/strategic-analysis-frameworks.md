# Strategic Analysis Frameworks

Reference material for the strategic synthesis agent. These frameworks guide how raw competitive data is transformed into actionable recommendations.

---

## 1. Competitive Positioning Map

A 2x2 matrix that visualizes where each player sits in the market.

### Axis Selection

Choose the two most differentiating dimensions from the data. Common axis pairs:

| Context | X-Axis | Y-Axis |
|---------|--------|--------|
| SaaS / Software | Simplicity <-> Feature depth | SMB focus <-> Enterprise focus |
| Local services | Online presence strength | Review volume / reputation |
| E-commerce | Price point | Product breadth |
| Agency / Services | Specialization <-> Full-service | Self-serve <-> High-touch |
| Content / Media | Content volume | Content depth / quality |

**Selection rules:**
- Pick axes where competitors actually spread out (if everyone clusters, the axis is not differentiating)
- At least one axis should reveal white space (an underserved quadrant)
- Label quadrants with descriptive names, not just axis endpoints

### Plotting

Score each entity 1-5 on each axis based on evidence from the agents. Place on the map. Identify:
- **Crowded quadrants** — high competition, harder to differentiate
- **Empty quadrants** — potential opportunity (or a space the market has rejected)
- **Your current position** vs. where you could move

---

## 2. Threat Assessment

Rank each competitor by threat level: **High / Medium / Low**.

### Scoring Criteria

| Factor | Weight | How to Assess |
|--------|--------|---------------|
| Market overlap | 30% | From classifier: same industry vertical + business model + target segment = high overlap |
| SEO overlap | 25% | From SEO comparison: competing for same keywords, similar content footprint |
| Momentum | 20% | Content freshness, review velocity (recent vs. old), social activity trend |
| Capability gap | 15% | Features/services they have that you do not (from profiler data) |
| Size / resources | 10% | Inferred from team size, content volume, pricing tier breadth |

### Threat Level Thresholds

- **High threat** (score > 70): Direct competitor with strong overlap and momentum. Must actively compete against.
- **Medium threat** (40-70): Partial overlap or strong in different dimensions. Monitor and selectively compete.
- **Low threat** (< 40): Minimal overlap, different segment, or declining presence. Acknowledge but do not prioritize.

For each competitor, state:
1. **Why they are dangerous** — specific evidence (e.g., "ranks #1 for 3 of our 5 target keywords and has 4x our review count")
2. **Where they are vulnerable** — specific weaknesses (e.g., "blog hasn't been updated in 8 months, no schema markup, PageSpeed score of 42")

---

## 3. Gap Analysis Classification

Organize gaps into three categories based on competitive urgency.

### Table Stakes (Must-Fix)

Gaps where **2+ competitors** already have something the user lacks, and it is a baseline expectation in the market.

**Criteria:**
- At least 2 out of 3+ competitors have this
- It directly affects the ability to compete (ranking, conversion, trust)
- Not having it puts you at a clear disadvantage

**Examples:** HTTPS, mobile-responsive site, Google Business Profile, basic schema markup, contact information above the fold.

### Differentiation Opportunities

Gaps where **most competitors are also weak**, creating an opportunity to stand out by being first or best.

**Criteria:**
- Fewer than half of competitors do this well
- Would create a noticeable advantage if implemented
- Aligns with the user's strengths or strategy

**Examples:** Rich blog content in an industry where no competitor blogs regularly, video content, interactive tools, AI citation optimization, comprehensive FAQ schema.

### Emerging Trends

Things **only 1-2 competitors** are doing that signal where the market is heading.

**Criteria:**
- Adopted by 1-2 competitors only
- Represents a new capability, channel, or format
- Early adoption could create a lasting advantage

**Examples:** AI-generated content optimization, podcast presence, TikTok/Reels strategy, ChatGPT plugin, structured data for AI Overviews.

---

## 4. Recommendation Prioritization

Score each recommendation on two axes, then sequence accordingly.

### Impact Assessment

| Level | Criteria |
|-------|----------|
| **High** | Directly affects search visibility, conversion rate, or competitive positioning. Supported by evidence from multiple agents. |
| **Medium** | Improves one area (SEO, content, or trust) but not a critical gap. Incremental improvement. |
| **Low** | Nice to have. Marginal improvement. Not currently holding the business back. |

### Effort Assessment

| Level | Criteria |
|-------|----------|
| **Low** | Can be done in 1-2 hours, no external dependencies, no specialized skills needed |
| **Medium** | Requires 1-5 days of work, may need a developer or designer, some coordination |
| **High** | Multi-week project, requires significant resources, external tools, or strategic change |

### Sequencing Rules

1. **Quick Wins first** (high impact + low effort) — build momentum and demonstrate value
2. **Strategic Investments next** (high impact + high effort) — plan and schedule these
3. **Easy Improvements** (low impact + low effort) — batch and do during downtime
4. **Deprioritize** (low impact + high effort) — defer unless circumstances change

---

## 5. 90-Day Action Plan Heuristics

### Month 1: Foundation

Focus on quick wins and table-stakes gaps:
- Fix critical technical issues (HTTPS, mobile, speed)
- Claim/optimize business listings and profiles
- Implement basic schema markup
- Address conversion blockers (CTA placement, contact info)
- Start review solicitation process

### Month 2: Content & SEO

Focus on content gaps and keyword opportunities:
- Create/optimize high-priority service/product pages
- Target "uncontested" keywords identified in the SEO battle plan
- Publish initial blog content targeting comparison/evaluation queries
- Implement on-page SEO improvements across key pages

### Month 3: Differentiation & Authority

Focus on differentiation opportunities and authority building:
- Launch content series targeting differentiation opportunities
- Build out case studies, testimonials, or portfolio
- Establish social/community presence where competitors are weak
- Monitor keyword rankings and adjust strategy based on early results

### Adjustment Rules

- If the user is a local business, front-load Google Business Profile and reviews
- If the user is SaaS, front-load content marketing and comparison pages
- If the user has zero online presence, Month 1 is entirely about establishing basics
- Scale the plan to the user's actual resources (don't plan enterprise actions for a solo founder)

---

## 6. Common Competitive Strategy Patterns

Reference these when framing recommendations. Name the strategy so the user understands the broader approach.

| Strategy | When to Recommend | Description |
|----------|-------------------|-------------|
| **Flanking** | Competitors dominate the obvious keywords/positioning | Compete on a dimension they ignore (niche, geography, underserved segment) |
| **Head-on** | User has equal or greater resources and a clear advantage | Compete directly on the same dimensions, outperform on quality and speed |
| **Niche-down** | Market is crowded, user is smaller | Specialize more narrowly, own a specific segment completely |
| **Content moat** | Competitors have weak or no content strategy | Invest heavily in content to build organic visibility that compounds over time |
| **Platform play** | User has a product that could become a platform | Build integrations, API, ecosystem that creates switching costs |
| **Community-first** | No competitor has an active community | Build a community (forum, Slack, events) that becomes a moat |
| **Speed advantage** | Competitors are slow-moving (stale content, old design) | Move fast, ship frequently, iterate publicly to capture the "modern" positioning |
