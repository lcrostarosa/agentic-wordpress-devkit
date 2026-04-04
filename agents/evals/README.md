# Agent Evals

Test scenarios for each shared agent. These are agent-level tests — they validate agent behavior in isolation, not full skill orchestration (see `plugins/*/evals/` for skill-level tests).

## Format

Each `{agent-name}.json` file contains:

```json
{
  "agent_name": "agent-name",
  "evals": [
    {
      "id": 1,
      "description": "What this scenario tests",
      "input": { "field": "value" },
      "assertions": [
        "Each string describes one thing to verify about the JSON output"
      ]
    }
  ]
}
```

## How to Run

1. Invoke the agent with the `input` object provided in the scenario
2. Verify each assertion against the returned JSON
3. All assertions must pass for the scenario to pass

## Assertion Conventions

- **Structure**: "Output contains X field" — checks JSON schema completeness
- **Range**: "X is between N and M" — checks numeric bounds
- **Constraint**: "X is one of [a, b, c]" — checks enumerated values
- **Prohibition**: "Output does not contain prose or recommendations" — checks agent boundaries
- **Error**: "Returns error object with Y field" — checks error handling path

## Coverage

All 29 agents are covered. Agents are grouped by tier:

| Tier | Model | Agents |
|------|-------|--------|
| Tier 1 — Data Collection | haiku | market-site-analyzer, market-competitor-profiler, market-local-visibility-researcher, market-serp-researcher, market-review-miner, ai-writing-detector, ab-test-validator, market-segment-classifier, content-blog-researcher, content-blog-quality-checker, wp-security-scanner, content-inventory, market-trend-researcher, wp-issue-triage |
| Tier 2 — Analysis | sonnet | market-on-page-seo-scorer, market-seo-comparison, copy-quality-scorer, wp-fix-generator, market-research-synthesizer |
| Tier 3 — Strategy | opus | market-strategic-synthesis, chatbot-infra-architect |
| WP Debug (fast model) | haiku | wp-ui-debugger, wp-backend-debugger, wp-performance-debugger, wp-fix-validator |
| Chatbot (varies) | sonnet | chatbot-implementer, chatbot-prompt-reviewer, chatbot-security-auditor, chatbot-ux-reviewer |
