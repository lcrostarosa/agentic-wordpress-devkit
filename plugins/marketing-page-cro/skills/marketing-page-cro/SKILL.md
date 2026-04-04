---
name: marketing-page-cro
description: >
  When the user wants to optimize, improve, or increase conversions on any marketing page —
  including homepage, landing pages, pricing pages, feature pages, or blog posts.
  Also use when the user says "CRO", "conversion rate optimization", "this page isn't converting",
  "improve conversions", "why isn't this page working", "my landing page sucks", "nobody's converting",
  "low conversion rate", "bounce rate is too high", "people leave without signing up", or
  "this page needs work". Use this even if the user just shares a URL and asks for feedback.
metadata:
  version: 2.0.0
---

# Page CRO

Runs technical site analysis and copy quality scoring in parallel, then applies CRO judgment to identify the highest-impact conversion improvements. Data-driven where possible, expert judgment where data can't reach.

## Context Gathering

**Check for `.agents/product-marketing-context.md` first.** If present, use it.

Ask only what isn't obvious:
1. **URL or content**: Page URL, or paste the content directly
2. **Conversion goal**: Sign up, request demo, purchase, subscribe, contact sales?
3. **Traffic source**: Organic, paid, email, social? (affects what "friction" means)

If the user shares a URL and says "help with this page" — start analyzing. Don't over-ask.

---

## Phase 1 — Data Collection (parallel)

Invoke both agents in parallel:

**Agent 1: market-site-analyzer**
- `url`: the provided URL
- `scope`: `page`

**Agent 2: copy-quality-scorer**
- `copy`: fetch the page content and pass it (or use the raw content if provided)
- `copy_type`: infer from context (landing_page, homepage, pricing_page, etc.)
- `product_description`: from context file or user input

Wait for both to complete.

---

## Phase 2 — CRO Analysis

With agent data in hand, analyze the page across these dimensions in order of impact:

### 1. Value Proposition Clarity (use copy-quality-scorer value_proposition dimension)

From the scorer's `value_proposition` output:
- What score did it receive? What's unclear?
- Apply the 5-second test: would a new visitor understand what this is, who it's for, and why it matters?

Common issues to check beyond the scorer:
- Feature-focused instead of benefit-focused
- Jargon that makes sense internally but not to customers
- Trying to communicate too many things at once

### 2. Headline Effectiveness (from copy-quality-scorer headline dimension)

Use the scorer's headline data. Also check:
- Does the headline match the traffic source's messaging? (A paid ad that says "AI scheduling" should land on a page that also leads with "AI scheduling")
- Message match between source and page is a major conversion lever not captured by the scorer

### 3. CTA Placement, Copy, and Hierarchy

From market-site-analyzer (headings, links) and copy-quality-scorer (cta dimension):
- Is there one clear primary CTA? Or are there 4 competing actions?
- Is it visible above the fold?
- Weak CTA copy: "Submit", "Sign Up", "Learn More"
- Strong CTA copy: "Start Free Trial", "Get My Report", "See Pricing"

### 4. Trust Signals

From market-site-analyzer (schema types, images) and copy-quality-scorer (benefit_ratio):
- Social proof: testimonials, review counts, customer logos
- Credibility signals: security badges, certifications, guarantees
- Risk reducers: money-back guarantee, free trial, "no credit card required"

### 5. Friction Audit

From market-site-analyzer (performance, broken links) and copy-quality-scorer (readability):
- Technical friction: slow load time (LCP), form errors, broken elements
- Cognitive friction: too many steps, confusing copy, unclear next step
- Anxiety triggers: price shock, unexpected commitment, privacy concerns

### 6. Page Speed / Technical Impact

From market-site-analyzer performance data:
- PageSpeed < 60: Flag as conversion-killing — quantify estimated impact
- CLS > 0.1: Layout shifts damage trust
- LCP > 3s: Users leave before seeing the value proposition

---

## Phase 3 — Recommendations

Structure output as a prioritized list. Lead with the highest-impact changes.

```
## CRO Analysis: [Page Name]
**URL**: [url]
**Goal**: [conversion goal]

### Copy Quality Score: [X]/100
**Value Proposition**: [pass/fail + specific issue]
**Headline**: [pass/fail + specific issue]
**CTA**: [pass/fail + specific issue]

### Technical Health
**PageSpeed (mobile)**: [score] — [LCP, CLS]
**Schema**: [types found — note JS-injection limitation]

---

### Priority Recommendations

**1. [Highest Impact Fix]**
- Issue: [specific problem with evidence]
- Fix: [specific change to make]
- Why: [reason this matters for conversions]
- Impact: High / Medium / Low

**2. [Second Highest Impact Fix]**
[same format]

**3. [Third]**
[same format]

---

### Quick Wins (implement today)
- [Small change that requires no design work]
- [Copy edit that can be done immediately]

### Bigger Bets (require design/dev)
- [Structural change with high potential]
```

---

## CRO Judgment Layer

The agents handle scoring — these are the qualitative assessments the agents can't make:

**Message match**: Does the page match what the user clicked to get here? (requires knowing the traffic source)

**Competitive context**: Is the value proposition differentiated from alternatives, or generic? (use competitor knowledge from context file if available)

**Customer language**: Is the copy written in words customers use, or words the company uses? (check market-review-miner output from market-customer-research if available)

**Conversion intent staging**: Is this page trying to convert cold traffic or warm traffic? Cold traffic needs more education; warm traffic needs to remove friction. Match the page's approach to the traffic.

---

## References

- [Page Experiments](../../../../references/content/page-experiments.md) — A/B test ideas and experiment catalog by page element

---

## Output Rules

- Do not show agent JSON to the user
- Every recommendation must cite specific evidence (scores, specific copy quotes, page data)
- Prioritize by impact — don't list 15 things at equal weight
- Quick wins section: changes that can be made in under an hour
- Don't recommend things the page already does well
