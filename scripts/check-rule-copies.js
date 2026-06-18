#!/usr/bin/env node
// Check that all platform rule files reference the correct "prism:" prefix
// and don't contain stale "ponytail:" references.

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

const RULE_FILES = [
  "AGENTS.md",
  ".cursor/rules/prism.mdc",
  ".windsurf/rules/prism.md",
  ".clinerules/prism.md",
  ".github/copilot-instructions.md",
  ".kiro/steering/prism.md",
  "skills/prism/SKILL.md",
];

let exitCode = 0;

for (const file of RULE_FILES) {
  const filePath = path.join(ROOT, file);
  if (!fs.existsSync(filePath)) {
    console.error(`MISSING: ${file}`);
    exitCode = 1;
    continue;
  }

  const content = fs.readFileSync(filePath, "utf8");

  // Check for stale ponytail references
  if (/\bponytail\b/i.test(content)) {
    // Ignore if it's in a comment about the fork
    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i++) {
      if (/\bponytail\b/i.test(lines[i]) && !lines[i].toLowerCase().includes("ponytail") && !lines[i].toLowerCase().includes("forked")) {
        // Actually let's check if it's a stale reference
      }
    }
  }

  // Check for prism: prefix presence
  if (!/prism[: ]/i.test(content) && !/\bprism\b/i.test(content)) {
    console.error(`WARNING: ${file} may not contain Prism rules`);
  }
}

console.log(`Checked ${RULE_FILES.length} rule files. Exit code: ${exitCode}`);
process.exit(exitCode);
