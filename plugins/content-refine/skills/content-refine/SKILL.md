---
name: content-refine
description: >
  All-in-one content editing — detects and removes AI writing patterns, tightens prose,
  fixes passive voice, cuts filler words, and improves tone. Scores content before and
  after editing. Use when user says "edit this", "improve this copy", "tighten this",
  "humanize this", "de-slop this", "this sounds like AI", "sounds robotic", "too ChatGPT",
  "AI slop", "make this sound human", "ai detection", "fix the AI voice", "sounds generated",
  "copy editing", "line edit", "proofread", "fix the tone", "too formal", "too casual",
  "cut the fluff", "remove passive voice", "sounds weak", "bland copy".
metadata:
  version: 1.0.0
---

# Content Refine

Edits content to remove AI writing patterns, tighten prose, fix tone, and strengthen weak language. Uses detection agents to score before and after — so you can see the improvement objectively.

## Context Gathering

Ask only what isn't obvious from context:
1. **Content**: Paste the text, or provide a file path
2. **Target voice**: Casual blog, professional B2B, conversational, technical? (default: match the apparent intent of the content)
3. **Focus**: AI pattern removal only, general editing only, or both? (default: both)

If the user just says "edit this" or pastes content — start. Don't over-ask.

## Phase 1 — Assess

Invoke both detection agents in parallel:

**Agent 1:** `ai-writing-detector`
- `text`: the content to analyze
- `context`: the detected content type

**Agent 2:** `copy-quality-scorer`
- `copy`: the content
- `copy_type`: detect from content (blog_intro, landing_page, email, generic)

Run both as background agents. Wait for both to complete before proceeding.

## Phase 2 — Edit

Apply edits based on the combined agent findings. Work through in this order:

### Pass 1: AI Pattern Removal (from ai-writing-detector output)

Address these categories in priority order:

**Em dashes (highest signal):**
Replace each — with appropriate punctuation:
| Pattern | Fix |
|---------|-----|
| X — which was Y — did Z | X, which was Y, did Z |
| X — unlike Y — allows Z | X, unlike Y, allows Z |
| The point — that X — means Y | The point: X. That means Y. |
| Introduces a list — item, item, item | Introduces a list: item, item, item |

**AI-tell phrases** (flagged by detector):
- Cut discourse markers: "it's worth noting that" → (just say it), "needless to say" → delete
- Cut hollow intensifiers: "incredibly powerful" → "powerful", "truly transformative" → be specific
- Replace AI verbs: delve → explore, leverage → use, facilitate → help, utilize → use, streamline → simplify, foster → build, underscore → show

**Filler intensifiers** (flagged by detector):
Cut or replace: "very important" → "important", "really helpful" → "helpful", "extremely easy" → "easy"

### Pass 2: Prose Tightening (from copy-quality-scorer output)

**Passive voice sentences** (listed in agent output):
Rewrite each passive sentence as active:
- "The report was written by the team" → "The team wrote the report"
- "Mistakes are often made when..." → "Teams often make mistakes when..."

**Long sentences** (> 35 words):
Break into two sentences. Look for: "and", "but", "because", "which", "that" — any can become a sentence break.

**Filler openings:**
Cut or rewrite sentences starting with: "There is/are", "It is/was", "This is a guide to"
- "There are three reasons to..." → "Three reasons to..."
- "It is important to understand that..." → "Understanding [X] matters because..."

### Pass 3: Benefit-to-Feature Conversion (from copy-quality-scorer output)

For each statement flagged as feature-only (from `feature_statements_to_convert`), rewrite as benefit:
- Feature: "Built with 256-bit encryption" → Benefit: "Your data is protected — even from us"
- Feature: "Real-time dashboard" → Benefit: "See your numbers the moment they change"

Skip this pass if the content is not marketing copy (blog posts don't need benefit reframing).

### Pass 4: Structural Fixes

If structural uniformity was flagged by the detector:
- **List overuse**: Convert at least one bulleted list to prose if the items flow naturally
- **Uniform sentence length**: Add variation — break a long sentence, combine two short ones
- **Formulaic transitions**: Replace at least 2 paragraph openers that start the same way

## Phase 3 — Deliver

Present the edited content, then a before/after comparison:

```
## Edited Content

[The fully edited text]

---

## Before / After

**AI Writing Score**: [before] → [after] /100 (from ai-writing-detector)
**Copy Quality Score**: [before] → [after] /100 (from copy-quality-scorer)

### Changes Made

**AI patterns removed:**
- [N] em dashes replaced
- [N] AI-tell phrases removed or rewritten
- [N] filler intensifiers cut

**Prose improvements:**
- [N] passive voice sentences converted to active
- [N] long sentences broken up
- [N] filler sentence openers cut

**Structural changes:**
- [Any structural changes made]

### Remaining Issues (if any)
[Note any issues that weren't addressable without more context, e.g., "3 benefit-to-feature conversions skipped — needs product knowledge to rewrite correctly"]
```

## Output Rules

- Do not show agent JSON to the user — only the edited content and summary
- Preserve the author's voice — the goal is to fix patterns, not rewrite the substance
- Don't add words; tighten
- Don't introduce new ideas, claims, or structure beyond what's already there
- If content is already clean (ai score > 80 AND copy score > 75), say so and make only minor tweaks
