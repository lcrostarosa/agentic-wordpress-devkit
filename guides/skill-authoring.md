# Skill Authoring Guide

How to create a new skill from scratch.

## 1. Understand the role of a skill

A skill is an **orchestrator**, not a worker. It:
- Gathers minimal context from the user
- Invokes agents (which do the data collection and analysis)
- Applies its own domain expertise to synthesize findings into a useful deliverable
- Presents output to the user — never raw agent JSON

A skill has no model assigned. It runs at whatever model the user is using. Agents declare their own model in frontmatter.

## 2. File location and registration

Three files are required for every skill:

**`plugins/{skill-name}/skills/{skill-name}/SKILL.md`** — the skill itself

**`plugins/{skill-name}/.claude-plugin/plugin.json`** — the plugin manifest:
```json
{
  "name": "skill-name",
  "description": "One sentence describing what the skill does and when it activates.",
  "version": "1.0.0",
  "license": "MIT",
  "keywords": ["keyword1", "keyword2"]
}
```

**`.claude-plugin/marketplace.json`** — add an entry to the `"plugins"` array:
```json
{
  "name": "skill-name",
  "source": "./plugins/skill-name",
  "description": "...",
  "version": "1.0.0",
  "license": "MIT",
  "keywords": ["keyword1", "keyword2"],
  "category": "seo | marketing | web-development | content | developer-tools",
  "tags": ["tag1", "tag2"]
}
```

## 3. Required frontmatter

Every SKILL.md must open with:

```yaml
---
name: skill-name
description: >
  When the user wants to [primary use case]. Also use when the user mentions
  "[trigger phrase]", "[trigger phrase]", "[trigger phrase]".
  Use when user says "[common phrasings]".
metadata:
  version: 1.0.0
---
```

The `description` field drives skill selection. It must include:
- The canonical use case ("When the user wants to...")
- Specific trigger phrases users are likely to say ("audit my site", "check my headers")
- Edge cases that should route here but might not be obvious

**Bad:** "Helps with SEO."
**Good:** "When the user wants to audit, review, or diagnose SEO issues on their site. Also use when the user mentions 'why am I not ranking', 'traffic dropped', 'crawl errors', 'page speed', or 'help with SEO'."

## 4. Required skill sections (in order)

### Title and purpose paragraph

```markdown
# Skill Name

[One to three sentences: what problem this skill solves, how it works (agent-based or inline), and what the deliverable looks like.]
```

