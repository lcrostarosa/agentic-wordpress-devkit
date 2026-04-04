# Contributing

Thank you for you interest in growing this repository.
Contributions are welcome — new skills, new agents, reference docs, and tool integrations.

## What you can contribute

| Type | Where it lives | Guide |
|------|---------------|-------|
| New skill | `plugins/{skill-name}/` | [guides/skill-authoring.md](guides/skill-authoring.md) |
| New agent | `agents/{agent-name}.md` | [guides/agent-authoring.md](guides/agent-authoring.md) |
| Reference docs | `references/{category}/` | No guide — add Markdown files |
| Tool integration | `tools/integrations/` + `tools/clis/` | No guide — follow existing format |

## Registration

New skills and agents must be registered manually — the guides cover authoring but not the manifest entries.

**New skill** — add to `.claude-plugin/marketplace.json` under `"plugins"`:
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

**New agent** — add `"./agents/{agent-name}.md"` to the `"agents"` array in `agents/.claude-plugin/plugin.json`.

## Checklist before submitting

- [ ] `plugin.json` `name` matches directory name and SKILL.md frontmatter
- [ ] Skill registered in `.claude-plugin/marketplace.json`
- [ ] SKILL.md sections in order: Context Gathering → Phases → Output Rules
- [ ] Frontmatter `description` includes specific trigger phrases, not just the canonical use case
- [ ] Independent agent invocations are parallelized (same phase block, not waterfalled)
- [ ] Output Rules section has at least two rules (no raw JSON + ground claims in evidence)
- [ ] New agent registered in `agents/.claude-plugin/plugin.json`, correct tier/model, Rules section verbatim
- [ ] `kebab-case` naming used throughout — file, frontmatter `name`, and manifest entries all match
