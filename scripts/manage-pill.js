#!/usr/bin/env node
// Dose Pill Manager — create, edit, delete, disable, enable, list.
//
// Usage:
//   node scripts/manage-pill.js create --name cobalt --emoji 🔵 --color blue --focus "Resilience"
//   node scripts/manage-pill.js edit --name cobalt --emoji 🟦 --focus "New focus"
//   node scripts/manage-pill.js delete --name storm
//   node scripts/manage-pill.js disable --name cobalt
//   node scripts/manage-pill.js enable --name cobalt
//   node scripts/manage-pill.js list
//   node scripts/manage-pill.js list --all      # include builtin

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PILLS_REGISTRY = path.join(ROOT, "pills.json");
const SKILLS_DIR = path.join(ROOT, "skills");
const AGENTS_MD = path.join(ROOT, "AGENTS.md");
const BUILTIN = ["titan", "sage", "warden", "phantom", "void"];

// ── Helpers ─────────────────────────────────────────────────────────────────

function readRegistry() {
  try {
    return JSON.parse(fs.readFileSync(PILLS_REGISTRY, "utf8"));
  } catch {
    return { version: "1", builtin: [...BUILTIN], custom: {} };
  }
}

function writeRegistry(registry) {
  fs.writeFileSync(PILLS_REGISTRY, JSON.stringify(registry, null, 2) + "\n");
}

function getPillOrExit(name) {
  const registry = readRegistry();
  if (!registry.custom[name]) {
    console.error(`ERROR: Pill "${name}" not found.`);
    console.error(`Existing custom pills: ${Object.keys(registry.custom).join(", ") || "(none)"}`);
    process.exit(1);
  }
  return registry;
}

function updateAgentsTable(action, name, info) {
  if (!fs.existsSync(AGENTS_MD)) return;

  let agents = fs.readFileSync(AGENTS_MD, "utf8");
  const tableLine = `| **${info.emoji} ${info.name}** | **${info.Name || info.name.charAt(0).toUpperCase() + info.name.slice(1)}** | ${info.color} | ${info.focus} |`;

  if (action === "add") {
    const insertBefore = "## Common rules";
    if (agents.includes(tableLine)) return;
    if (agents.includes(insertBefore)) {
      agents = agents.replace(insertBefore, `${tableLine}\n\n${insertBefore}`);
      fs.writeFileSync(AGENTS_MD, agents);
    }
  }

  if (action === "remove") {
    agents = agents.replace(new RegExp(`\\| \\*\\*${info.emoji}.*?\\|.*?\\|.*?\\|.*?\\|\n`, "g"), "");
    agents = agents.replace(new RegExp(`\\| \\*\\*${info.emoji}.*?\\|.*?\\|.*?\\|.*?\\|\n`, "g"), "");
    fs.writeFileSync(AGENTS_MD, agents);
  }
}

// ── Commands ────────────────────────────────────────────────────────────────

function cmdCreate(args) {
  // Delegate to generate-pill.js
  const { execSync } = require("child_process");
  const genPath = path.join(__dirname, "generate-pill.js");
  const genArgs = [
    "--name", args.name,
    "--emoji", args.emoji,
    "--color", args.color,
    "--focus", `"${args.focus}"`,
  ];
  if (args.ladder) genArgs.push("--ladder", `"${args.ladder}"`);
  if (args.rules) genArgs.push("--rules", `"${args.rules}"`);

  try {
    execSync(`node "${genPath}" ${genArgs.join(" ")}`, { stdio: "inherit", shell: true });
  } catch (e) {
    process.exit(1);
  }
}

function cmdEdit(args) {
  const registry = getPillOrExit(args.name);
  const pill = registry.custom[args.name];
  let changed = false;

  if (args.emoji && args.emoji !== pill.emoji) {
    console.log(`  emoji: ${pill.emoji} → ${args.emoji}`);
    pill.emoji = args.emoji;
    changed = true;
  }
  if (args.color && args.color !== pill.color) {
    console.log(`  color: ${pill.color} → ${args.color}`);
    pill.color = args.color;
    changed = true;
  }
  if (args.focus && args.focus !== pill.focus) {
    console.log(`  focus: ${pill.focus} → ${args.focus}`);
    pill.focus = args.focus;
    changed = true;
  }

  if (!changed) {
    console.log(`No changes made to "${args.name}".`);
    return;
  }

  // Update skill file description and title
  const skillFile = path.join(SKILLS_DIR, `dose-${args.name}`, "SKILL.md");
  if (fs.existsSync(skillFile)) {
    let content = fs.readFileSync(skillFile, "utf8");
    const Name = args.name.charAt(0).toUpperCase() + args.name.slice(1);

    // Update description in frontmatter (between --- markers)
    content = content.replace(
      /description: >[\s\S]*?^(?=---)/m,
      `description: >\n  Custom Dose pill: ${Name}. ${pill.focus}\n`
    );
    // Update title line (first # heading)
    content = content.replace(
      /^# .*/m,
      `# ${pill.emoji} ${Name} — ${pill.focus}`
    );
    fs.writeFileSync(skillFile, content);
    console.log(`  Updated: skills/dose-${args.name}/SKILL.md`);
  }

  writeRegistry(registry);
  console.log(`✅ Pill "${args.name}" updated.`);
}

