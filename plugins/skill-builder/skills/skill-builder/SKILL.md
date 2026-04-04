---
name: skill-builder
description: >
  Build new shared agents for the wordpress-design-skills repository. Walks
  through the full agent authoring guide: tier selection, naming, section
  authoring (identity, input, steps, output, error handling, rules), file
  creation, and manifest registration.
  Use when someone says "create an agent", "add a new agent", "build an agent",
  "scaffold an agent", "I need an agent that", "new background agent", or
  "add to the agent library".
metadata:
  version: 1.0.0
---

# Skill Builder

Builds new shared agents following the three-tier architecture. Applies the full authoring guide to produce a complete, correctly structured agent file and registers it in the manifest.

---

## Phase 1: Intake

Ask all questions in a single message. Do not ask one at a time.

---

To build a new agent, I need a few details:

**1. What should the agent do?**
Describe the task in plain terms — what inputs does it accept and what does it produce?

**2. What skill(s) would call it?**
Name the skill(s) you expect to invoke this agent. If it's for a skill you're building, describe the workflow.

**3. Is this reusable across multiple skills, or specific to one?**
Agents are justified by reuse. If the logic is only needed in one place and unlikely to spread, it may belong in the skill itself.

**4. Are there existing agents that might already cover this?**
(You don't need to know — I'll check. But if you have a hunch, mention it.)

---

After receiving answers, proceed to Phase 2.

---

## Phase 2: Existing Agent Check

Before building, verify there is no duplication.

Read `agents/.claude-plugin/plugin.json` to get the current agent list. For any agent whose name or description could overlap with the requested task, read that agent file and compare its scope.

**If a close match exists:** Present the existing agent to the user. Explain what it already covers and ask:
- "Would you like to extend this agent instead?"
- "Or does your use case genuinely differ?" (if so, describe how)

**If no match exists:** Proceed to Phase 3.

---

## Phase 3: "When NOT to Create an Agent" Gate

Before writing anything, apply the four exclusion rules from the architecture:

| Exclusion | Rule |
|-----------|------|
| User interaction required | The task requires back-and-forth with the user (WP-CLI output, file access, confirmation) → keep in the skill |
| Single-skill, no reuse path | Used by only one skill and very unlikely to be reused → keep in the skill |
| Prose output | The output is narrative, creative, or synthesized prose → agents return JSON only; keep in the skill |
| Full-context synthesis | Requires assembling everything the skill has already gathered → keep in the skill |

If any exclusion applies, explain it to the user clearly and suggest where the logic belongs instead (inline in the skill, or as a separate phase within the skill). Do not proceed to file creation.

If none apply, continue to Phase 4.

---

## Phase 4: Tier Decision

Determine the model tier using this decision tree. State the tier and reasoning before proceeding.

**Ask: what does the agent primarily do?**

```
Does it fetch URLs, extract fields, count occurrences, or check observable data?
  → Tier 1 — model: haiku
  → No judgment needed. Two runs on the same input produce the same output.

Does it score, compare, classify, or interpret findings to produce structured analysis?
  → Tier 2 — model: sonnet
  → Requires judgment within rules. Scores have criteria; classifications have definitions.

Does it reason about strategy, positioning, or produce action plans and recommendations?
  → Tier 3 — model: opus
  → Requires open-ended analytical reasoning. Output shapes decisions, not just data.
```

**Edge case rule:** If you're unsure, ask: "Does it need judgment, or does it follow rules?"
- Rule-following → Tier 1
- Judgment within defined criteria → Tier 2
- Open strategic reasoning → Tier 3

Present the tier choice to the user with a one-sentence rationale. Confirm before proceeding.

---

## Phase 5: Name Selection

Choose a name following these conventions:

- **kebab-case** — always
- **Name by what it produces, not what it does** — `market-site-analyzer` (produces a site analysis), not `fetch-site`
- **Use a domain prefix for domain-specific agents:**

| Prefix | Domain | When to use |
|--------|--------|-------------|
| `wp-` | WordPress-specific | Checks, fixes, or data that only applies to WP |
| `blog-` | Blog content pipeline | Used exclusively in blog creation/optimization flows |
| `content-` | Content inventory/gap analysis | Broader content operations |
| `market-` | Market segmentation or trends | Competitive market analysis |
| `research-` | Qualitative research synthesis | Interview, survey, review synthesis |

- **No prefix** for general-purpose agents: `market-site-analyzer`, `market-review-miner`, `market-strategic-synthesis`

Propose the name to the user. If there is a reasonable alternative, present both with brief rationale and let them choose.

---

## Phase 6: Author the Agent File

Write the complete agent file section by section in this exact order. Do not skip or reorder sections.

### 6a. Frontmatter

```yaml
---
name: {agent-name}
description: {one sentence — what output it produces + what it accepts as input + its tier}
model: haiku | sonnet | opus
---
```

The description is what skills read to decide whether to invoke this agent. It must be specific enough that a skill author knows at a glance:
- What the agent returns
- What it needs as input
- Whether it's Tier 1/2/3

**Bad:** "Analyzes pages and returns data."
**Good:** "Fetch a URL and return structured accessibility findings including ARIA labels, heading order, color contrast signals, and keyboard navigation indicators. Accepts a URL. Tier 1 data collection — returns JSON only."

### 6b. Title and Identity Paragraph

```markdown
# {Agent Name} Agent

You are an autonomous {role description}. You receive {input description} and return {output type}. You do NOT interact with the user — you run silently and return JSON.
```

