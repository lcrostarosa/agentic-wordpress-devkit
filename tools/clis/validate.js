#!/usr/bin/env node
'use strict';

/**
 * validate.js — wordpress-design-skills integrity check
 *
 * Checks:
 *   1. Agent file integrity (frontmatter: name, description, model)
 *   2. Agent manifest registration (bidirectional + no duplicate files in plugins/)
 *   3. Agent eval coverage and structure
 *   4. Skill file integrity (frontmatter: name, description, metadata.version)
 *   5. Marketplace registration (bidirectional)
 *   6. Stale agent references in SKILL.md files
 *   7. Skill eval coverage (warnings) and structure
 *   8. Model tier summary
 *
 * Exit 0 if no errors (warnings are OK). Exit 1 if any errors.
 * Usage: node tools/clis/validate.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const AGENTS_DIR = path.join(ROOT, 'agents');
const PLUGINS_DIR = path.join(ROOT, 'plugins');
const AGENT_MANIFEST = path.join(AGENTS_DIR, '.claude-plugin', 'plugin.json');
const MARKETPLACE = path.join(ROOT, '.claude-plugin', 'marketplace.json');
const VALID_MODELS = new Set(['haiku', 'sonnet', 'opus']);

const errors = [];
const warnings = [];

function err(msg) { errors.push(msg); }
function warn(msg) { warnings.push(msg); }

// ─── utilities ────────────────────────────────────────────────────────────────

function readJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function readText(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }
}

function listFiles(dir, ext) {
  try {
    return fs.readdirSync(dir).filter(f => {
      if (ext && !f.endsWith(ext)) return false;
      try { return fs.statSync(path.join(dir, f)).isFile(); } catch { return false; }
    });
  } catch {
    return [];
  }
}

function listDirs(dir) {
  try {
    return fs.readdirSync(dir).filter(f => {
      try { return fs.statSync(path.join(dir, f)).isDirectory(); } catch { return false; }
    });
  } catch {
    return [];
  }
}

/**
 * Parse YAML frontmatter between --- delimiters.
 * Handles: simple key: value, description: > (multi-line), metadata:\n  version:
 */
function parseFrontmatter(content) {
  const result = { name: null, hasDescription: false, model: null, hasTools: false, version: null };
  if (!content) return result;

  const lines = content.split('\n');
  if (!lines[0] || lines[0].trim() !== '---') return result;

  let inMeta = false;
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === '---') break;

    const nameMatch = line.match(/^name:\s*(.+)/);
    if (nameMatch) { result.name = nameMatch[1].trim(); inMeta = false; continue; }

    const modelMatch = line.match(/^model:\s*(.+)/);
    if (modelMatch) { result.model = modelMatch[1].trim(); inMeta = false; continue; }

    if (/^description:/.test(line)) { result.hasDescription = true; inMeta = false; continue; }

    if (/^tools:/.test(line)) { result.hasTools = true; inMeta = false; continue; }

    if (/^metadata:/.test(line)) { inMeta = true; continue; }

    if (inMeta) {
      const versionMatch = line.match(/^\s+version:\s*(.+)/);
      if (versionMatch) { result.version = versionMatch[1].trim(); }
    }
  }

  return result;
}

/**
 * Extract agent references from a SKILL.md.
 * Looks for two patterns:
 *   - `agent-name` agent  (explicit "agent" label)
 *   - Invoke/Spawn [the] `agent-name`  (invocation verb)
 * Returns a Set of unique referenced agent names.
 */
function extractAgentRefs(content) {
  const refs = new Set();
  // Pattern 1: backtick name followed by " agent" (not "agents" as in docs/examples)
  const re1 = /`([\w-]+)`\s+agent(?!s)/g;
  let m;
  while ((m = re1.exec(content)) !== null) refs.add(m[1]);
  // Pattern 2: invoke/spawn keyword followed by optional "the" and backtick name
  const re2 = /(?:Invoke|Spawn|invoke|spawn)\s+(?:the\s+|both\s+)?`([\w-]+)`/g;
  while ((m = re2.exec(content)) !== null) refs.add(m[1]);
  // Filter: skip prefix-only strings ending with '-' (documentation examples, not real agent names)
  for (const ref of refs) {
    if (ref.endsWith('-')) refs.delete(ref);
  }
  return refs;
}

