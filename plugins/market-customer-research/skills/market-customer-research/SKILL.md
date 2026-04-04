---
name: market-customer-research
description: >
  When the user wants to conduct, analyze, or synthesize customer research. Use when the user
  mentions "customer research", "ICP research", "analyze transcripts", "customer interviews",
  "survey analysis", "support ticket analysis", "voice of customer", "VOC", "build personas",
  "customer personas", "jobs to be done", "JTBD", "what do customers say", "what are customers
  struggling with", "Reddit mining", "G2 reviews", "review mining", "digital watering holes",
  "community research", "forum research", "competitor reviews", "customer sentiment",
  "find out why customers churn/convert/buy".
  For writing copy informed by research, see marketing-copywriting. For improving pages, see marketing-page-cro.
metadata:
  version: 2.0.0
---

# Customer Research

Two modes: **Mode 1** analyzes existing research assets (transcripts, surveys, tickets). **Mode 2** goes online to gather intel from reviews and communities — delegating the data collection to agents, then synthesizing the findings.

## Before Starting

**Check for `.agents/product-marketing-context.md` first.** If present, skip questions already answered.

Ask only:
1. **Mode**: Do you have research to analyze, or do you need to gather it?
2. **What/who**: Product name and target customer type (B2B SaaS, B2C, local service, etc.)
3. **Goal**: Persona creation, copy insights, churn analysis, positioning?

---

## Mode 1: Analyze Existing Assets

Use when the user provides: transcripts, surveys, support tickets, NPS responses, win/loss notes.

### Extraction Framework

For each asset, extract:

1. **Jobs to Be Done** — what outcome is the customer trying to achieve?
   - Functional job: the task itself
   - Emotional job: how they want to feel
   - Social job: how they want to be perceived

2. **Pain Points** — what's frustrating or inadequate in their current situation?
   - Prioritize pains mentioned unprompted and with emotional language

3. **Trigger Events** — what changed that made them seek a solution?
   - Common: team growth, new hire, missed target, embarrassing incident

4. **Desired Outcomes** — success in their exact words (capture verbatim, not paraphrase)

5. **Language and Vocabulary** — the exact words customers use to describe the problem
   - "We were drowning in spreadsheets" > "manual process inefficiency"

6. **Alternatives Considered** — what did they try before? (includes doing nothing, hiring, building)

### Synthesis Steps

Invoke the `market-research-synthesizer` agent with:
- `data_points`: array of all extracted text excerpts — each with `text` (the verbatim quote or observation), `source` (asset identifier), `source_type` (interview/survey/support_ticket/nps/review), and `date` and `segment` if known
- `synthesis_goal`: "all"
- `min_theme_frequency`: 2

Run as a background agent. Wait for completion, then use its output as the basis for the synthesis report below.

From the `market-research-synthesizer` output:

### Confidence Labels

Label every insight before presenting:

| Confidence | Criteria |
|------------|----------|
| **High** | Theme in 3+ independent sources; unprompted; consistent across segments |
| **Medium** | Theme in 2 sources, or only prompted, or limited to one segment |
| **Low** | Single source; could be outlier; needs validation |

### Sample Bias Reminders

- Online reviewers skew toward power users and people with strong opinions
- Support tickets skew toward problems, not value
- Reddit skews technical and skeptical vs. mainstream buyers

---

## Mode 2: Digital Watering Hole Research

Use when the user needs to gather fresh intel from online sources.

### Phase 1 — Data Collection (parallel)

Invoke both agents in parallel:

**Agent 1: market-review-miner**
- `target`: the user's product/business
- `platforms`: based on ICP type:
  - B2B SaaS → `["g2", "capterra", "trustradius", "reddit"]`
  - SMB / local service → `["google", "yelp", "facebook"]`
  - B2C consumer → `["app_store", "play_store", "reddit", "trustpilot"]`
  - Enterprise → `["g2", "trustradius"]` (enterprise filter)
- `focus_themes`: `["pain_points", "switching_reasons", "language_patterns"]`
- `competitor` (optional): a main competitor to mine in parallel for comparison

**Agent 2: market-serp-researcher** (for community/forum discovery)
- `queries`: generate queries to find discussion threads:
  - `"[product category]" site:reddit.com`
  - `"[product category] alternatives" site:reddit.com`
  - `"[problem the product solves]" forum`
  - `"[product name] review"`
- `target_domain`: user's domain (to check if they appear in discussions)

Wait for both to complete before synthesis.

### Phase 2 — Synthesize

From agent outputs, produce structured research findings:

#### Voice of Customer Summary

```
## Research Synthesis: [Product / Business Name]
**Sources mined**: [list platforms + post count from market-review-miner]
**Total data points**: [review count]

---

## Top Themes (ranked by frequency × intensity)

### Theme 1: [Name]
**Summary**: [1-2 sentences]
**Frequency**: Appeared in [N] reviews / [N]% of sources
**Intensity**: High / Medium / Low
**Confidence**: High / Medium / Low
**Money quotes**:
> "[Exact verbatim quote]" — [Platform], [approx date]
> "[Exact verbatim quote]" — [Platform], [approx date]
```

#### Competitor Comparison (if competitor mined)

```
## Customer Sentiment Comparison

| Dimension | [Your Product] | [Competitor] |
|-----------|---------------|-------------|
| Avg rating | [X] | [X] |
| Top praise | [pattern] | [pattern] |
| Top complaint | [pattern] | [pattern] |
| Switching TO you because | [reason] | — |
| Switching AWAY to competitor because | — | [reason] |
```

#### Customer Language Extraction

```
## Language Patterns (use in copy)

**How customers describe the problem:**
- "[exact phrase]"
- "[exact phrase]"

**How customers describe success:**
- "[exact phrase]"
- "[exact phrase]"

**Trigger language (what pushed them to act):**
- "[exact phrase]"
```

#### Persona Sketch (if requested)

Based on themes and language patterns, sketch 1-3 personas:

```
### Persona: [Name] — [Role / Type]
- **Profile**: [1-2 sentences on who this person is]
- **Primary job to be done**: [the outcome they're hiring the product for]
- **Core pain**: [specific pain in their language]
- **Trigger**: [what makes them search for a solution]
- **What success looks like**: [in their words]
- **Objections to address**: [from reviews and discussions]
```

---

## References

- [Source Guides](../../../../references/content/source-guides.md) — platform-specific research guides for G2, Capterra, Reddit, App Store, and community forums

---

## Output Rules

- Do not show agent JSON to the user — only the synthesized research
- All quotes must be verbatim — do not paraphrase customer language
- Confidence labels required on every theme
- If market-review-miner finds < 10 reviews total, note the limitation and recommend additional primary research (interviews, surveys)
- Mode 1 and Mode 2 can be combined: use Mode 1 findings to validate Mode 2 findings and vice versa
