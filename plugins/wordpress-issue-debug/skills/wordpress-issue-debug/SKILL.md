---
name: wordpress-issue-debug
description: >
  When the user has a WordPress issue, bug, or problem to debug and troubleshoot.
  Use when they mention: WordPress errors, broken layouts, white screen of death,
  WSOD, 500 errors, 503 errors, slow site, plugin conflicts, PHP fatal errors,
  database errors, admin not loading, theme broken after update, redirect loops,
  REST API not working, or any variation of "my WordPress site is broken."
  Works with or without a live URL — an error message alone is enough to start.
  Related skills: wordpress-design (theme build), wordpress-security (security audit),
  market-seo-audit (technical SEO), marketing-page-cro (conversion issues).
metadata:
  version: 1.0.0
---

# WordPress Issue Debugger

**Key references:**
- [WP Error Codes](../../../../references/wordpress/wp-error-codes.md) — HTTP status codes, PHP error levels, WordPress-specific error constants
- [PHP Error Patterns](../../../../references/wordpress/php-error-patterns.md) — reading stack traces, database errors, redirect loops, PHP version incompatibility
- [Performance Thresholds](../../../../references/wordpress/performance-thresholds.md) — Core Web Vitals targets, TTFB benchmarks by hosting tier, caching hierarchy

---

## Context Check

Before asking intake questions, check if `.agents/product-marketing-context.md` exists in the current project. If it does, read it and extract any already-known fields (site URL, hosting environment, known issues) to skip redundant questions.

## Core Principles

- **Evidence over assumption**: Every diagnosis must cite specific signals from the error text, site data, or user-provided context — never guess the root cause
- **Specificity over generality**: Every fix step must be executable as written — no vague actions, no "check your settings"
- **Safety first**: Any step that modifies the database, deletes files, or could cause downtime must include a rollback instruction
- **Honest escalation**: If the issue cannot be diagnosed from available data, say so clearly and tell the user exactly what additional information would unlock the diagnosis

## Agent Architecture

```
INTAKE (orchestrator)
    ↓
[wp-issue-triage] — fast model
    ↓ issue_category: ui | backend | performance | ambiguous
    ├── ui          → [wp-ui-debugger]          fast model
    ├── backend     → [wp-backend-debugger]     fast model
    ├── performance → [wp-performance-debugger] fast model
    └── ambiguous   → spawn top 2 in parallel, merge outputs
    ↓ specialist diagnostic JSON
    ╔══════════════════════════════════════╗
    ║  ITERATION LOOP (max 3 rounds)       ║
    ║  [wp-fix-generator]  — Sonnet        ║ ←── rejection_reasons
    ║  [wp-fix-validator]  — fast model    ║ ──→ verdict: pass | fail
    ╚══════════════════════════════════════╝
    ↓ verdict: pass (or max iterations reached)
  Present fix to user
    ↓
  Ask: "Did this fix the issue?"
```

## Step 1: Intake

Present all questions in a single message. Do not ask them one at a time. Mark optional fields as optional.

---

To diagnose your WordPress issue, I need a few details:

**1. What's the symptom?**
(White screen / 500 error / broken layout / slow site / admin not loading / plugin conflict / other — describe in your own words)

**2. When did it start?**
(After a plugin update / after a theme update / after a WordPress core update / after a migration / suddenly with no changes / unknown)

**3. Do you have an error message or code? (paste it here)**
Even a partial message helps. If you see "Error establishing database connection," "Fatal error," or a PHP stack trace — paste it.

**4. What is the site URL? (optional)**
If the site is publicly accessible, sharing the URL allows me to fetch live data.

**5. What is your hosting environment?**
(Shared hosting / VPS / WP Engine / Kinsta / Flywheel / Local / unknown)

**6. What have you already tried?**
(Disabling plugins / switching themes / clearing cache / enabling debug mode / nothing yet / other)

---

After receiving answers, proceed to Step 2.

## Step 2: Spawn Triage Agent

Spawn the `wp-issue-triage` agent with all intake answers. Use a fast model (claude-haiku-4-5-20251001).

Pass:
- `symptom`: Q1 answer
- `when_started`: Q2 answer
- `error_text`: Q3 answer (null if not provided)
- `url`: Q4 answer (null if not provided)
- `hosting_environment`: Q5 answer
- `already_tried`: Q6 answer as array
- `wp_version_hint`: null (unless user mentioned a WP version)
- `php_version_hint`: null (unless user mentioned a PHP version)

Wait for the triage agent to return JSON before proceeding.

## Step 3: Route to Specialist Agent

Read `triage.issue_category`:

- **"ui"** → Spawn `wp-ui-debugger` (fast model)
- **"backend"** → Spawn `wp-backend-debugger` (fast model)
- **"performance"** → Spawn `wp-performance-debugger` (fast model)
- **"ambiguous"** → Spawn the two agents named in `triage.ambiguous_candidates` in **parallel**; wait for both to complete; merge their outputs before proceeding (the fix generator will receive both diagnostic objects)

Pass to the specialist agent:
- The full `triage` JSON
- All relevant intake fields (url, error_text, symptom_description, when_started, hosting, already_tried)
- Any version hints

While the specialist agent runs, tell the user:

> "I've identified this as a **[issue_category]** issue. Analyzing now..."

Wait for the specialist agent to complete.

