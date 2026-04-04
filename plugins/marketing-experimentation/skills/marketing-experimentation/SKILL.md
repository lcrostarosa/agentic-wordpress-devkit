---
name: marketing-experimentation
description: >
  Full A/B testing and experimentation lifecycle — from hypothesis design through
  technical implementation, QA validation, program management, and result analysis.
  Use when user says "a/b test", "ab test", "split test", "experiment", "set up PostHog experiment",
  "implement split test", "A/B test code", "testing tool", "Optimizely setup", "VWO", "Nelio",
  "client-side test", "server-side test", "test is flickering", "caching breaking my test",
  "test variant not showing", "QA my A/B test", "validate experiment", "test prioritization",
  "ICE score", "PIE score", "ship or kill", "experiment program", "testing velocity",
  "what should I test next", "did my test win", "analyze test results".
metadata:
  version: 1.0.0
---

# Experimentation

Covers the full A/B testing lifecycle. Routes to the right phase based on where the user is.

## Context Gathering

**Check for product marketing context first:**
If `.agents/product-marketing-context.md` exists, read it before asking questions.

Ask only what isn't obvious:
1. **Where are you?** (designing a test, implementing a test, validating a live test, analyzing results, building a testing program)
2. **Tech stack** (if implementation): Frontend framework, CMS, caching layer, WordPress theme type
3. **Traffic volume** (if implementation): Monthly visitors to the page being tested

Based on the answer, proceed to the relevant phase below.

---

## Phase: Hypothesis Design

When the user wants to decide what to test.

### Hypothesis Framework

A well-formed hypothesis follows this structure:

> **If** we [change X] **for** [audience segment] **then** [metric Y] will [increase/decrease] **because** [reason Z].

Bad: "Test the button color."
Good: "If we change the CTA from 'Get Started' to 'Start Free Trial' for first-time visitors, then sign-up rate will increase because it sets clearer expectations about what happens next."

### ICE Prioritization

Score each hypothesis on three dimensions (1-10 each):
- **Impact**: How much could this move the needle if it wins?
- **Confidence**: How confident are you it will win (based on data, research, best practices)?
- **Ease**: How easy is it to implement and run?

ICE Score = (Impact × Confidence × Ease) / 3

Present a prioritized test queue. The highest ICE score goes first.

### Test Design Checklist

