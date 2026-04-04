---
name: chatbot-creator
description: >
  When the user wants to build, create, design, or set up a chatbot or AI assistant.
  Also use when the user mentions "chatbot", "AI chat widget", "bot for my website",
  "customer support bot", "FAQ bot", "lead gen bot", "appointment bot", "chat assistant",
  "WordPress chatbot", "Slack bot", "Discord bot", "WhatsApp bot", "conversational AI",
  "virtual assistant", "system prompt", "guardrails for my bot", or "chatbot UX".
metadata:
  version: 1.0.0
---

# Chatbot Creator

Orchestrates a multi-agent chatbot build. Phase 1 designs the infrastructure. Phase 2 audits security and designs UX in parallel (and reviews any provided system prompt). Phase 3 generates implementation artifacts. Phase 4 synthesizes everything into a complete build guide.

## Context Gathering

**Check for product marketing context first:**
If `.agents/product-marketing-context.md` exists, read it before asking questions. Use that context and only ask for what's missing.

Ask only what isn't obvious from context:
1. **Purpose** — what the chatbot does (customer support, lead gen, FAQ, appointment booking, internal tool, etc.)
2. **Platform** — where it lives (WordPress widget, Slack, Discord, WhatsApp, custom API)
3. **System prompt** (optional) — if the user already has a draft, collect it now for review
4. **Tech stack preference** (optional) — Node.js, Python, PHP/WordPress plugin, no preference
5. **Existing integrations** (optional) — CRM, calendar, help desk, analytics tools already in use

If the user says "build me a chatbot for my WordPress site" — start. Don't require all five items before beginning.

---

## Phase 1 — Architecture Design (always)

Invoke `chatbot-infra-architect` agent with:
- `purpose`: chatbot purpose
- `platform`: target platform (default: `custom-api` if not specified)
- `scale_estimate`: inferred from context (`low` if not specified)
- `tech_stack_preference`: user preference or null
- `existing_integrations`: array of integrations or empty array

Run as a background agent. Wait for completion — Phases 2 and 3 depend on this output.

---

## Phase 2 — Parallel Review (always)

After Phase 1 completes, invoke applicable agents simultaneously.

**Always invoke:**

`chatbot-security-auditor` with:
- `architecture_blueprint`: Phase 1 output
- `system_prompt`: user-provided prompt (or null)
- `platform`: target platform
- `data_handling`: inferred from purpose (e.g., "collects name and email for lead capture")

`chatbot-ux-reviewer` with:
- `purpose`: chatbot purpose
- `platform`: target platform
- `tone`: inferred from brand context or default "friendly and professional"
- `conversation_flows`: null (design from scratch)
- `target_audience`: inferred from purpose

**Conditionally invoke:**

`chatbot-prompt-reviewer` — **only if** the user provided a system prompt draft:
- `system_prompt`: user's draft prompt
- `purpose`: chatbot purpose
- `platform`: target platform
- `tone`: inferred tone

Run all applicable Phase 2 agents in parallel. Wait for all to complete before Phase 3.

---

## Phase 3 — Implementation (always)

Invoke `chatbot-implementer` agent with:
- `architecture_blueprint`: Phase 1 output
- `security_constraints`: `required_before_launch` array from `chatbot-security-auditor`
- `ux_flows`: full output from `chatbot-ux-reviewer`
- `platform`: target platform

Run as a background agent. Wait for completion before Phase 4.

---

## Phase 4 — Synthesize

Compile all agent JSON into the Chatbot Build Guide. Never show raw agent JSON to the user.

### Report Format

```
## Chatbot Build Guide: [Purpose] on [Platform]
**Date**: [date]
**Platform**: [platform]
**Tech stack**: [from architecture_blueprint.tech_stack]
**Agents run**: chatbot-infra-architect, chatbot-security-auditor, chatbot-ux-reviewer[, chatbot-prompt-reviewer]

---

## Architecture Overview

**Platform:** [platform_recommendation.platform] — [platform_recommendation.rationale]
**Runtime:** [tech_stack.runtime] + [tech_stack.framework]
**AI model:** [tech_stack.ai_model]
**Session store:** [tech_stack.session_store]
**Hosting:** [tech_stack.hosting]

**Message flow:**
[data_flow — numbered list from architecture_blueprint]

**Integrations:**
[integration_map table: System | Direction | Protocol | Data]

**Risks to address:**
[risks table: Risk | Severity | Mitigation]

---

## Security & Guardrails

**Risk level:** [risk_level]

**Required before launch:**
[required_before_launch as numbered checklist]

**Full findings:**
[findings table: Category | Check | Status | Severity | Fix]
  - Show only failed/warning items; omit passed checks to keep report scannable

---

## Prompt Recommendations [only if chatbot-prompt-reviewer ran]

**Score:** [total_score]/100 — [score_band]

| Dimension | Score | Key Issue |
|-----------|-------|-----------|
| Clarity | [score]/20 | [top issue or "None"] |
| Completeness | [score]/20 | [top issue or "None"] |
| Persona Consistency | [score]/15 | [top issue or "None"] |
| Edge Case Coverage | [score]/20 | [top issue or "None"] |
| Guardrails | [score]/25 | [top issue or "None"] |

**Priority fixes:**
[priority_fixes as numbered list]

[If rewritten_prompt is not null:]
**Rewritten system prompt:**
```
[rewritten_prompt]
```

---

## Conversation UX Design

**UX Score:** [ux_score]/100

**Recommended greeting:**
> [onboarding_sequence.greeting_message]

**Quick actions:** [onboarding_sequence.quick_actions as comma-separated list]

**Conversation flows:**
[For each flow in flows array:]
### [flow.name]
*Trigger: [flow.trigger]*
[steps as dialogue: "User: ... / Bot: ..."]
*Fallback: [flow.fallback]*

---

## Implementation Artifacts

**Dependencies:**
[dependencies.runtime as bullet list]

**Environment variables:**
[environment_variables table: Variable | Required | Description]

**Files to create:**
[code_artifacts table: File | Language | Description]

[For each code_artifact:]
### [name] (`[file_path]`)
```[language]
[content]
```

[For each config_template:]
### [name] (`[file_path]`)
```
[content]
```

**System prompt template:**
```
[system_prompt_template]
```

---

## Deployment Steps

[deployment_steps as numbered list]

---

## Launch Checklist

**Security (required):**
[required_before_launch items as checkboxes]

**UX (recommended):**
[ ] Test all conversation flows with real users before launch
[ ] Verify onboarding message renders correctly on target platform
[ ] Confirm escalation path connects to a real human endpoint
[ ] Test error states (API down, session expired)

**Technical:**
[ ] All environment variables set in production
[ ] Rate limiting enabled and tested
[ ] Logging configured (without PII)
[ ] Monitoring/alerting in place
```

---

## Output Rules

- Do not show raw agent JSON to the user — only the synthesized report
- Every finding must cite specific evidence from agent output (e.g., "risk_level: high", "ux_score: 42/100")
- Code artifacts must be shown in full — do not truncate with "..."
- If an agent fails, note "data unavailable for [section]" and continue
- Prompt Recommendations section only appears if `chatbot-prompt-reviewer` ran
- Every security finding shown must include the specific fix, not just the issue