### Backend debugger: surface WP-CLI commands (if available)

If the specialist agent was `wp-backend-debugger` and `diagnostic.wp_cli_diagnostic_commands` is non-empty, AND the user has server access (hosting is VPS, Kinsta, WP Engine, or Local):

Present the commands before generating the fix:

> "To get a more precise diagnosis, run these safe read-only commands on your server and share the output — this will help me give you a more specific fix:
>
> ```bash
> [list the wp_cli_diagnostic_commands]
> ```
>
> If you can't run these, I'll proceed with what we know."

Wait for the user to share output, or proceed after 30 seconds of inactivity.

## Step 4: Iteration Loop (Max 3 Rounds)

Initialize: `iteration_count = 0`, `previous_fix = null`, `rejection_reasons = null`

### Round Start

```
iteration_count += 1
```

#### 4a. Spawn wp-fix-generator (Sonnet model: claude-sonnet-4-6)

Pass:
- `triage`: the triage JSON
- `diagnostic`: the specialist diagnostic JSON (or merged diagnostics if ambiguous)
- `original_symptom`: Q1 answer verbatim
- `original_error_text`: Q3 answer verbatim (or null)
- `iteration_number`: current iteration_count
- `previous_fix_attempt`: previous_fix (null on round 1)
- `validator_rejection_reasons`: rejection_reasons (null on round 1)

Wait for fix JSON.

#### 4b. Spawn wp-fix-validator (fast model)

Pass:
- `triage`: the triage JSON
- `diagnostic`: the specialist diagnostic JSON
- `fix`: the fix JSON from 4a
- `original_symptom`: Q1 answer verbatim
- `original_error_text`: Q3 answer verbatim (or null)
- `iteration_number`: current iteration_count

Wait for validator JSON.

#### 4c. Evaluate verdict

**If `validator.verdict == "pass"`** → Store `final_fix = current fix`. Go to Step 5 (present fix).

**If `validator.verdict == "fail"` AND `iteration_count < 3`**:
- Store `previous_fix = current fix`
- Store `rejection_reasons = validator.rejection_reasons`
- Return to Round Start (increment iteration_count)

**If `validator.verdict == "fail"` AND `iteration_count == 3`**:
- Identify the round with the highest `validator.confidence_in_fix` score (high > medium > low > cannot_assess)
- Store `final_fix = the fix from that round`
- Store `escalation_needed = true`
- Go to Step 5 (escalation path)

## Step 5: Present Fix to User

### Standard path (validator passed)

Present the fix in this format:

---

## Fix: [fix.fix_title]

**What's wrong:** [fix.root_cause_summary]

**Steps:**

[For each step in fix.fix_steps:]

**Step [step_number]: [action]**
- Method: [method]
[If code_or_command is not null:]
```
[code_or_command]
```
[If file_path is not null:]
- File: `[file_path]`
- Expected result: [expected_result]
[If safe_to_do_on_live is false:]
⚠️ **Rollback:** [rollback_instruction]

**After fixing, verify by:**
[For each verification step:]
- [step]

**Estimated time:** [estimated_time_minutes] minutes

**If this doesn't fix it:** [if_this_does_not_work]

---

### Escalation path (max iterations reached, validator did not pass)

---

## Best-effort fix: [final_fix.fix_title]

The automated validator flagged concerns with this fix after 3 refinement rounds. Here is the best attempt I have, along with what remains uncertain:

**What's likely wrong:** [final_fix.root_cause_summary]

**Steps:** [same format as standard path]

**Open questions the validator could not resolve:**
[For each unresolved rejection_reason from the final round:]
- **[gate]:** [reason]
  → To resolve: [suggestion]

**Recommendation:** [If escalate_to_user is true from validator output: recommend specific next action — e.g., "Enable WP_DEBUG and share the debug.log contents" or "Run `wp db check` and share the output"]

---

## Step 6: Follow-Up

After presenting the fix, ask:

> "Did this fix the issue? Or if you're able to try it, let me know the result and I'll refine the recommendation if needed."

If the user reports the fix did not work, ask them to share:
1. Any new error message that appeared
2. What specifically happened (still same issue / different issue / partial improvement)

Then restart from Step 3 with the additional context, treating this as a new iteration with enriched diagnostic data.

## Output Format Notes

- Use code blocks for all PHP snippets, WP-CLI commands, and .htaccess blocks
- Use `backticks` for all file paths, function names, and option names
- Use ⚠️ to flag any step that modifies the database, deletes files, or could cause downtime
- Keep the fix presentation scannable — the user may be in a stressful situation with a down site

## Related Skills

- **wordpress-design** — theme build, block themes, ACF, page builder setup
- **wordpress-security** — security audit, hardening, vulnerability scanning
- **market-seo-audit** — technical SEO, crawlability, on-page issues
- **market-seo-schema-markup** — structured data implementation and debugging
- **marketing-page-cro** — conversion issues, UX problems, landing page analysis

---

## Output Rules

- Never show raw agent JSON to the user — synthesize into the structured fix report.
- Always include cause and fix for every issue found — no diagnosis without remediation.
- Use ⚠️ for warnings, not errors — reserve error language for confirmed failures.
- Report validator failures with manual fallback steps so the user is never stuck.
- If data is unavailable, say so explicitly rather than guessing.