This is not an identity paragraph (that's for agents). It's a reader-facing description of what the skill does. Write it for the skill author reading this file, not for an end user.

### Context Gathering

Always the first section. Two mandatory checks before asking anything:

```markdown
## Context Gathering

**Check for product marketing context first:**
If `.agents/product-marketing-context.md` exists, read it before asking questions. Use that context and only ask for what's missing.

Ask only what isn't obvious from context:
1. **[Field]**: [What it's for and how it shapes the workflow]
2. **[Field]**: [What it's for]

If the user provides [minimal valid input] — start. Don't over-ask.
```

Rules for intake:
- Always check `.agents/product-marketing-context.md` first
- Ask the minimum number of questions needed to start
- If the user provides a URL and a clear intent, start immediately
- State the "start anyway" condition explicitly so the skill doesn't stall on optional fields

### Phase sections

Structure the workflow as numbered phases. Phase names reflect what happens, not what agents do.

```markdown
## Phase 1 — [What Happens] (qualifier if always/conditional)

[Agent invocation or inline work]

## Phase 2 — [Branch or Analysis]

[Conditional logic or second-stage agents]

## Phase 3 — Synthesize

[How to compile the output]
```

Phase naming conventions:
- Phase 1 is always data collection (invoke baseline agents)
- Phase 2 is branching or analysis (conditional agents based on Phase 1 findings)
- Phase 3 is synthesis (compile everything into the deliverable)
- Label phases that always run with `(always)` and conditional phases with `(if [condition])`

**For skills with no agents** (pure creative/strategy skills), phases represent logical steps in the workflow rather than agent boundaries.

### Output Rules

Every skill must end with an Output Rules section:

```markdown
## Output Rules

- Do not show agent JSON to the user — only the synthesized [report/copy/plan]
- Every finding must cite specific evidence from agent output (e.g., "PageSpeed score: 43/100")
- [Any skill-specific rules about tone, format, or constraints]
```

Minimum two rules: no raw JSON, and ground claims in evidence. Add skill-specific rules as needed.

### References (optional)

```markdown
## References

- [Reference Name](../../../../references/category/file.md) — one-line description of what's in it
```

Link to files in `references/` that the skill draws on. Only include references the skill actually uses — don't list everything tangentially related.

### Related Skills (optional)

```markdown
## Related Skills

- **skill-name**: When to use it instead of or alongside this skill
```

## 5. Intake conventions

**Check product-marketing-context.md first** — every skill that asks about business context must read this file if it exists. It stores the user's product, ICP, differentiators, and competitors so skills don't ask for them repeatedly.

**Ask minimally** — if the user gives a URL and says "audit this," start. The intake section should state explicitly when the skill will proceed without complete answers. Over-asking causes friction; under-asking is almost always recoverable.

**Batch questions** — if you must ask multiple things, ask them all in one message. Never ask one question, wait for the answer, then ask another.

**Let context infer type** — if the URL or description makes the site type obvious, don't ask for confirmation. Infer and proceed.

## 6. Branching pattern

Skills branch based on agent findings, not upfront user input. The branch condition must be specific and testable.

```markdown
## Phase 2 — Branch (based on Phase 1 output)

After `market-site-analyzer` completes, evaluate and invoke applicable branches in parallel:

**Branch A — [Signal detected]:**
Condition: `schema.types_found` contains "LocalBusiness" OR heading text contains city/location keywords.
→ Invoke `market-local-visibility-researcher` with: ...

**Branch B — [Signal detected]:**
Condition: `schema.types_found` contains "Article" OR `/blog/` present in URL patterns.
→ Invoke `market-on-page-seo-scorer` with: ...

Run all applicable branches in parallel. If no branch applies, proceed to Phase 3 with Phase 1 data only.
```

Branch condition rules:
- State the condition as a specific field check or content pattern — not "if relevant"
- Always provide a fallback for when no branch applies
- Run parallel branches simultaneously — never waterfall when you can parallelize

## 7. Agent invocation pattern

```markdown
Invoke the `agent-name` agent with:
- `field_name`: value or description of where this value comes from
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

## 8. Synthesis rules

The synthesis phase is where the skill's domain expertise lives. Agents return data — the skill applies judgment to turn it into something useful.

- **Never relay raw JSON** — transform agent output into the deliverable format
- **Add the layer agents can't** — message match, competitive context, intent staging, business language
- **Ground every claim** — cite the specific agent finding behind each recommendation ("PageSpeed score 43/100, LCP 4.2s")
- **Prioritize by impact** — don't list 15 things at equal weight; lead with what matters most
- **Handle missing data gracefully** — if an agent fails, note "data unavailable" for that section and continue

## 9. Naming conventions

- Use `kebab-case` for the skill name (file, plugin.json, and frontmatter `name` field must all match)
- Name by what the user gets, not the mechanism: `market-seo-audit` not `run-market-site-analyzer`
- Keep names short and recognizable — users will type them or search for them
- If a skill absorbs a retired skill, note it in the description: "Absorbs blog-strategy"
- Use a domain prefix to group related skills:

| Prefix | Domain | Skills |
|--------|--------|--------|
| `wordpress-` | WordPress site building and management | `wordpress-design`, `wordpress-security`, `wordpress-issue-debug` |
| `seo-` | SEO, structured data, and technical search | `market-seo-audit`, `market-seo-schema-markup` |
| `local-` | Local business visibility | `local-business-site-audit` |
| `blog-` | Blog content creation and optimization | `content-blog-write`, `content-blog-optimize` |
| `content-` | Broader content operations and strategy | `content-strategy`, `content-refine` |
| `competitor-` | Competitive research and positioning | `market-competitor-research`, `market-competitor-alternatives` |
| `customer-` | Customer research and persona work | `market-customer-research` |
| `marketing-` | Marketing copy, campaigns, and growth | `marketing-copywriting`, `marketing-email-sequence`, `marketing-lead-magnets`, `marketing-launch-strategy`, `marketing-page-cro`, `marketing-experimentation` |
| `chatbot-` | Chatbot creation and deployment | `chatbot-creator` |

Skills that serve as meta/utility tools (building other skills, etc.) use no prefix: `skill-builder`.

## 10. When to create a new skill vs. extend an existing one

**Create a new skill when:**
- The use case has a distinct trigger phrase that doesn't fit an existing skill's description
- The deliverable format is meaningfully different from existing skills
- The agent mix is substantially different (different data sources, different branching)

**Extend an existing skill when:**
- The new use case is a mode or variant of something the skill already does
- The only difference is a parameter (e.g., `market-on-page-seo-scorer` accepts a `mode` field)
- Adding a branch covers the new case without changing the core workflow

**Never create a skill when:**
- The output is a single agent invocation with no synthesis — that belongs in the calling skill or as a direct agent call
- The use case is already covered by a skill with a broader trigger description