// ─── check 1: agent file integrity ────────────────────────────────────────────

const agentFilenames = listFiles(AGENTS_DIR, '.md');
const knownAgentNames = new Set();
const agentsByModel = { haiku: [], sonnet: [], opus: [] };
const agentErrors = [];

for (const filename of agentFilenames) {
  const filePath = path.join(AGENTS_DIR, filename);
  const content = readText(filePath);
  const fm = parseFrontmatter(content);
  const baseName = path.basename(filename, '.md');

  if (!fm.name) {
    agentErrors.push(`agents/${filename}: missing 'name' in frontmatter`);
  } else if (fm.name !== baseName) {
    agentErrors.push(`agents/${filename}: frontmatter name '${fm.name}' does not match filename '${baseName}'`);
  } else {
    knownAgentNames.add(fm.name);
  }

  if (!fm.hasDescription) {
    agentErrors.push(`agents/${filename}: missing 'description' in frontmatter`);
  }

  if (fm.hasTools) {
    // Tool-based subagent — no model field required; tracked separately
    agentsByModel['tools'] = agentsByModel['tools'] || [];
    agentsByModel['tools'].push(baseName);
  } else if (!fm.model) {
    agentErrors.push(`agents/${filename}: missing 'model' in frontmatter (must be haiku, sonnet, or opus)`);
  } else if (!VALID_MODELS.has(fm.model)) {
    agentErrors.push(`agents/${filename}: invalid model '${fm.model}' (must be haiku, sonnet, or opus)`);
  } else {
    agentsByModel[fm.model].push(baseName);
  }
}

// ─── check 2: agent manifest registration (bidirectional) ─────────────────────

const manifestErrors = [];
const manifest = readJSON(AGENT_MANIFEST);

