# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A Claude Code plugin marketplace for WordPress design, SEO, marketing, and local business consulting. Three-tier agent architecture with 19 skills and 12 shared agents. No application code, no build system — the deliverables are SKILL.md files that Claude Code loads at runtime.

## Repository Structure

```
.claude-plugin/marketplace.json    # Marketplace catalog
agents/                            # Shared agents (used by multiple skills)
  .claude-plugin/plugin.json       # Single manifest for all agents
  {agent-name}/                    # name of agent - includes model, instructions, input format, and output format
plugins/
  {skill-name}/
    .claude-plugin/plugin.json     # Plugin manifest
    skills/{skill-name}/
      SKILL.md                     # Orchestrator entry point
      evals/                       # Test scenarios (optional)
references/                        # Shared domain knowledge (all skills)
  copy/                            # Copywriting, email copy, transitions
  seo/                             # AI detection, schema, local SEO
  competitor/                      # Market taxonomy, SEO comparison, strategy frameworks
  content/                         # CMS patterns, lead magnets, research sources, CRO experiments
  wordpress/                       # WP hardening, security headers, error codes, performance
guides/
  agent-authoring.md               # Full guide: tiers, sections, naming, invocation patterns
  skill-authoring.md               # Full guide: frontmatter, phases, intake, branching, synthesis
tools/
  REGISTRY.md                      # Tool index
  integrations/                    # API guides (14 tools)
  clis/                            # Zero-dependency Node.js CLIs
```

## Agent Architecture

### Three Tiers
Use the proper model for each agent

**Tier 1 — `model: haiku` (data collection)**
Agents that fetch, extract, and count. No analytical judgment. Return JSON only.

**Tier 2 — `model: sonnet` (analysis)**
Agents that score, compare, and classify. Return structured findings.
General-purpose — called by any skill needing strategic output.

**Tier 3 — `model: opus` (strategy)**
Agents that reason about strategy. Return recommendations, positioning, and action plans.

### Orchestrator Pattern

Skills are NOT step sequences. They:
1. Gather minimal context (URL, goal)
2. Invoke baseline agents (always)
3. Branch based on findings (conditional agents)
4. Synthesize results using their own domain expertise

Example branch logic (market-seo-audit):
```
After market-site-analyzer:
  LocalBusiness schema detected → market-local-visibility-researcher
  Blog content detected → market-on-page-seo-scorer (mode: blog-post)
  Competitors provided → market-seo-comparison (parallel)
  Deep dive requested → market-strategic-synthesis
```

## Agent Authoring Guide

See [`guides/agent-authoring.md`](guides/agent-authoring.md) — covers tier selection, required frontmatter, all file sections in order (identity, input, steps, output, error handling, rules), naming conventions, invocation patterns, and when NOT to create an agent.

## Skill Authoring Guide

See [`guides/skill-authoring.md`](guides/skill-authoring.md) — covers file location and registration, required frontmatter, all skill sections in order (title, context gathering, phases, output rules), intake conventions, branching patterns, agent invocation, synthesis rules, naming conventions, and when to create vs. extend a skill.

## Blog Skill Suite (claude-blog)

22 blog skills integrated from the [claude-blog](https://github.com/AgriciDaniel/claude-blog) plugin (v1.6.5). Uses 4 dedicated blog agents plus shared references and 12 content templates.

### Blog Agents (in `agents/`)

| Agent | Tier | Purpose |
|---|---|---|
| `blog-researcher` | Tier 1 (haiku) | Find statistics, images, competitive data |
| `blog-writer` | Tier 2 (sonnet) | Content generation with dual optimization |
| `blog-seo` | Tier 2 (sonnet) | On-page SEO validation |
| `blog-reviewer` | Tier 2 (sonnet) | Quality scoring and AI content detection |

### Blog Skills (in `plugins/blog-*/`)

| Skill | Category | Purpose |
|---|---|---|
| `blog` | content | Main orchestrator — routes to sub-skills |
| `blog-write` | content | New article generation (7 phases) |
| `blog-rewrite` | content | Optimize existing posts |
| `blog-analyze` | content | 5-category 100-point scoring |
| `blog-audit` | content | Full-site health assessment |
| `blog-brief` | content | Content brief generation |
| `blog-outline` | content | SERP-informed outline |
| `blog-strategy` | marketing | Topic cluster architecture |
| `blog-calendar` | marketing | Editorial calendar |
| `blog-seo-check` | seo | 11-point on-page SEO validation |
| `blog-schema` | seo | JSON-LD schema generation |
| `blog-chart` | content | SVG chart generation (internal) |
| `blog-image` | content | AI image generation (Gemini) |
| `blog-audio` | content | Audio narration (Gemini TTS) |
| `blog-geo` | seo | AI citation optimization audit |
| `blog-factcheck` | content | Source verification |
| `blog-cannibalization` | seo | Keyword overlap detection |
| `blog-repurpose` | marketing | Cross-platform content adaptation |
| `blog-persona` | content | Writing voice management |
| `blog-taxonomy` | content | Tag/category CMS sync |
| `blog-notebooklm` | content | NotebookLM research integration |
| `blog-google` | seo | Google API integration (PSI, CrUX, GSC, GA4) |

### Blog References (in `references/blog/`)

14 shared reference docs covering content rules, templates, quality scoring, E-E-A-T signals, SEO optimization, visual media, distribution, and AI citations. Also duplicated inside `plugins/blog/skills/blog/references/` for skill-local access.

## Key Conventions

- **Agents return JSON only** — no prose, no recommendations, no user interaction. Skills synthesize.
- **Agents run silently** — don't show agent JSON to the user; show the synthesized report.
- **Parallel execution** — always invoke independent agents in the same Phase (don't waterfall when you can parallelize).
- **Schema detection limitation** — `web_fetch` strips `<script>` tags and cannot detect JS-injected JSON-LD. Never report "no schema found" as definitive. Always note: *"Verify with Google's Rich Results Test."*
- **product-marketing-context.md** — skills check for `.agents/product-marketing-context.md` before asking questions. Create this file in a project to skip repeated intake questions.
- **Model assignment in frontmatter** — agent files declare `model: haiku/sonnet/opus` in their YAML frontmatter. Skills don't specify a model — they run at whatever model the user is using.
- **Evals** — `evals/` directories use `assertions` arrays with `id` and `text` fields for pass/fail validation.