For each test:
- [ ] Single variable isolated (don't change 3 things at once)
- [ ] Clear primary metric (not 5 metrics)
- [ ] Sample size calculated (see below)
- [ ] Minimum detectable effect defined (e.g., "5% lift in conversions")
- [ ] Test duration estimated (run for at least 2 full business weeks)

**Sample size formula (rough):**
For a 5% baseline conversion rate, 10% MDE, 80% power:
~3,500 visitors per variant. For 2 variants: ~7,000 total visitors.

Use an online calculator (like Evan Miller's) for exact numbers. Don't end tests early based on early results.

---

## Phase: Technical Implementation

When the user has a hypothesis and needs to build the test.

### Tool Selection

| Factor | PostHog | Optimizely | VWO | Nelio (WP) | LaunchDarkly | Custom |
|--------|---------|------------|-----|------------|--------------|--------|
| Free tier | Yes (1M events) | No | No | Limited | No | N/A |
| Visual editor | No | Yes | Yes | Yes | No | No |
| Server-side | Yes | Yes | Yes | No | Yes | Yes |
| WordPress plugin | No | No | No | Yes | No | N/A |
| Best for | Dev teams | Enterprise | Mid-market | WP non-dev | Feature flags | Full control |

**Decision shortcuts:**
- WordPress + no developer → **Nelio A/B Testing**
- WordPress + developer → **PostHog** (feature flags) or **custom PHP**
- React/Next.js → **PostHog** or **LaunchDarkly**
- Enterprise → **Optimizely**
- Privacy/GDPR strict → **Convert.com** or server-side custom

### Implementation Patterns

**Client-side (JavaScript):**
```javascript
// Variant assignment with cookie persistence
function getVariant() {
  const existing = document.cookie.match(/ab_variant=([^;]+)/);
  if (existing) return existing[1];
  const variant = Math.random() < 0.5 ? 'control' : 'variant';
  document.cookie = `ab_variant=${variant}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax; Secure`;
  return variant;
}

// Apply variant before paint (in <head> to prevent flicker)
const variant = getVariant();
if (variant === 'variant') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('h1').textContent = 'New Headline';
  });
}
```

**Anti-flicker snippet (required for client-side tests):**
```javascript
// Place in <head> BEFORE the test script
<script>
(function() {
  var style = document.createElement('style');
  style.innerHTML = 'body { opacity: 0 !important; }';
  document.head.appendChild(style);
  setTimeout(function() { style.remove(); }, 3000); // Safety timeout
})();
</script>
```

**WordPress / Caching issues:**
- Add the variant cookie to your cache plugin's exclusion list
- In WP Rocket: Settings → Cache → Never Cache Cookies → add your cookie name
- In LiteSpeed Cache: Cache → Excludes → Do Not Cache Cookies → add cookie name
- Set `Vary: Cookie` header or disable caching for pages under test
- For Nelio: it handles caching automatically for most WP setups

**PostHog feature flag pattern:**
```javascript
posthog.onFeatureFlags(function() {
  if (posthog.getFeatureFlag('my-experiment') === 'variant') {
    // Apply variant changes
  }
});
```

**Tracking conversions:**
```javascript
// Generic event tracking pattern
function trackConversion(event_name, properties) {
  // PostHog
  posthog.capture(event_name, properties);
  // Or push to data layer for GTM
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: event_name, ...properties });
}

// Call on conversion
document.querySelector('.cta-button').addEventListener('click', () => {
  trackConversion('cta_clicked', { variant: getVariant(), page: window.location.pathname });
});
```

---

## Phase: QA Validation

When the user has implemented a test and wants to verify it's running correctly.

Invoke the `ab-test-validator` agent with:
- `url`: the page where the test is running
- `tool`: the testing tool in use
- `variant_identifiers`: cookie name, feature flag key, or URL parameter
- `expected_changes`: what the variant changes
- `conversion_event`: the event being tracked

Present the validator's findings as a structured report:

```
## A/B Test Validation: [Page URL]
**Tool**: [tool name]
**Overall Status**: PASS / WARN / FAIL

| Check | Status | Issue |
|-------|--------|-------|
| Test script present | PASS/FAIL | |
| Anti-flicker snippet | PASS/WARN | |
| Caching configured | PASS/FAIL | |
| Variant assignment | PASS/FAIL | |
| Mobile viewport | PASS | |
| Performance impact | INFO | Score: [X], CLS: [X] |

### Issues to Fix
[List any fails/warns with specific remediation steps]
```

---

## Phase: Result Analysis

When the user has test data and wants to know if it won.

### Statistical Significance

Don't declare a winner until:
- [ ] Test has run for at least 2 full weeks (captures weekly patterns)
- [ ] Sample size target has been reached
- [ ] p-value ≤ 0.05 (95% confidence) OR Bayesian probability to beat baseline ≥ 95%

**Common mistakes:**
- Stopping when you see significance (peeking problem — inflates false positives)
- Ignoring segment differences (a "loser" overall might win for mobile users)
- Confusing correlation with causation in results

### Ship / Iterate / Kill Decision

**Ship** if:
- Statistical significance reached ✓
- Primary metric improved ✓
- No negative impact on secondary metrics ✓
- Sample size target met ✓

**Iterate** if:
- Directionally positive but not significant yet → extend the test
- Significant but secondary metrics hurt → redesign the variant
- Mixed results across segments → run a targeted follow-up

**Kill** if:
- No movement after reaching sample size → the hypothesis was wrong
- Significant negative impact → revert and learn from why
- External event contaminated the test (product launch, traffic spike, etc.)

### Document the Learning

Whether the test wins or loses, record:
1. Hypothesis tested
2. Result (lift %, statistical confidence)
3. Why we think it worked/didn't
4. Follow-up hypothesis generated

This is the most valuable output of a testing program.

---

## Phase: Program Management

When the user wants to build a systematic experimentation culture.

### Test Pipeline Structure

Maintain three buckets:
- **Backlog**: All hypotheses, ICE-scored and ranked
- **In progress**: Currently running (limit: 1-3 active tests at a time)
- **Archive**: Completed tests with results and learnings

**Cadence:**
- Weekly: Review active tests, prune backlog
- Monthly: Retrospective on results, update ICE scores based on new data
- Quarterly: Audit testing velocity, identify bottlenecks

### Velocity Benchmarks

- Small teams (1-3 CRO): 2-4 tests/month
- Mid-size teams: 5-10 tests/month
- Enterprise CRO teams: 20+ tests/month

If running fewer than 2 tests/month: focus on reducing implementation complexity (simpler tests, better tooling).

### Avoiding Common Program Failures

- **HiPPO problem**: Tests killed by executives before they finish — establish a "no stopping tests early" rule at the team level
- **False discovery rate**: Running 20 tests, 1 wins at 95% CI — that's likely a false positive. Require 97.5% CI for high-stakes decisions.
- **Novelty effect**: Users change behavior temporarily when they see something new. Run tests for at least 2 weeks to let novelty fade.
- **Interaction effects**: Two simultaneous tests on the same page can contaminate results — segment users so they only see one test at a time.
