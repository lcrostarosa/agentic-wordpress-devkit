#!/usr/bin/env node
// tools/lint/index.js
// Zero-dependency Node.js 20+ linter for wordpress-design-skills.
// Usage: node tools/lint/index.js
// Exits 1 if any ERRORs are found. WARNings are printed but do not fail.

'use strict';

const fs = require('fs');
const path = require('path');

// ─── constants ────────────────────────────────────────────────────────────────

const ROOT               = path.resolve(__dirname, '../..');
const PLUGINS_DIR        = path.join(ROOT, 'plugins');
const AGENTS_DIR         = path.join(ROOT, 'agents');
const MARKETPLACE_PATH   = path.join(ROOT, '.claude-plugin/marketplace.json');
const AGENTS_PLUGIN_PATH = path.join(ROOT, 'agents/.claude-plugin/plugin.json');

const INTAKE_RE      = /^## (Context Gathering|Initial Assessment|Before Writing|Before Planning)/m;
const AGENT_PREFIXES = ['wp-', 'market-', 'content-', 'blog-', 'chatbot-', 'ab-', 'copy-', 'ai-'];
const VALID_MODELS   = new Set(['haiku', 'sonnet', 'opus']);
const AGENT_SECTIONS = ['## Input', '## Output', '## Error Handling', '## Rules'];

// ─── state ────────────────────────────────────────────────────────────────────

const errors   = [];
const warnings = [];

// ─── manifests ────────────────────────────────────────────────────────────────

const marketplace       = JSON.parse(readFile(MARKETPLACE_PATH) || '{}');
const registeredPlugins = new Set(
  (marketplace.plugins || []).map(p => p.name).filter(n => n && n !== 'agents')
);

const agentsPlugin       = JSON.parse(readFile(AGENTS_PLUGIN_PATH) || '{}');
const registeredAgentPaths = new Set(agentsPlugin.agents || []);
const registeredAgentNames = new Set(
  [...registeredAgentPaths].map(p => path.basename(p, '.md'))
);

// ─── run ──────────────────────────────────────────────────────────────────────

lintSkills();
lintAgents();
checkReferences();
report();

// ─── lint ─────────────────────────────────────────────────────────────────────