if (!manifest || !Array.isArray(manifest.agents)) {
  manifestErrors.push(`agents/.claude-plugin/plugin.json: missing or has no 'agents' array`);
} else {
  const manifestPaths = manifest.agents;
  const manifestNames = new Set(manifestPaths.map(p => path.basename(p, '.md')));

  // Paths in manifest that don't resolve to real files
  for (const p of manifestPaths) {
    // Paths are relative to agents/ directory, e.g. "./market-site-analyzer.md"
    const resolved = path.join(AGENTS_DIR, p.replace(/^\.\//, ''));
    if (!fs.existsSync(resolved)) {
      manifestErrors.push(`agents/.claude-plugin/plugin.json: entry '${p}' does not exist on disk`);
    }
  }

  // Agent files not in manifest
  for (const filename of agentFilenames) {
    const baseName = path.basename(filename, '.md');
    if (!manifestNames.has(baseName)) {
      manifestErrors.push(`agents/${filename}: not registered in agents/.claude-plugin/plugin.json`);
    }
  }
}

// Scan plugins/*/agents/ for duplicate agent files
const duplicateAgentErrors = [];
const pluginDirs = listDirs(PLUGINS_DIR);
for (const pluginDir of pluginDirs) {
  const localAgentsDir = path.join(PLUGINS_DIR, pluginDir, 'agents');
  if (fs.existsSync(localAgentsDir)) {
    const localFiles = listFiles(localAgentsDir, '.md');
    for (const f of localFiles) {
      const baseName = path.basename(f, '.md');
      if (knownAgentNames.has(baseName)) {
        duplicateAgentErrors.push(
          `plugins/${pluginDir}/agents/${f}: duplicates agents/${baseName}.md — agent files must live in agents/ only`
        );
      } else {
        duplicateAgentErrors.push(
          `plugins/${pluginDir}/agents/${f}: agent file outside agents/ directory — move to agents/ and register in plugin.json`
        );
      }
    }
  }
}

// ─── check 3: agent eval coverage and structure ────────────────────────────────

const evalDir = path.join(AGENTS_DIR, 'evals');
const agentEvalErrors = [];

for (const filename of agentFilenames) {
  const baseName = path.basename(filename, '.md');
  const evalPath = path.join(evalDir, `${baseName}.json`);

  if (!fs.existsSync(evalPath)) {
    agentEvalErrors.push(`agents/evals/${baseName}.json: missing (every agent must have an eval file)`);
    continue;
  }

  const evalData = readJSON(evalPath);
  if (!evalData) {
    agentEvalErrors.push(`agents/evals/${baseName}.json: invalid JSON`);
    continue;
  }
  if (evalData.agent_name !== baseName) {
    agentEvalErrors.push(`agents/evals/${baseName}.json: 'agent_name' is '${evalData.agent_name}', expected '${baseName}'`);
  }
  if (!Array.isArray(evalData.evals) || evalData.evals.length === 0) {
    agentEvalErrors.push(`agents/evals/${baseName}.json: 'evals' must be a non-empty array`);
    continue;
  }
  for (const scenario of evalData.evals) {
    const prefix = `agents/evals/${baseName}.json eval#${scenario.id}`;
    if (typeof scenario.id !== 'number') agentEvalErrors.push(`${prefix}: missing or non-numeric 'id'`);
    if (typeof scenario.description !== 'string' || !scenario.description) agentEvalErrors.push(`${prefix}: missing 'description'`);
    if (!scenario.input || typeof scenario.input !== 'object') agentEvalErrors.push(`${prefix}: missing or non-object 'input'`);
    if (!Array.isArray(scenario.assertions) || scenario.assertions.length === 0) agentEvalErrors.push(`${prefix}: 'assertions' must be a non-empty array`);
  }
}

// ─── check 4: skill file integrity ────────────────────────────────────────────

const skillErrors = [];
const validSkillNames = new Set();

for (const pluginDir of pluginDirs) {
  const skillMdPath = path.join(PLUGINS_DIR, pluginDir, 'skills', pluginDir, 'SKILL.md');
  const pluginJsonPath = path.join(PLUGINS_DIR, pluginDir, '.claude-plugin', 'plugin.json');

  if (!fs.existsSync(pluginJsonPath)) {
    skillErrors.push(`plugins/${pluginDir}/.claude-plugin/plugin.json: missing`);
  }

  if (!fs.existsSync(skillMdPath)) {
    skillErrors.push(`plugins/${pluginDir}/skills/${pluginDir}/SKILL.md: missing`);
    continue;
  }

  const content = readText(skillMdPath);
  const fm = parseFrontmatter(content);

  if (!fm.name) {
    skillErrors.push(`plugins/${pluginDir}/SKILL.md: missing 'name' in frontmatter`);
  } else if (fm.name !== pluginDir) {
    skillErrors.push(`plugins/${pluginDir}/SKILL.md: frontmatter name '${fm.name}' does not match directory '${pluginDir}'`);
  } else {
    validSkillNames.add(fm.name);
  }

  if (!fm.hasDescription) {
    skillErrors.push(`plugins/${pluginDir}/SKILL.md: missing 'description' in frontmatter`);
  }

  if (!fm.version) {
    skillErrors.push(`plugins/${pluginDir}/SKILL.md: missing 'metadata.version' in frontmatter`);
  }
}

// ─── check 5: marketplace registration (bidirectional) ─────────────────────────

const marketplaceErrors = [];
const marketplace = readJSON(MARKETPLACE);

if (!marketplace || !Array.isArray(marketplace.plugins)) {
  marketplaceErrors.push(`.claude-plugin/marketplace.json: missing or has no 'plugins' array`);
} else {
  const registeredSources = new Set(
    marketplace.plugins
      .filter(p => p.source && p.source.startsWith('./plugins/'))
      .map(p => p.source.replace('./plugins/', ''))
  );

  // Marketplace entries pointing to missing directories
  for (const entry of marketplace.plugins) {
    if (!entry.source) continue;
    const resolved = path.join(ROOT, entry.source.replace(/^\.\//, ''));
    if (!fs.existsSync(resolved)) {
      marketplaceErrors.push(`.claude-plugin/marketplace.json: source '${entry.source}' does not exist`);
    }
  }

  // Plugin directories not in marketplace
  for (const pluginDir of pluginDirs) {
    if (!registeredSources.has(pluginDir)) {
      marketplaceErrors.push(`plugins/${pluginDir}: not registered in .claude-plugin/marketplace.json`);
    }
  }
}

// ─── check 6: stale agent references in SKILL.md files ────────────────────────

// Build known skill names (valid skill-to-skill invocations should not be flagged)
const knownSkillNames = new Set(pluginDirs);

const refErrors = [];

for (const pluginDir of pluginDirs) {
  const skillMdPath = path.join(PLUGINS_DIR, pluginDir, 'skills', pluginDir, 'SKILL.md');
  const content = readText(skillMdPath);
  if (!content) continue;

  const refs = extractAgentRefs(content);
  for (const ref of refs) {
    // Skip valid skill-to-skill invocations
    if (knownSkillNames.has(ref)) continue;
    if (!knownAgentNames.has(ref)) {
      refErrors.push(`plugins/${pluginDir}/SKILL.md: references unknown agent '${ref}'`);
    }
  }
}

// ─── check 7: skill eval coverage (warnings) and structure ────────────────────

const evalWarnings = [];
const skillEvalErrors = [];
const missingSkillEvals = [];

for (const pluginDir of pluginDirs) {
  const evalPath = path.join(PLUGINS_DIR, pluginDir, 'skills', pluginDir, 'evals', 'evals.json');

  if (!fs.existsSync(evalPath)) {
    missingSkillEvals.push(pluginDir);
    continue;
  }

  const evalData = readJSON(evalPath);
  if (!evalData) {
    skillEvalErrors.push(`plugins/${pluginDir}/evals/evals.json: invalid JSON`);
    continue;
  }
  if (!evalData.skill_name) {
    skillEvalErrors.push(`plugins/${pluginDir}/evals/evals.json: missing 'skill_name'`);
  } else if (evalData.skill_name !== pluginDir) {
    skillEvalErrors.push(`plugins/${pluginDir}/evals/evals.json: 'skill_name' is '${evalData.skill_name}', expected '${pluginDir}'`);
  }
  if (!Array.isArray(evalData.evals) || evalData.evals.length === 0) {
    skillEvalErrors.push(`plugins/${pluginDir}/evals/evals.json: 'evals' must be a non-empty array`);
    continue;
  }
  for (const scenario of evalData.evals) {
    const prefix = `plugins/${pluginDir}/evals/evals.json eval#${scenario.id}`;
    if (typeof scenario.id !== 'number') skillEvalErrors.push(`${prefix}: missing or non-numeric 'id'`);
    if (typeof scenario.prompt !== 'string' || !scenario.prompt) skillEvalErrors.push(`${prefix}: missing 'prompt'`);
    if (typeof scenario.expected_output !== 'string' || !scenario.expected_output) skillEvalErrors.push(`${prefix}: missing 'expected_output'`);
    if (!Array.isArray(scenario.assertions) || scenario.assertions.length === 0) skillEvalErrors.push(`${prefix}: 'assertions' must be a non-empty array`);
  }
}

if (missingSkillEvals.length > 0) {
  evalWarnings.push(`${missingSkillEvals.length} plugins missing skill eval files: ${missingSkillEvals.join(', ')}`);
}

// ─── collect all errors and warnings ──────────────────────────────────────────

agentErrors.forEach(err);
manifestErrors.forEach(err);
duplicateAgentErrors.forEach(err);
agentEvalErrors.forEach(err);
skillErrors.forEach(err);
marketplaceErrors.forEach(err);
refErrors.forEach(err);
skillEvalErrors.forEach(err);
evalWarnings.forEach(warn);

// ─── report ───────────────────────────────────────────────────────────────────

const PASS = '\x1b[32m✓\x1b[0m';
const FAIL = '\x1b[31m✗\x1b[0m';
const WARN = '\x1b[33m⚠\x1b[0m';

console.log('\nvalidate.js — wordpress-design-skills integrity check\n');

// AGENTS section
console.log('AGENTS');
if (agentErrors.length === 0) {
  console.log(`  ${PASS} ${agentFilenames.length} agent files: frontmatter valid (name, description, model)`);
} else {
  agentErrors.forEach(e => console.log(`  ${FAIL} ${e}`));
}

if (manifestErrors.length === 0 && manifest) {
  console.log(`  ${PASS} ${manifest.agents.length} agents registered in plugin.json (bidirectional)`);
} else {
  manifestErrors.forEach(e => console.log(`  ${FAIL} ${e}`));
}

if (duplicateAgentErrors.length === 0) {
  console.log(`  ${PASS} No duplicate agent files found in plugins/`);
} else {
  duplicateAgentErrors.forEach(e => console.log(`  ${FAIL} ${e}`));
}

if (agentEvalErrors.length === 0) {
  console.log(`  ${PASS} ${agentFilenames.length} agent eval files: present and structurally valid`);
} else {
  agentEvalErrors.forEach(e => console.log(`  ${FAIL} ${e}`));
}

// SKILLS section
console.log('\nSKILLS');
if (skillErrors.length === 0) {
  console.log(`  ${PASS} ${pluginDirs.length} plugins: SKILL.md frontmatter valid`);
} else {
  skillErrors.forEach(e => console.log(`  ${FAIL} ${e}`));
}

if (marketplaceErrors.length === 0) {
  console.log(`  ${PASS} ${pluginDirs.length} plugins registered in marketplace.json (bidirectional)`);
} else {
  marketplaceErrors.forEach(e => console.log(`  ${FAIL} ${e}`));
}

// REFERENCES section
console.log('\nREFERENCES');
if (refErrors.length === 0) {
  console.log(`  ${PASS} No stale agent references in SKILL.md files`);
} else {
  refErrors.forEach(e => console.log(`  ${FAIL} ${e}`));
}

// EVALS section
console.log('\nEVALS');
if (skillEvalErrors.length === 0 && evalWarnings.length === 0) {
  console.log(`  ${PASS} All skill eval files structurally valid`);
} else {
  skillEvalErrors.forEach(e => console.log(`  ${FAIL} ${e}`));
  evalWarnings.forEach(w => console.log(`  ${WARN} ${w}`));
}

// MODEL SUMMARY section
console.log('\nMODEL SUMMARY');
const modelOrder = ['haiku', 'sonnet', 'opus', 'tools'];
for (const model of modelOrder) {
  const names = agentsByModel[model];
  if (!names || names.length === 0) continue;
  const label = (model === 'tools' ? 'tools (subagent)' : model).padEnd(18);
  const count = String(names.length).padStart(2);
  const list = names.sort().join(', ');
  console.log(`  ${label} (${count}): ${list}`);
}

// Count agents with invalid/missing models (not in any tier)
const accountedFor = Object.values(agentsByModel).flat().length;
if (accountedFor < agentFilenames.length) {
  const unaccounted = agentFilenames.length - accountedFor;
  console.log(`  ${FAIL} ${unaccounted} agent(s) have invalid or missing model values (see AGENTS section above)`);
}

// RESULT
const totalErrors = errors.length;
const totalWarnings = warnings.length;
console.log(`\nRESULT: ${totalErrors} error${totalErrors !== 1 ? 's' : ''}, ${totalWarnings} warning${totalWarnings !== 1 ? 's' : ''}`);

if (totalErrors > 0) {
  console.log('\nErrors must be fixed before merging. Run this script again after fixes.\n');
  process.exit(1);
} else if (totalWarnings > 0) {
  console.log('\nAll checks passed. Address warnings when possible.\n');
} else {
  console.log('\nAll checks passed.\n');
}
