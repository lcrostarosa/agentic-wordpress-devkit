# SEO Comparison Framework

A structured framework for comparing SEO posture across competitors. The SEO comparison agent evaluates five dimensions and produces a normalized comparison.

---

## Five Comparison Dimensions

### 1. Technical Health

Compare using site-analyzer output. Key metrics:

| Metric | Source | How to Compare |
|--------|--------|----------------|
| PageSpeed score (mobile) | site-analyzer `performance.score` | Direct number comparison. >90 = good, 70-89 = fair, <70 = poor |
| LCP (seconds) | site-analyzer `performance.lcp_seconds` | <2.5s good, 2.5-4s needs improvement, >4s poor |
| CLS | site-analyzer `performance.cls` | <0.1 good, 0.1-0.25 needs improvement, >0.25 poor |
| HTTPS | site-analyzer `security.https` | Boolean pass/fail |
| Mobile viewport | site-analyzer `meta.viewport.present` | Boolean pass/fail |
| Schema types | site-analyzer `schema.types_found` | Count and compare types detected (note WebFetch limitation) |
| Title tag quality | site-analyzer `meta.title` | Present, correct length (50-60 chars), includes primary keyword |
| Meta description | site-analyzer `meta.description` | Present, correct length (150-160 chars), compelling |
| Heading structure | site-analyzer `headings` | Single H1, logical hierarchy, keyword usage |

**Scoring:** Assign each site a 0-10 score per metric, then average for the dimension.

### 2. Content Depth & Velocity

Combine site-analyzer and competitor-profiler data, supplemented by targeted queries.

| Metric | How to Measure |
|--------|----------------|
| Estimated indexed pages | WebSearch: `site:domain.com` — note the result count (approximate) |
| Blog presence | competitor-profiler `content.blog.exists` |
| Blog post count | competitor-profiler `content.blog.post_count` |
| Most recent post | competitor-profiler `content.blog.latest_post` — how fresh? |
| Service/product page count | competitor-profiler `content.service_pages.count` |
| Content detail level | competitor-profiler `content.service_pages.detail_level` |
| Portfolio/case studies | competitor-profiler `content.portfolio.exists` + count |
| Content types detected | Blog, video, podcast, infographic, tool/calculator, documentation |

**Freshness scoring:** Updated this month = active; 1-3 months = semi-active; 3-12 months = slowing; >12 months = stale.

### 3. Keyword Visibility

Requires active WebSearch testing. The agent must select 5-8 queries relevant to the user's industry.

**Query selection methodology:**

1. **Core service/product query** (1-2): `[primary service] [modifier]` — e.g., "project management software"
2. **Location-qualified** (1-2 if local): `[service] [city]` — e.g., "smart home installer Denver"
3. **Comparison/evaluation** (1-2): `best [service]`, `[service] reviews`, `[service] comparison`
4. **Problem-aware** (1): `how to [solve problem the product addresses]`
5. **Brand + category** (1): `[competitor name] alternative` or `[competitor name] vs`

For each query, record:
- Position of each competitor (null if not found in top 20)
- Whether a local pack is present and who appears
- Whether a featured snippet exists and who holds it
- Whether AI Overview / People Also Ask appears

**Visibility score per competitor:** `(queries_found_in / queries_tested) * 100`, weighted by position (top 3 = full weight, 4-10 = 0.5 weight, 11-20 = 0.25 weight).

### 4. Authority Signals

Combine data from competitor-profiler with WebSearch queries.

| Signal | Source | Weight |
|--------|--------|--------|
| Google review count | competitor-profiler `reviews.google.count` | High |
| Google rating | competitor-profiler `reviews.google.rating` | Medium |
| Total reviews across platforms | competitor-profiler `reviews.total_reviews` | High |
| Social media activity | competitor-profiler `social.*.activity` | Low |
| Social following (if available) | competitor-profiler `social.*.followers` | Low |
| Directory presence | Count of platforms where the business is listed | Medium |
| Team/about page depth | competitor-profiler `content.about_team` | Medium (E-E-A-T signal) |
| Credentials/certifications | competitor-profiler `content.about_team.credentials` | Medium |

### 5. AI Citation Readiness

Test whether competitors appear in AI-powered search contexts.

**Method:** Run 2-3 representative queries and check for brand mentions in:
- Google AI Overviews (note if any competitor is cited)
- WebSearch results that reference AI assistants citing the competitor
- Structured data that makes content extractable (FAQ schema, HowTo schema)

**Scoring:** High / Medium / Low / None per competitor.

---

## Interpreting Comparisons

When presenting the SEO comparison, avoid declaring a single "winner." Instead:

- Identify which competitor leads in each dimension
- Note where the user's site is strongest and weakest relative to the field
- Highlight the largest gaps (where the user trails by the most)
- Identify dimensions where no competitor excels (opportunity for all)

The SEO comparison feeds directly into the strategic synthesis agent's "SEO Battle Plan" section.