function cmdDelete(args) {
  const registry = getPillOrExit(args.name);
  const pill = registry.custom[args.name];
  const Name = args.name.charAt(0).toUpperCase() + args.name.slice(1);

  // Remove skill folder
  const skillDir = path.join(SKILLS_DIR, `dose-${args.name}`);
  if (fs.existsSync(skillDir)) {
    fs.rmSync(skillDir, { recursive: true, force: true });
    console.log(`  Deleted: skills/dose-${args.name}/`);
  }

  // Remove from registry
  delete registry.custom[args.name];
  writeRegistry(registry);
  console.log(`  Removed from pills.json`);

  console.log(`✅ Pill "${args.name}" deleted.`);
}

function cmdDisable(args) {
  const registry = getPillOrExit(args.name);
  registry.custom[args.name].disabled = true;
  writeRegistry(registry);
  console.log(`✅ Pill "${args.name}" disabled. Use "enable ${args.name}" to re-enable.`);
}

function cmdEnable(args) {
  const registry = getPillOrExit(args.name);
  delete registry.custom[args.name].disabled;
  writeRegistry(registry);
  console.log(`✅ Pill "${args.name}" enabled.`);
}

function cmdList(args) {
  const registry = readRegistry();
  const showAll = args.all;

  if (showAll) {
    console.log("\n📦 All pills:");
    for (const name of registry.builtin) {
      console.log(`  ● ${name} (builtin)`);
    }
  }

  const custom = registry.custom || {};
  const customKeys = Object.keys(custom);
  if (customKeys.length === 0) {
    console.log("\nNo custom pills.");
    return;
  }

  if (!showAll) console.log("\n📦 Custom pills:");
  for (const name of customKeys) {
    const p = custom[name];
    const status = p.disabled ? " (disabled)" : "";
    console.log(`  ${p.emoji || "●"} ${name} — ${p.focus}${status}`);
  }
}

// ── Parse args ──────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const cmd = argv[2];
  if (!cmd) { printHelp(); process.exit(1); }

  const args = { _command: cmd };
  for (let i = 3; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      const key = argv[i].slice(2);
      const val = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : true;
      args[key] = val;
      if (val !== true) i++;
    }
  }
  return args;
}

function printHelp() {
  console.log(`
Usage: node scripts/manage-pill.js <command> [options]

Commands:
  create    Create a new pill (delegates to generate-pill.js)
  edit      Edit pill properties (--emoji, --color, --focus)
  delete    Delete a custom pill permanently
  disable   Disable a pill (keeps files, removes from active modes)
  enable    Re-enable a disabled pill
  list      List custom pills (--all to include builtin)

Examples:
  node scripts/manage-pill.js edit --name cobalt --emoji 🟦 --focus "New focus"
  node scripts/manage-pill.js delete --name storm
  node scripts/manage-pill.js disable --name cobalt
  node scripts/manage-pill.js enable --name cobalt
  node scripts/manage-pill.js list --all
`);
}

// ── Main ────────────────────────────────────────────────────────────────────

const args = parseArgs(process.argv);
const cmd = args._command;

switch (cmd) {
  case "create":
    if (!args.name || !args.emoji || !args.color || !args.focus) {
      console.error("Usage: manage-pill.js create --name <name> --emoji <emoji> --color <color> --focus \"<focus>\"");
      process.exit(1);
    }
    cmdCreate(args);
    break;

  case "edit":
    if (!args.name) { console.error("--name required"); process.exit(1); }
    cmdEdit(args);
    break;

  case "delete":
    if (!args.name) { console.error("--name required"); process.exit(1); }
    if (!args.yes) {
      console.log(`WARNING: This will permanently delete "${args.name}".`);
      console.log(`Files: skills/dose-${args.name}/`);
      console.log(`Run with --yes to confirm.`);
      process.exit(0);
    }
    cmdDelete(args);
    break;

  case "disable":
    if (!args.name) { console.error("--name required"); process.exit(1); }
    cmdDisable(args);
    break;

  case "enable":
    if (!args.name) { console.error("--name required"); process.exit(1); }
    cmdEnable(args);
    break;

  case "list":
    cmdList(args);
    break;

  default:
    printHelp();
    process.exit(1);
}