The identity paragraph must contain these three invariants verbatim:
- **"autonomous"** — signals no human involvement
- **what it receives** — specific fields, not vague
- **"return JSON"** and **"do NOT interact with the user"** — both phrases required

### 6c. Input Section

List every field the agent accepts. Required fields first, optional fields labeled.

```markdown
## Input

You will receive:
- **field_name**: Type — description (required)
- **other_field** (optional): Type — description, defaults to X if not provided
```

Rules:
- Every field the agent uses must be listed here
- Optional fields must state their default behavior
- Types should be specific: `string`, `URL`, `Array<string>`, `boolean`

### 6d. Steps / Checks Section

This is the agent's core. Write each step as a discrete, testable unit of work.

**Tier 1 step pattern** — fetch, then extract with exact rules:
```markdown
### N. {Step Name}

Fetch `{endpoint}`. Extract:
- `field`: exact extraction rule (e.g., "content of `<title>` tag, trimmed")
- `field`: exact rule

If the fetch fails: {specific fallback — e.g., "set to null and note in issues"}
```

**Tier 2 step pattern** — score each dimension with a point table:
```markdown
### N. {Dimension Name} (N points)

| Condition | Points |
|-----------|--------|
| {specific, measurable condition} | N |
| {another condition} | N |
| {fail condition} | 0 |
```

**Tier 3 step pattern** — define the analytical framework per output section:
```markdown
### N. {Analysis Section}

Using the input data, produce:
- **{Sub-output}**: {what to reason about and what constraints apply}
- **{Sub-output}**: {specific framework or criteria}
```

**Authoring rules for all tiers:**
- Be mechanical enough that two runs on the same input produce the same output
- Never say "use your judgment" — state the rule explicitly
- Include failure behavior for every step that could fail
- Tier 1 steps must specify the exact extraction pattern (CSS selector, tag name, regex pattern, response code check)

### 6e. Output Section

Specify the exact JSON schema with a complete, populated example. Every field must appear in the example — including nulls and empty arrays.

```markdown
## Output

Return this exact JSON structure:

​```json
{
  "field": "value — comment explaining what this represents",
  "nested": {
    "sub_field": "example value"
  },
  "array_field": ["example item — show at least one"]
}
​```
```

**Output rules:**
- Every field must be present even if null or empty — callers rely on the schema being stable
- Include inline comments on non-obvious fields showing what each represents
- Arrays must show at least one example item
- Do not return fields conditionally — use `null` for absent data
- Field names must match exactly what the steps produce

### 6f. Error Handling Section

Document exactly what the agent returns on failure. Every agent must handle two cases:

```markdown
## Error Handling

- If {primary operation} fails, return `{"error": "description", "field": "input value"}`.
- If {sub-check} fails, set that section to `null` and note it in issues. Don't fail the entire run.
- Always return valid JSON.
```

At minimum: one rule for total failure (primary fetch/operation fails), one rule for partial failure (a sub-check fails mid-run).

### 6g. Rules Section

End every agent file with these four rules, adjusted by tier:

**Tier 1 (haiku):**
```markdown
## Rules

- Do NOT interact with the user. You are a background agent.
- Do NOT make recommendations — return data only.
- Do NOT fabricate data. Use `null` for anything you can't verify.
- Always return valid JSON.
```

**Tier 2 (sonnet):**
```markdown
## Rules

- Do NOT interact with the user. You are a background agent.
- Do NOT make strategic judgments — return scores and structured findings only.
- Do NOT fabricate data. Use `null` for anything you can't verify.
- Always return valid JSON.
```

**Tier 3 (opus):**
```markdown
## Rules

- Do NOT interact with the user. You are a background agent.
- Do NOT go beyond the structured output format to have conversations or ask clarifying questions.
- Do NOT fabricate data or invent evidence. Base all analysis on the provided inputs.
- Always return valid JSON.
```

---

## Phase 7: File Creation and Registration

Once the agent file is complete and confirmed by the user:

### 7a. Create the agent file

Write to: `agents/{agent-name}.md`

### 7b. Register in the manifest

Read `agents/.claude-plugin/plugin.json`. Add `"./agents/{agent-name}.md"` to the `"agents"` array.

Place it grouped logically with related agents:
- `wp-` agents alongside other `wp-` agents
- `blog-` agents alongside `content-blog-researcher`
- General-purpose agents at the end of the Tier 1/2/3 block they belong to

### 7c. Confirm placement

Tell the user:
- The file path created
- Where it was added in the manifest
- Which skill(s) should invoke it and with what input fields (as a quick-start reference)

---

## Phase 8: Invocation Template

After creating the file, output a ready-to-paste invocation block the user can drop into their skill:

```markdown
## Invocation Template (paste into your skill)

Invoke the `{agent-name}` agent with:
- `{field_name}`: {description of where this value comes from}
- `{field_name}`: {description}

Run as a background agent. Wait for completion before proceeding.
```

For parallel invocation (if this agent is meant to run alongside others), also provide the parallel form:

```markdown
## Parallel Invocation Template

Invoke in parallel with other agents — do not wait for one before starting the other:

**Agent: {agent-name}**
- `{field}`: {value source}

Wait for all parallel agents to complete before synthesizing.
```

---

## Output Rules

- Do not create the file until Phase 6 is complete and confirmed (or implicitly accepted through lack of objection)
- Present the complete draft agent in a code block before writing to disk — let the user review it
- If the user requests changes after reviewing, apply them before writing
- The manifest must always be updated in the same session as the file creation — never leave an agent file unregistered
