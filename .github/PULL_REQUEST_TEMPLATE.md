## What this adds or changes

<!-- One sentence. e.g., "Adds a new chatbot-creator skill" or "Fixes branch logic in market-seo-audit" -->

## Type

- [ ] New skill
- [ ] New agent
- [ ] Skill update / bug fix
- [ ] Agent update / bug fix
- [ ] Reference docs
- [ ] Tool integration
- [ ] Other

## Checklist

### All contributions
- [ ] `kebab-case` naming used throughout (file, frontmatter `name`, manifest entries)
- [ ] No backwards-compatibility shims — deleted what was replaced

### New or updated skill
- [ ] `plugins/{skill-name}/.claude-plugin/plugin.json` present, `name` matches directory and SKILL.md frontmatter
- [ ] Entry added to `.claude-plugin/marketplace.json`
- [ ] SKILL.md sections in order: Context Gathering → Phases → Output Rules
- [ ] Frontmatter `description` includes specific trigger phrases, not just the canonical use case
- [ ] Independent agent invocations are parallelized (same phase block, not waterfalled)
- [ ] Output Rules section has at least two rules (no raw JSON + ground claims in evidence)
- [ ] `.agents/product-marketing-context.md` checked before asking intake questions

### New or updated agent
- [ ] Registered in `agents/.claude-plugin/plugin.json`
- [ ] Correct tier assigned (`haiku` / `sonnet` / `opus`) and justified by what the agent does
- [ ] All sections present in order: identity → Input → Steps → Output → Error Handling → Rules
- [ ] Rules section is verbatim (not paraphrased)
- [ ] Output schema is complete — every field present in example, including nulls and empty arrays
- [ ] Steps are deterministic — no "use your judgment" language
- [ ] Partial failures set the affected field to `null` and continue; they don't abort the run

## Testing

<!-- How did you verify this works? e.g., ran the skill against a live URL, tested branch conditions manually -->
