# Agent Authoring Guide

How to create a new shared agent from scratch.

## 1. Decide the tier first

Ask: what does this agent *do*?

| It fetches, counts, extracts, or checks observable data | Tier 1 — `model: haiku` |
|---------------------------------------------------------|------------------------|
| It scores, compares, classifies, or interprets findings | Tier 2 — `model: sonnet` |
| It reasons about strategy, positioning, or action plans | Tier 3 — `model: opus` |

If you're unsure, ask: does it need judgment, or does it just follow rules? Rule-following = Tier 1. Judgment = Tier 2/3.

## 2. File location and registration

Create the file at `agents/{agent-name}.md`. Then register it in `agents/.claude-plugin/plugin.json` by adding `"./agents/{agent-name}.md"` to the `"agents"` array.

## 3. Required frontmatter

Every agent file must open with this YAML block:

```yaml
---
name: agent-name
description: One sentence — what data/output it produces, what it accepts as input, and its tier. This is what skills read to decide which agent to call.
model: haiku | sonnet | opus
---
```

The `description` field is critical — it must be specific enough for a skill author to know at a glance whether this is the right agent to invoke and what to pass it.

## 4. Required file sections (in order)

### Title and identity paragraph

```markdown
# Agent Name Agent

You are an autonomous [role]. You receive [inputs] and return [output type]. You do NOT interact with the user — you run silently and return JSON.
```

The identity paragraph is the agent's constitution. It must contain the three invariants:
- "autonomous" — runs without human involvement
- what it receives
- "return JSON" and "do NOT interact with the user"

### Input section

List every field the agent accepts — required fields first, optional fields labeled. Include the field name, type, and a one-line description.

```markdown
## Input

You will receive:
- **field_name**: Type — description (required)
- **other_field** (optional): Type — description, defaults to X if not provided
```

### Steps/Checks sections

The core of the agent. Each step is a discrete, testable unit of work. For Tier 1 agents: fetch, then extract specific fields with exact rules. For Tier 2 agents: score each dimension with a point table, then derive a total. For Tier 3 agents: describe the analytical framework per output section.

Rules for steps:
- Be mechanical enough that two runs on the same input produce the same output
- Never say "use your judgment" — state the rule explicitly
- Include failure behavior per step (what to do if the fetch fails, the data is missing, etc.)

### Output section

Specify the exact JSON schema with a complete example. Every field must appear in the example, including nulls and empty arrays.

```markdown
## Output

Return this exact JSON structure:

​```json
{
  "field": "value — what this represents",
  "nested": {
    "sub_field": "example value"
  },
  "array_field": ["example item"]
}
​```
```

Rules for output:
- Every field must be present even if null or empty — callers rely on the schema
- Include inline comments in the example showing what each field represents
- Arrays should show at least one example item
- Don't return fields conditionally based on tier or mode — use null for absent data

### Error Handling section

Document exactly what the agent returns on failure. All agents must handle two cases:
1. The primary fetch/operation fails entirely → return a minimal error object
2. Individual sub-checks fail → populate that section with null and continue

```markdown
## Error Handling

- If [primary operation] fails, return `{"error": "description", "field": "input value"}`.
- If [sub-check] fails, set that section to null and note it in issues. Don't fail the entire run.
- Always return valid JSON.
```

### Rules section

End every agent file with these four rules (verbatim — do not paraphrase):

```markdown
## Rules

- Do NOT interact with the user. You are a background agent.
- Do NOT make [recommendations / strategic judgments / rewrites] — return [data / scores / analysis] only.
- Do NOT fabricate data. Use `null` for anything you can't verify.
- Always return valid JSON.
```

Tier 1 agents forbid recommendations. Tier 2 agents forbid strategic judgments. Tier 3 agents return recommendations, so adjust the second rule to prohibit interacting with the user in ways that go beyond the structured output.

## 5. Naming conventions

- Use `kebab-case` for the file name and `name` frontmatter field
- Name by what the agent *produces*, not what it *does*: `market-site-analyzer` (produces a site analysis), not `fetch-site`
- Use domain prefixes to group related agents:

| Prefix | Domain | Examples |
|--------|--------|---------|
| `wp-` | WordPress-specific | `wp-security-scanner`, `wp-issue-triage`, `wp-fix-generator` |
| `blog-` | Blog content pipeline | `content-blog-researcher`, `content-blog-quality-checker` |
| `content-` | Content inventory and gap analysis | `content-inventory` |
| `market-` | Market segmentation and trend research | `market-segment-classifier`, `market-trend-researcher` |
| `research-` | Qualitative research synthesis | `market-research-synthesizer` |
| `seo-` | SEO scoring and comparison | `market-seo-comparison`, `market-on-page-seo-scorer` |
| `local-` | Local business visibility | `market-local-visibility-researcher` |
| `copy-` | Copy quality and writing style | `copy-quality-scorer` |
| `chatbot-` | Chatbot build and review pipeline | `chatbot-infra-architect`, `chatbot-implementer`, `chatbot-prompt-reviewer`, `chatbot-security-auditor`, `chatbot-ux-reviewer` |

Agents that don't belong to a specific domain use no prefix: `market-site-analyzer`, `market-competitor-profiler`, `market-review-miner`, `market-strategic-synthesis`, `market-serp-researcher`, `market-review-miner`, `ab-test-validator`, `ai-writing-detector`.

## 6. How skills invoke agents

Skills pass a structured input object and wait for JSON. They never show raw agent JSON to the user.

```markdown
Invoke the `agent-name` agent with:
- `field_name`: value or description of where value comes from
- `other_field`: value

Run as a background agent. Wait for completion before proceeding.
```

For parallel invocation:
```markdown
Invoke both agents in parallel — do not wait for one before starting the other:

**Agent 1: agent-name**
- `field`: value

**Agent 2: other-agent**
- `field`: value

Wait for both to complete before Phase N.
```

## 7. When NOT to create an agent

- The task requires back-and-forth with the user (WP-CLI output, file access, user confirmation) → keep it in the skill
- The logic is used by only one skill and is unlikely to be reused → keep it in the skill
- The output is prose or creative content → keep it in the skill; agents return JSON only
- The task is domain synthesis that requires the full context the skill has already assembled → keep it in the skill
