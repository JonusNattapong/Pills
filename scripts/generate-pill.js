#!/usr/bin/env node
// Generate a custom Dose pill: skill file, registry entry, AGENTS.md update.
//
// Usage:
//   node scripts/generate-pill.js --name cobalt --emoji 🟠 --color orange --focus "Resilience. Recovery. Graceful degradation."
//   node scripts/generate-pill.js --name storm --emoji ⚡ --color yellow --focus "Agility. Quick iterations. Prototyping."
//
// Options:
//   --name     Pill name (one word, lowercase, alphanumeric + hyphen)
//   --emoji    Single emoji for the pill
//   --color    CSS color name or hex
//   --focus    One-line focus description
//   --ladder   Comma-separated ladder rungs (optional, will generate defaults)
//   --rules    Comma-separated rules (optional, will generate defaults)

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const PILLS_REGISTRY = path.join(ROOT, "pills.json");
const SKILLS_DIR = path.join(ROOT, "skills");
const AGENTS_MD = path.join(ROOT, "AGENTS.md");
const BUILTIN = ["titan", "sage", "warden", "phantom", "void"];

// ── Parse args ──────────────────────────────────────────────────────────────
const args = {};
const raw = process.argv.slice(2);
for (let i = 0; i < raw.length; i++) {
  if (raw[i].startsWith("--")) {
    const key = raw[i].slice(2);
    const val = raw[i + 1] && !raw[i + 1].startsWith("--") ? raw[i + 1] : true;
    args[key] = val;
    if (val !== true) i++;
  }
}

const name = String(args.name || "").trim().toLowerCase();
const emoji = String(args.emoji || "🔵").trim();
const color = String(args.color || "blue").trim();
const focus = String(args.focus || "").trim();

if (!name) {
  console.error("Usage: node scripts/generate-pill.js --name <name> --emoji <emoji> --color <color> --focus \"<focus>\"");
  process.exit(1);
}

if (BUILTIN.includes(name)) {
  console.error(`ERROR: "${name}" is a built-in pill. Choose another name.`);
  process.exit(1);
}

if (!/^[a-z][a-z0-9-]*$/.test(name)) {
  console.error('ERROR: Pill name must be one word, lowercase, alphanumeric + hyphens only.');
  process.exit(1);
}

const Name = name.charAt(0).toUpperCase() + name.slice(1);
const skillDir = path.join(SKILLS_DIR, `dose-${name}`);
const skillFile = path.join(skillDir, "SKILL.md");

// Check for existing
if (fs.existsSync(skillFile)) {
  console.error(`ERROR: Pill "${name}" already exists at ${skillFile}`);
  process.exit(1);
}

// ── Generate ladder & rules ─────────────────────────────────────────────────
// Ladder: if provided via --ladder, split by "|"
const ladderLines = args.ladder
  ? String(args.ladder).split("|").map((s, i) => `${i + 1}. ${s.trim()}`)
  : [
      "1. **Does this need to exist?** YAGNI.",
      "2. **Stdlib does it?** Use it.",
      "3. **Native platform feature?** Use it.",
      `4. **${Name} rung.** Apply the ${name} approach.`,
      `5. **Only then:** the minimum code that works for ${name}.`,
    ];

// Rules: if provided via --rules, split by "|"
const rulesLines = args.rules
  ? String(args.rules).split("|").map((s) => `- ${s.trim()}`)
  : [
      `- Follow the ${name} philosophy: ${focus}`,
      `- Mark shortcuts with \`dose: ${name} — <ceiling>, <upgrade path>\`.`,
    ];

// ── Create skill file ───────────────────────────────────────────────────────
const skillContent = `---
name: dose-${name}
description: >
  Custom Dose pill: ${Name}. ${focus}
---

# ${emoji} ${Name} — ${focus}

## Ladder

Stop at the first rung that holds:

${ladderLines.join("\n")}

## Rules

${rulesLines.join("\n")}

## Boundaries

This pill governs ${name} approach. Safety, security, and accessibility
are never simplified away. Non-trivial logic leaves one runnable check.
"normal mode": revert.
`;

fs.mkdirSync(skillDir, { recursive: true });
fs.writeFileSync(skillFile, skillContent);
console.log(`✅ Created: skills/dose-${name}/SKILL.md`);

// ── Register in pills.json ──────────────────────────────────────────────────
let registry = { version: "1", builtin: BUILTIN, custom: {} };
try { registry = JSON.parse(fs.readFileSync(PILLS_REGISTRY, "utf8")); } catch {}

registry.custom[name] = {
  name,
  emoji,
  color,
  focus,
  created: new Date().toISOString().split("T")[0],
};

fs.writeFileSync(PILLS_REGISTRY, JSON.stringify(registry, null, 2) + "\n");
console.log(`✅ Updated: pills.json — registered "${name}"`);

// ── Update AGENTS.md ────────────────────────────────────────────────────────
if (fs.existsSync(AGENTS_MD)) {
  let agents = fs.readFileSync(AGENTS_MD, "utf8");

  // Add to the pills table (before the "Common rules" section)
  const tableLine = `| **${emoji} ${Name}** | **${Name}** | ${color} | ${focus} |`;
  const insertBefore = "## Common rules";

  if (agents.includes(tableLine)) {
    console.log(`ℹ️  ${AGENTS_MD} already has this pill.`);
  } else if (agents.includes(insertBefore)) {
    agents = agents.replace(
      insertBefore,
      `${tableLine}\n\n${insertBefore}`
    );
    fs.writeFileSync(AGENTS_MD, agents);
    console.log(`✅ Updated: AGENTS.md`);
  }

  // Add ladder section
  const ladderSection = `\n### ${Name} (${emoji}) — ${focus} ladder\n\n1. YAGNI\n2. Stdlib\n3. Native\n4. ${Name} approach\n5. Minimum ${name} code.\n`;
  const beforeSwitch = "## Switch pills";
  if (agents.includes(beforeSwitch)) {
    agents = fs.readFileSync(AGENTS_MD, "utf8");
    agents = agents.replace(beforeSwitch, `${ladderSection}\n${beforeSwitch}`);
    fs.writeFileSync(AGENTS_MD, agents);
    console.log(`✅ Updated: AGENTS.md — added ladder section`);
  }
}

// ── Done ────────────────────────────────────────────────────────────────────
console.log(`\n✨ Pill "${name}" (${emoji} ${Name}) created!`);
console.log(`   Pop it:  /dose ${name}  or  pop ${name}`);
console.log(`   Skill:   skills/dose-${name}/SKILL.md`);
console.log(`   Config:  pills.json`);