function lintSkills() {
  const pluginDirs = readdirSafe(PLUGINS_DIR).filter(d => isDirectory(path.join(PLUGINS_DIR, d)));

  for (const pluginName of pluginDirs) {
    const skillFile = path.join(PLUGINS_DIR, pluginName, 'skills', pluginName, 'SKILL.md');
    const rel       = path.relative(ROOT, skillFile);

    if (!exists(skillFile)) { err(rel, 'SKILL.md not found'); continue; }

    const parsed = parseContent(skillFile, rel, 'expected opening ---...--- block');
    if (!parsed) continue;
    const { content, fm } = parsed;

    checkName(fm, rel, pluginName, 'directory');
    checkDescription(fm, rel, 20);

    if (!fm.version)
      err(rel, 'frontmatter missing `metadata.version`');
    else if (!isValidSemver(fm.version))
      err(rel, `invalid semver in metadata.version: "${fm.version}"`);

    if (!registeredPlugins.has(pluginName))
      err(rel, `not registered in .claude-plugin/marketplace.json`);

    if (!/^## Output Rules/m.test(content))
      err(rel, 'missing required "## Output Rules" section');

    if (!INTAKE_RE.test(content))
      warn(rel, 'no intake section found (expected "## Context Gathering" or similar)');

    // Only flag refs with a known agent prefix + at least one more segment (length >= 10)
    // to filter out bare prefixes like `wp-`, `blog-`, `market-` used as examples in guide text.
    const backtickRefs = [...content.matchAll(/`([a-z][a-z0-9-]{2,})`/g)].map(m => m[1]);
    for (const ref of backtickRefs) {
      if (
        ref.length >= 10 &&
        !ref.includes('/') &&
        !ref.includes('.') &&
        AGENT_PREFIXES.some(p => ref.startsWith(p)) &&
        !registeredAgentNames.has(ref)
      ) {
        warn(rel, `references unknown agent \`${ref}\``);
      }
    }
  }
}

function lintAgents() {
  const agentFiles = readdirSafe(AGENTS_DIR).filter(f => f.endsWith('.md'));

  for (const agentFile of agentFiles) {
    const filePath  = path.join(AGENTS_DIR, agentFile);
    const rel       = path.relative(ROOT, filePath);
    const agentName = path.basename(agentFile, '.md');

    const parsed = parseContent(filePath, rel);
    if (!parsed) continue;
    const { content, fm } = parsed;

    checkName(fm, rel, agentName, 'filename');
    checkDescription(fm, rel, 10);

    if (!fm.model)
      err(rel, 'frontmatter missing `model`');
    else if (!VALID_MODELS.has(fm.model))
      err(rel, `invalid model "${fm.model}" — must be haiku, sonnet, or opus`);

    const agentPath = `./agents/${agentFile}`;
    if (!registeredAgentPaths.has(agentPath))
      err(rel, `not registered in agents/.claude-plugin/plugin.json`);

    checkSections(content, rel, AGENT_SECTIONS);
  }
}

function checkReferences() {
  // marketplace.json → disk
  for (const plugin of (marketplace.plugins || [])) {
    if (!plugin.name || plugin.name === 'agents') continue;
    if (!exists(path.join(PLUGINS_DIR, plugin.name)))
      err('.claude-plugin/marketplace.json', `plugin "${plugin.name}" has no directory plugins/${plugin.name}/`);
  }

  // agents plugin.json → disk
  for (const agentPath of (agentsPlugin.agents || [])) {
    if (!exists(path.join(ROOT, agentPath)))
      err('agents/.claude-plugin/plugin.json', `agent path "${agentPath}" not found on disk`);
  }
}

function report() {
  const all = [...errors, ...warnings];
  if (all.length > 0) console.log(all.join('\n'));
  console.log(`\n${errors.length} error(s), ${warnings.length} warning(s)`);
  if (errors.length > 0) process.exit(1);
}

// ─── validators ───────────────────────────────────────────────────────────────

/** Read, non-empty check, and frontmatter parse in one step. Returns null on failure (error recorded). */
function parseContent(filePath, rel, fmNote = '') {
  const content = readFile(filePath) || '';
  if (content.trim().length === 0) { err(rel, 'file is empty'); return null; }
  const fm = parseFrontmatter(content);
  if (!fm) {
    err(rel, `missing or malformed frontmatter${fmNote ? ` (${fmNote})` : ''}`);
    return null;
  }
  return { content, fm };
}

function checkName(fm, rel, expectedName, context) {
  if (!fm.name)
    err(rel, 'frontmatter missing `name`');
  else if (fm.name !== expectedName)
    err(rel, `frontmatter name "${fm.name}" does not match ${context} "${expectedName}"`);
}

function checkDescription(fm, rel, minLength) {
  if (!fm.description || fm.description.length < minLength)
    err(rel, 'frontmatter `description` missing or too short');
}

function checkSections(content, rel, sections) {
  for (const section of sections)
    if (!content.includes(section))
      err(rel, `missing required section "${section}"`);
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function err(file, msg)  { errors.push(`[ERROR] ${file} — ${msg}`); }
function warn(file, msg) { warnings.push(`[WARN]  ${file} — ${msg}`); }

function readFile(filePath) {
  try { return fs.readFileSync(filePath, 'utf8'); } catch { return null; }
}

function exists(filePath) {
  try { fs.statSync(filePath); return true; } catch { return false; }
}

function isDirectory(filePath) {
  try { return fs.statSync(filePath).isDirectory(); } catch { return false; }
}

function readdirSafe(dirPath) {
  try { return fs.readdirSync(dirPath); } catch { return []; }
}

/** Minimal line-based YAML parser — handles inline values, `>` folded blocks, and nested mappings */
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const lines = match[1].split('\n');
  const result = {};
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const top = line.match(/^([a-zA-Z][\w-]*):\s*(.*)/);
    if (!top) { i++; continue; }

    const key = top[1];
    const val = top[2].trim();

    if (val === '>' || val === '|') {
      // Multi-line block scalar — collect all indented lines
      const parts = [];
      i++;
      while (i < lines.length && /^\s/.test(lines[i])) {
        const t = lines[i].trim();
        if (t) parts.push(t);
        i++;
      }
      result[key] = parts.join(' ');
    } else if (val === '') {
      // Nested mapping (e.g., metadata:\n  version: x)
      i++;
      while (i < lines.length && /^\s/.test(lines[i])) {
        const sub = lines[i].match(/^\s+([a-zA-Z][\w-]*):\s*(.*)/);
        if (sub) result[`${key}.${sub[1]}`] = sub[2].trim();
        i++;
      }
    } else {
      result[key] = stripYamlQuotes(val);
      i++;
    }
  }

  // Strip quotes from all scalar values in result
  for (const k of Object.keys(result)) {
    if (typeof result[k] === 'string') result[k] = stripYamlQuotes(result[k]);
  }

  return {
    name:        result.name        || null,
    description: result.description || null,
    version:     result['metadata.version'] || result.version || null,
    model:       result.model       || null,
  };
}

function isValidSemver(v) { return /^\d+\.\d+\.\d+$/.test(v); }

/** Strip surrounding YAML quotes from a scalar value (e.g., "1.0.0" → 1.0.0) */
function stripYamlQuotes(v) { return v.replace(/^(['"])(.*)\1$/, '$2'); }
